import type { I_MeshProvider } from "@/game/common/mesh.types";
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
 * For player character controllers, use KinematicPhysicsComponent instead.
 *
 * Types:
 * - static: Immovable objects (walls, ground, obstacles)
 * - dynamic: Moving objects with physics (future: ragdolls, projectiles with physics)
 * - trigger: Ghost collider (detects collision but doesn't block, for projectiles/pickups)
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
 * // Static wall deriving collision from mesh geometry
 * new CollisionComponent({ type: 'static' });
 *
 * // Trigger projectile (detects hits, doesn't block)
 * new CollisionComponent({
 *   type: 'trigger',
 *   shape: 'sphere',
 *   shapeParams: [0.5], // Half-extents: [radius]
 *   onCollisionEnter: (otherId) => console.log('Hit:', otherId),
 *   onCollisionExit: (otherId) => console.log('Stopped touching:', otherId)
 * });
 * ```
 *
 * Dependencies:
 * - Option 1: Provide shape + shapeParams (no mesh required, must NOT have I_MeshProvider)
 * - Option 2: Requires I_MeshProvider (MeshComponent, SpriteComponent) OR InstancedMeshComponent
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

		// Get mesh provider (optional - can use explicit shape params instead)
		const meshProvider = this.findByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		const instancedMeshComp = this.getComponent(InstancedMeshComponent);
		const TransformComponentClass = TransformComponent;
		const transformComp = this.getComponent(TransformComponentClass);

		// Register collider with physics service
		if (this.config.shape && this.config.shapeParams && !meshProvider && !instancedMeshComp) {
			// Explicit shape registration (no mesh required)
			// shapeParams are half-extents: [halfWidth, halfHeight, halfDepth]
			// Convert to full dimensions for registerStatic
			const position = transformComp?.getPositionArray() || [0, 0, 0];
			const rotation = transformComp?.getRotationArray() || [0, 0, 0];

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
		} else if (meshProvider) {
			// Single mesh registration (derive collision from mesh geometry)
			physics.registerStaticFromMesh(this.gameObject.id, meshProvider.getMesh(), {
				showDebug: this.config.showDebug,
			});
		} else if (instancedMeshComp) {
			// Instanced mesh registration (multiple static bodies)
			this.instanceIds = physics.registerInstancedStatic(this.gameObject.id, instancedMeshComp.instancedMesh);
		} else {
			throw new Error(`[CollisionComponent] GameObject "${this.gameObject.id}" requires either: (1) shape + shapeParams config, or (2) I_MeshProvider/InstancedMeshComponent`);
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
