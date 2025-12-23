import type { I_CollisionMeshProvider, I_MeshProvider } from "@/game/common/mesh.types";
import { I_SceneContext } from "@/game/common/scenes.types";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";
import { InstancedMeshComponent } from "../rendering/InstancedMeshComponent";

export interface I_CollisionConfig {
	type: "static" | "dynamic" | "trigger";
	shape?: "cuboid" | "sphere" | "capsule" | "cylinder";
	shapeParams?: number[]; // Explicit shape dimensions (e.g., [halfWidth, halfHeight, halfDepth] for cuboid)
	showDebug?: boolean;

	// Collision callbacks
	onCollisionEnter?: (otherId: string) => void;
	onCollisionStay?: (otherId: string) => void;
	onCollisionExit?: (otherId: string) => void;
}

/**
 * CollisionComponent - Registers GameObject collision bodies with PhysicsService
 *
 * This component is for static/dynamic/trigger colliders only.
 * For player character controllers, use KinematicCollisionComponent instead.
 *
 * Types:
 * - static: Immovable objects (walls, ground, obstacles)
 * - dynamic: Moving objects with physics (future: ragdolls, projectiles with physics)
 * - trigger: Ghost collider (detects collision but doesn't block, for projectiles/pickups)
 *
 * Mesh Resolution Priority:
 * 1. Explicit shape + shapeParams config
 * 2. COLLISION_MESH_PROVIDER trait (CollisionProxyComponent - recommended for sprites)
 * 3. MESH_PROVIDER trait (MeshComponent, SpriteComponent - fallback)
 * 4. InstancedMeshComponent (for instanced objects)
 *
 * Usage:
 * ```typescript
 * // Static wall with explicit shape (no mesh required)
 * new CollisionComponent({
 *   type: 'static',
 *   shape: 'cuboid',
 *   shapeParams: [20, 10, 0.25], // Half-extents: [halfWidth, halfHeight, halfDepth]
 *   showDebug: true
 * });
 *
 * // Static NPC with CollisionProxyComponent (recommended for sprites)
 * gameObject
 *   .addComponent(new SpriteComponent({ texture: '/sprites/npc.png' }))
 *   .addComponent(new CollisionProxyComponent({ shape: 'cylinder', radius: 0.4, height: 1.2 }))
 *   .addComponent(new CollisionComponent({ type: 'static' })); // Uses collision proxy automatically
 *
 * // Static wall deriving collision from mesh geometry
 * new CollisionComponent({ type: 'static' });
 * ```
 *
 * IMPORTANT: shapeParams use HALF-EXTENTS convention (divide full dimensions by 2)
 */
export class CollisionComponent extends GameComponent {
	public readonly priority = ComponentPriority.PHYSICS; // 200 - depends on mesh

	protected config: I_CollisionConfig;
	protected isRegistered = false;
	protected instanceIds: string[] = []; // Track physics IDs for instanced meshes
	protected context: I_SceneContext | null = null;

	constructor(config: I_CollisionConfig = { type: "static" }) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;
		const physics = context.getService("physics");

		// Check if physics service is ready
		if (!physics.isReady()) {
			console.warn(`[CollisionComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`);
			return;
		}

		// Get mesh providers (optional - can use explicit shape params instead)
		const collisionMeshProvider = this.findByTrait<I_CollisionMeshProvider>(TRAIT.COLLISION_MESH_PROVIDER);
		const meshProvider = this.findByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		const instancedMeshComp = this.getComponent(InstancedMeshComponent);
		const transformComp = this.getComponent(TransformComponent);

		// Register collider with physics service using priority order:
		// 1. Explicit shape + shapeParams
		// 2. COLLISION_MESH_PROVIDER (CollisionProxyComponent)
		// 3. MESH_PROVIDER (MeshComponent, SpriteComponent)
		// 4. InstancedMeshComponent
		if (this.config.shape && this.config.shapeParams) {
			// Explicit shape registration
			// shapeParams are half-extents: [halfWidth, halfHeight, halfDepth]
			// Convert to full dimensions for registerStatic
			const position = transformComp?.getPositionArray() || [0, 0, 0];
			// Note: Don't apply transform rotation for explicit shapes - shapeParams already
			// define the shape in world-space orientation. Using transform rotation would
			// incorrectly rotate colliders (e.g., ground plane rotation would turn floor into wall)
			const rotation: [number, number, number] = [0, 0, 0];

			const fullSize = this.config.shapeParams.map((halfExtent) => halfExtent * 2) as [number, number, number];

			physics.registerStatic(
				this.gameObject.id,
				{
					shape: this.config.shape,
					size: fullSize, // Full dimensions
					position,
					rotation,
				},
				{ showDebug: this.config.showDebug },
			);
		} else if (collisionMeshProvider) {
			// CollisionProxyComponent (recommended for sprites)
			physics.registerStaticFromMesh(this.gameObject.id, collisionMeshProvider.getCollisionMesh(), {
				showDebug: this.config.showDebug,
			});
		} else if (meshProvider) {
			// Single mesh registration (derive collision from mesh geometry)
			physics.registerStaticFromMesh(this.gameObject.id, meshProvider.getMesh(), {
				showDebug: this.config.showDebug,
			});
		} else if (instancedMeshComp) {
			// Instanced mesh registration (multiple static bodies)
			this.instanceIds = physics.registerInstancedStatic(this.gameObject.id, instancedMeshComp.instancedMesh);
		} else {
			throw new Error(
				`[CollisionComponent] GameObject "${this.gameObject.id}" requires one of: (1) shape + shapeParams, (2) CollisionProxyComponent, (3) MeshProvider, or (4) InstancedMeshComponent`,
			);
		}

		// Register collision callbacks if provided
		this.registerCallbacks();

		this.isRegistered = true;
	}

	/**
	 * Register collision callbacks with PhysicsService
	 * Can be overridden by subclasses
	 */
	protected registerCallbacks(): void {
		if (!this.context) return;
		const physics = this.context.getService("physics");

		if (this.config.onCollisionEnter || this.config.onCollisionStay || this.config.onCollisionExit) {
			physics.registerCollisionCallbacks(this.gameObject.id, {
				onCollisionEnter: this.config.onCollisionEnter,
				onCollisionStay: this.config.onCollisionStay,
				onCollisionExit: this.config.onCollisionExit,
			});
		}
	}

	/**
	 * Update physics body position (for drag, teleport, etc.)
	 */
	public updatePosition(x: number, y: number, z: number): void {
		if (!this.isRegistered || !this.context) return;
		const physics = this.context.getService("physics");
		physics.setPosition(this.gameObject.id, { x, y, z });
	}

	/**
	 * Get current position from physics
	 */
	public getPosition(): { x: number; y: number; z: number } | null {
		if (!this.isRegistered || !this.context) return null;
		const physics = this.context.getService("physics");
		return physics.getPosition(this.gameObject.id);
	}

	public destroy(): void {
		if (this.isRegistered) {
			// For instanced meshes, cleanup individual instance physics bodies
			if (this.instanceIds.length > 0) {
				this.instanceIds = [];
			}

			// Remove physics body from world
			const physics = this.context?.getService("physics");
			if (physics) {
				physics.remove(this.gameObject.id);
			}

			this.isRegistered = false;
			this.context = null;
		}
	}
}
