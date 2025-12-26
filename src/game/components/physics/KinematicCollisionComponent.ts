import type { I_CollisionMeshProvider, I_MeshProvider } from "@/game/common/mesh.types";
import type { I_SceneContext } from "@/game/common/scenes.types";
import { DebugLabelComponent } from "@/game/components/debug/DebugLabelComponent";
import { CollisionComponent, I_CollisionConfig } from "@/game/components/physics/CollisionComponent";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { TRAIT } from "@/game/GameComponent";
import { DataStore } from "@/stores/DataStore";
import { type Mesh, type Object3D } from "three";

export interface I_KinematicPhysicsConfig extends I_CollisionConfig {
	/**
	 * Lazy getter for physics body mesh (called during init)
	 * Optional - if not provided, component will look for:
	 * 1. COLLISION_MESH_PROVIDER trait (CollisionProxyComponent)
	 * 2. MESH_PROVIDER trait (MeshComponent, SpriteComponent)
	 */
	getMesh?: () => Mesh | Object3D;
	initialPosition?: [number, number, number]; // Starting position for physics body
	characterOptions?: {
		enableAutostep?: boolean;
		enableSnapToGround?: boolean;
		maxStepHeight?: number;
		minStepWidth?: number;
		snapToGroundDistance?: number;
	};
}

/**
 * KinematicCollisionComponent - Kinematic character controller with collision detection
 *
 * Extends CollisionComponent to add kinematic movement capabilities:
 * - Ground detection (isGrounded)
 * - Collision-aware movement computation
 * - Auto-step and ground snapping
 *
 * Used by KinematicMovementComponent for collision-aware movement.
 *
 * Mesh Resolution Priority:
 * 1. Explicit getMesh config function (if provided)
 * 2. COLLISION_MESH_PROVIDER trait (CollisionProxyComponent - recommended for sprites)
 * 3. MESH_PROVIDER trait (MeshComponent, SpriteComponent - fallback)
 *
 * Usage with CollisionProxyComponent (recommended for sprites):
 * ```typescript
 * gameObject
 *   .addComponent(new SpriteComponent({ texture: '/sprites/knight.png' }))
 *   .addComponent(new CollisionProxyComponent({ shape: 'capsule', radius: 0.3, height: 1.5 }))
 *   .addComponent(new KinematicCollisionComponent({
 *     type: 'static',
 *     initialPosition: [0, 1, 0],
 *     characterOptions: { enableAutostep: true }
 *   }));
 * ```
 *
 * Usage with explicit getMesh:
 * ```typescript
 * gameObject.addComponent(new KinematicCollisionComponent({
 *   type: 'static',
 *   getMesh: () => this.getComponent(CharacterMeshComponent)!.bodyMesh,
 *   initialPosition: [0, 1, 0]
 * }));
 * ```
 */
export class KinematicCollisionComponent extends CollisionComponent {
	private kinematicConfig: I_KinematicPhysicsConfig;
	protected collisionOffset: [number, number, number] = [0, 0, 0];

	constructor(config: I_KinematicPhysicsConfig) {
		super({ ...config, type: "static" }); // Base class needs type, but we override registration
		this.kinematicConfig = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;
		const physics = context.getService("physics");

		// Check if physics service is ready
		if (!physics.isReady()) {
			console.warn(`[KinematicCollisionComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`);
			return;
		}

		// Resolve mesh and offset using priority order
		const { mesh, offset } = this.resolveMeshAndOffset();

		// Calculate initial position: transform position + collision offset
		// The offset ensures the physics body center is at the correct height
		const transform = this.getComponent(TransformComponent);
		const basePos = transform ? transform.getPositionArray() : [0, 0, 0];
		const initialPos: [number, number, number] = [basePos[0] + offset[0], basePos[1] + offset[1], basePos[2] + offset[2]];

		// Store offset for position updates
		this.collisionOffset = offset;

		// Register kinematic character with PhysicsService
		physics.registerKinematicFromMesh(
			this.gameObject.id,
			mesh,
			initialPos,
			this.kinematicConfig.characterOptions || {
				enableAutostep: true,
				enableSnapToGround: true,
				maxStepHeight: 0.5,
				minStepWidth: 0.2,
				snapToGroundDistance: 0.5,
			},
		);

		// Register collision callbacks
		this.registerCallbacks();

		// Add debug label if global physics debug is enabled
		if (DataStore.settings.debug.showPhysicsDebug) {
			const labelComp = new DebugLabelComponent({ text: this.gameObject.id, variant: "collision" });
			this.gameObject.addComponent(labelComp);
			await labelComp.init(context);
		}

		this.isRegistered = true;
	}

	/**
	 * Resolve mesh and offset using priority order:
	 * 1. Explicit getMesh config (if provided) - offset is [0,0,0]
	 * 2. COLLISION_MESH_PROVIDER trait (CollisionProxyComponent) - gets offset from component
	 * 3. MESH_PROVIDER trait (MeshComponent, SpriteComponent) - offset is [0,0,0]
	 */
	private resolveMeshAndOffset(): { mesh: Mesh | Object3D; offset: [number, number, number] } {
		// Priority 1: Explicit getMesh config
		if (this.kinematicConfig.getMesh) {
			const mesh = this.kinematicConfig.getMesh();
			if (!mesh) {
				throw new Error(`[KinematicCollisionComponent] GameObject "${this.gameObject.id}" getMesh() returned null/undefined`);
			}
			return { mesh, offset: [0, 0, 0] };
		}

		// Priority 2: COLLISION_MESH_PROVIDER trait (CollisionProxyComponent)
		const collisionProvider = this.findByTrait<I_CollisionMeshProvider>(TRAIT.COLLISION_MESH_PROVIDER);
		if (collisionProvider) {
			// Check if provider has getOffset method (CollisionProxyComponent does)
			const offset: [number, number, number] =
				"getOffset" in collisionProvider && typeof collisionProvider.getOffset === "function"
					? (collisionProvider as { getOffset(): [number, number, number] }).getOffset()
					: [0, 0, 0];
			return { mesh: collisionProvider.getCollisionMesh(), offset };
		}

		// Priority 3: MESH_PROVIDER trait (MeshComponent, SpriteComponent)
		const meshProvider = this.findByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		if (meshProvider) {
			return { mesh: meshProvider.getMesh(), offset: [0, 0, 0] };
		}

		throw new Error(
			`[KinematicCollisionComponent] GameObject "${this.gameObject.id}" requires one of: getMesh config, CollisionProxyComponent, or a MeshProvider (MeshComponent/SpriteComponent)`,
		);
	}

	/**
	 * Get the collision offset (used by KinematicMovementComponent to adjust positions)
	 */
	public getCollisionOffset(): [number, number, number] {
		return [...this.collisionOffset];
	}

	/**
	 * Compute collision-corrected movement using Rapier's character controller
	 * @param desiredMovement Desired movement delta {x, y, z}
	 * @returns Corrected movement vector after collision detection
	 */
	public computeCollision(desiredMovement: { x: number; y: number; z: number }): { x: number; y: number; z: number } | null {
		if (!this.isRegistered || !this.context) return null;
		const physics = this.context.getService("physics");
		const controller = physics.getKinematicController(this.gameObject.id);
		const collider = physics.getCollider(this.gameObject.id);

		if (!controller || !collider) return null;

		// Use Rapier to compute collision-corrected movement
		controller.computeColliderMovement(collider, desiredMovement);
		const correctedMovement = controller.computedMovement();

		return {
			x: correctedMovement.x,
			y: correctedMovement.y,
			z: correctedMovement.z,
		};
	}

	/**
	 * Check if character is on the ground (call after computeColliderMovement)
	 */
	public isGrounded(): boolean {
		if (!this.isRegistered || !this.context) return false;
		const physics = this.context.getService("physics");

		const controller = physics.getKinematicController(this.gameObject.id);
		return controller?.computedGrounded() ?? false;
	}

	/**
	 * Apply computed position to physics body
	 */
	public applyPosition(position: { x: number; y: number; z: number }): void {
		if (!this.isRegistered || !this.context) return;
		const physics = this.context.getService("physics");
		physics.applyKinematicTranslation(this.gameObject.id, position);
	}
}
