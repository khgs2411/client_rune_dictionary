import type { I_MeshProvider } from "@/game/common/mesh.types";
import { I_SceneContext } from "@/game/common/scenes.types";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { DataStore } from "@/stores/DataStore";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";
import { CollisionShapeFactory, type I_CollisionShapeConfig } from "../../utils/CollisionShapeFactory";
import { DebugLabelComponent } from "../debug/DebugLabelComponent";
import { InstancedMeshComponent } from "../rendering/InstancedMeshComponent";

export interface I_CollisionConfig {
	type: "static" | "dynamic" | "trigger";

	// Inline shape definition (recommended for sprites)
	shape?: I_CollisionShapeConfig;

	// Debug visualization (creates custom Three.js wireframe, independent of Rapier debug)
	debugShape?: boolean;
	debugColor?: number;

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
 * 1. Inline shape config (recommended for sprites)
 * 2. InstancedMeshComponent (for instanced objects)
 * 3. MESH_PROVIDER trait (MeshComponent, SpriteComponent - fallback)
 *
 * Usage:
 * ```typescript
 * // Static NPC with inline shape (recommended for sprites)
 * new CollisionComponent({
 *   type: 'static',
 *   shape: { type: 'capsule', radius: 0.5, height: 1.2, offset: [0, 0.6, 0] },
 *   debugShape: true  // Show wireframe visualization
 * });
 *
 * // Static wall with inline cuboid shape
 * new CollisionComponent({
 *   type: 'static',
 *   shape: { type: 'cuboid', width: 40, height: 20, depth: 0.5 }
 * });
 *
 * // Trigger sphere (projectile hit detection)
 * new CollisionComponent({
 *   type: 'trigger',
 *   shape: { type: 'sphere', radius: 0.3 },
 *   onCollisionEnter: (targetId) => console.log('Hit:', targetId)
 * });
 *
 * // Static wall deriving collision from mesh geometry (fallback)
 * new CollisionComponent({ type: 'static' });
 * ```
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
		const meshProvider = this.findByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		const instancedMeshComp = this.getComponent(InstancedMeshComponent);
		const transformComp = this.getComponent(TransformComponent);

		// Register collider with physics service using priority order:
		// 1. Inline shape config (recommended for sprites)
		// 2. InstancedMeshComponent (must check BEFORE meshProvider since it also registers MESH_PROVIDER)
		// 3. MESH_PROVIDER (MeshComponent, SpriteComponent)
		if (this.config.shape) {
			// Inline shape registration (new API)
			const basePosition = transformComp?.getPositionArray() || [0, 0, 0];
			const offset = this.config.shape.offset ?? [0, 0, 0];
			const position: [number, number, number] = [basePosition[0] + offset[0], basePosition[1] + offset[1], basePosition[2] + offset[2]];
			// Note: Don't apply transform rotation for explicit shapes - shape config defines
			// the shape in world-space orientation
			const rotation: [number, number, number] = [0, 0, 0];

			// Get shape dimensions for physics (half-extents for cuboid, radius/halfHeight for others)
			const shapeDimensions = CollisionShapeFactory.getShapeDimensions(this.config.shape);

			physics.registerStatic(this.gameObject.id, {
				shape: this.config.shape.type,
				size: shapeDimensions as [number, number, number],
				position,
				rotation,
			});

			// Add debug wireframe mesh if requested
			if (this.config.debugShape) {
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
		} else if (instancedMeshComp) {
			// Instanced mesh registration (multiple static bodies)
			// Must check BEFORE meshProvider since InstancedMeshComponent also registers MESH_PROVIDER trait
			this.instanceIds = physics.registerInstancedStatic(this.gameObject.id, instancedMeshComp.instancedMesh);
		} else if (meshProvider) {
			// Single mesh registration (derive collision from mesh geometry)
			physics.registerStaticFromMesh(this.gameObject.id, meshProvider.getMesh());
		} else {
			throw new Error(
				`[CollisionComponent] GameObject "${this.gameObject.id}" has no collision shape.\n\n` +
					`For sprites, add inline shape config:\n` +
					`  new CollisionComponent({\n` +
					`    type: 'static',\n` +
					`    shape: { type: 'capsule', radius: 0.5, height: 1.2, offset: [0, 0.6, 0] },\n` +
					`  })\n\n` +
					`For mesh-based objects, collision shape is derived from MeshComponent automatically.`,
			);
		}

		// Register collision callbacks if provided
		this.registerCallbacks();

		// Add debug label if global physics debug is enabled
		// Skip for instanced meshes - they have multiple collision bodies and wireframes already show positions
		if (DataStore.settings.debug.showPhysicsDebug && !instancedMeshComp) {
			const labelComp = new DebugLabelComponent({ text: this.gameObject.id, variant: "collision" });
			this.gameObject.addComponent(labelComp);
			await labelComp.init(context);
		}

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
