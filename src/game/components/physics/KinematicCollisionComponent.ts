import type { I_MeshProvider } from "@/game/common/mesh.types";
import type { I_SceneContext } from "@/game/common/scenes.types";
import { DebugLabelComponent } from "@/game/components/debug/DebugLabelComponent";
import { CollisionComponent, I_CollisionConfig } from "@/game/components/physics/CollisionComponent";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { TRAIT } from "@/game/GameComponent";
import { CollisionShapeFactory } from "@/game/utils/CollisionShapeFactory";
import { DataStore } from "@/stores/DataStore";
import { Mesh, type Object3D } from "three";

export interface I_KinematicPhysicsConfig extends I_CollisionConfig {
	// Note: `shape` is inherited from I_CollisionConfig (recommended for sprites)
	// Note: `debugShape` and `debugColor` are inherited from I_CollisionConfig

	/**
	 * Lazy getter for physics body mesh (called during init)
	 * DEPRECATED: Use inline `shape` config instead
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
 * Shape Resolution Priority:
 * 1. Inline shape config (recommended for sprites)
 * 2. Explicit getMesh config function (deprecated)
 * 3. MESH_PROVIDER trait (MeshComponent, SpriteComponent - fallback)
 *
 * Usage with inline shape (recommended for sprites):
 * ```typescript
 * gameObject
 *   .addComponent(new SpriteComponent({ texture: '/sprites/knight.png' }))
 *   .addComponent(new KinematicCollisionComponent({
 *     type: 'static',
 *     shape: { type: 'capsule', radius: 0.3, height: 1.5, offset: [0, 0.75, 0] },
 *     initialPosition: [0, 1, 0],
 *     characterOptions: { enableAutostep: true },
 *     debugShape: true  // Show wireframe visualization
 *   }));
 * ```
 *
 * Usage with mesh-based objects (collision derived from mesh geometry):
 * ```typescript
 * gameObject.addComponent(new KinematicCollisionComponent({
 *   type: 'static',
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

		// Add debug wireframe mesh if requested (only for inline shape config)
		if (this.config.debugShape && this.config.shape) {
			const debugMesh = CollisionShapeFactory.createDebugMesh(this.config.shape, this.config.debugColor);
			const transform = this.getComponent(TransformComponent);
			if (transform) {
				debugMesh.position.copy(transform.position);
				debugMesh.position.x += offset[0];
				debugMesh.position.y += offset[1];
				debugMesh.position.z += offset[2];
			}
			context.scene.add(debugMesh);
			context.cleanupRegistry.registerObject(debugMesh);
		}

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
	 * 1. Inline shape config (recommended for sprites) - creates geometry via CollisionShapeFactory
	 * 2. Explicit getMesh config (deprecated) - offset is [0,0,0]
	 * 3. MESH_PROVIDER trait (MeshComponent, SpriteComponent) - offset is [0,0,0]
	 */
	private resolveMeshAndOffset(): { mesh: Mesh | Object3D; offset: [number, number, number] } {
		// Priority 1: Inline shape config (recommended for sprites)
		if (this.config.shape) {
			const geometry = CollisionShapeFactory.createGeometry(this.config.shape);
			const mesh = new Mesh(geometry);
			const offset = this.config.shape.offset ?? [0, 0, 0];
			return { mesh, offset };
		}

		// Priority 2: Explicit getMesh config (deprecated)
		if (this.kinematicConfig.getMesh) {
			const mesh = this.kinematicConfig.getMesh();
			if (!mesh) {
				throw new Error(`[KinematicCollisionComponent] GameObject "${this.gameObject.id}" getMesh() returned null/undefined`);
			}
			return { mesh, offset: [0, 0, 0] };
		}

		// Priority 3: MESH_PROVIDER trait (MeshComponent, SpriteComponent)
		const meshProvider = this.findByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		if (meshProvider) {
			return { mesh: meshProvider.getMesh(), offset: [0, 0, 0] };
		}

		throw new Error(
			`[KinematicCollisionComponent] GameObject "${this.gameObject.id}" has no collision shape.\n\n` +
				`For sprites, add inline shape config:\n` +
				`  new KinematicCollisionComponent({\n` +
				`    shape: { type: 'capsule', radius: 0.3, height: 1.5, offset: [0, 0.75, 0] },\n` +
				`    ...\n` +
				`  })\n\n` +
				`For mesh-based objects, add MeshComponent before KinematicCollisionComponent.`,
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
