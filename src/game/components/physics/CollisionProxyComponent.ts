import { DataStore } from "@/stores/DataStore";
import { BoxGeometry, BufferGeometry, CapsuleGeometry, CylinderGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import type { I_CollisionMeshProvider } from "../../common/mesh.types";
import type { I_SceneContext } from "../../common/scenes.types";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";
import { DebugLabelComponent } from "../debug/DebugLabelComponent";
import { TransformComponent } from "../entities/TransformComponent";

export type CollisionProxyShape = "capsule" | "cylinder" | "cuboid";

export interface I_CollisionProxyConfig {
	shape: CollisionProxyShape;

	// Shape dimensions (varies by shape type)
	radius?: number; // For capsule/cylinder (default: 0.3)
	height?: number; // For capsule/cylinder/cuboid (default: 1.5)
	width?: number; // For cuboid x-axis (default: 1)
	depth?: number; // For cuboid z-axis (default: 1)

	// Positioning
	offset?: [number, number, number]; // Offset from TransformComponent position (default: [0, 0, 0])

	// Debug
	visible?: boolean; // Show mesh for debugging (default: false)
	debugColor?: number; // Wireframe color when visible (default: 0x00ff00)
}

/**
 * CollisionProxyComponent - Invisible 3D mesh for physics collision
 *
 * Creates an invisible capsule, cylinder, or box mesh specifically for physics
 * collision detection. Decouples collision shape from visual representation,
 * enabling sprite-based GameObjects to have proper 3D collision shapes.
 *
 * Works alongside SpriteComponent - the sprite handles rendering, this component
 * handles physics. Physics components (CollisionComponent, KinematicCollisionComponent)
 * will automatically use this mesh when present via the COLLISION_MESH_PROVIDER trait.
 *
 * Usage:
 * ```typescript
 * gameObject
 *   .addComponent(new TransformComponent({ position: [0, 0, 0] }))
 *   .addComponent(new SpriteComponent({ texture: '/sprites/knight.png', size: [1.5, 2] }))
 *   .addComponent(new BillboardComponent({ mode: 'cylindrical' }))
 *   .addComponent(new CollisionProxyComponent({
 *     shape: 'capsule',
 *     radius: 0.3,
 *     height: 1.5,
 *     offset: [0, 0.75, 0], // Center capsule vertically on sprite
 *   }))
 *   .addComponent(new KinematicCollisionComponent({ ... })); // Uses collision proxy automatically
 * ```
 */
export class CollisionProxyComponent extends GameComponent implements I_CollisionMeshProvider {
	public readonly priority = ComponentPriority.RENDERING; // 100 - after Transform, before Physics

	private config: I_CollisionProxyConfig;
	private mesh!: Mesh;
	private geometry!: BufferGeometry;
	private material!: MeshBasicMaterial;
	private offset: [number, number, number];
	private context!: I_SceneContext;

	constructor(config: I_CollisionProxyConfig) {
		super();
		this.config = config;
		this.offset = config.offset ?? [0, 0, 0];
		this.registerTrait(TRAIT.COLLISION_MESH_PROVIDER);
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;

		// Create geometry based on shape type
		this.geometry = this.createGeometry();

		// Create transparent material (invisible by default)
		const visible = this.config.visible ?? false;
		this.material = new MeshBasicMaterial({
			transparent: true,
			opacity: visible ? 0.3 : 0,
			wireframe: visible,
			color: this.config.debugColor ?? 0x00ff00,
			depthWrite: false,
		});

		// Create mesh
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.name = `collision-proxy-${this.gameObject.id}`;
		this.mesh.visible = visible;

		// Apply initial transform with offset
		this.syncTransform();

		// Add to scene
		context.scene.add(this.mesh);

		// Register for cleanup
		context.cleanupRegistry.registerObject(this.mesh);
		context.cleanupRegistry.registerDisposable(this.geometry);
		context.cleanupRegistry.registerDisposable(this.material);

		// Add debug label if global physics debug is enabled
		if (DataStore.settings.debug.showPhysicsDebug) {
			const labelComp = new DebugLabelComponent({ text: this.gameObject.id });
			this.gameObject.addComponent(labelComp);
			await labelComp.init(context);
		}
	}

	/**
	 * Sync mesh transform with TransformComponent each frame
	 */
	update(_delta: number): void {
		this.syncTransform();
	}

	/**
	 * Apply transform from TransformComponent
	 * Offset is already baked into geometry, so mesh.position === transform.position
	 */
	private syncTransform(): void {
		const transform = this.getComponent(TransformComponent);
		if (transform && this.mesh) {
			this.mesh.position.copy(transform.position);
			this.mesh.rotation.copy(transform.rotation);
			this.mesh.scale.copy(transform.scale);
		}
	}

	/**
	 * Create geometry based on shape type
	 * The offset is baked into the geometry (like SpriteComponent's anchor)
	 * so mesh.position === TransformComponent.position
	 */
	private createGeometry(): BufferGeometry {
		const { shape, radius = 0.3, height = 1.5, width = 1, depth = 1 } = this.config;
		let geometry: BufferGeometry;

		switch (shape) {
			case "capsule":
				// CapsuleGeometry(radius, length, capSegments, radialSegments)
				// 'length' is the middle cylinder section, total height = length + radius*2
				geometry = new CapsuleGeometry(radius, height - radius * 2, 8, 16);
				break;

			case "cylinder":
				// CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
				geometry = new CylinderGeometry(radius, radius, height, 16);
				break;

			case "cuboid":
				// BoxGeometry(width, height, depth)
				geometry = new BoxGeometry(width, height, depth);
				break;

			default:
				throw new Error(`[CollisionProxyComponent] Unsupported shape: ${shape}`);
		}

		// Bake offset into geometry (like SpriteComponent's anchor offset)
		// This keeps mesh.position === TransformComponent.position
		if (this.offset[0] !== 0 || this.offset[1] !== 0 || this.offset[2] !== 0) {
			geometry.translate(this.offset[0], this.offset[1], this.offset[2]);
		}

		return geometry;
	}

	/**
	 * Implements I_CollisionMeshProvider
	 */
	public getCollisionMesh(): Mesh {
		return this.mesh;
	}

	/**
	 * Get world position of collision mesh center (transform + offset)
	 * Note: offset is baked into geometry, so this returns transform + offset
	 * Useful for physics components or debug tools
	 */
	public getWorldPosition(): Vector3 {
		const transform = this.getComponent(TransformComponent);
		if (transform) {
			// Offset is baked into geometry, so actual center is transform + offset
			return new Vector3(transform.position.x + this.offset[0], transform.position.y + this.offset[1], transform.position.z + this.offset[2]);
		}
		return new Vector3();
	}

	/**
	 * Toggle debug visibility
	 */
	public setVisible(visible: boolean): void {
		this.mesh.visible = visible;
		this.material.wireframe = visible;
		this.material.opacity = visible ? 0.3 : 0;
	}

	/**
	 * Check if collision proxy is visible (debug mode)
	 */
	public isVisible(): boolean {
		return this.mesh.visible;
	}

	/**
	 * Get collision offset (baked into geometry at init, immutable)
	 */
	public getOffset(): [number, number, number] {
		return [...this.offset];
	}

	destroy(): void {
		// Remove mesh from parent
		if (this.mesh?.parent) {
			this.mesh.parent.remove(this.mesh);
		}

		// Call super to run cleanup registry
		if (this.context?.scene) {
			super.destroy(this.context.scene);
		}
	}
}
