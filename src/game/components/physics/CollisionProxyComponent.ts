import { BoxGeometry, BufferGeometry, CapsuleGeometry, CylinderGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import type { I_CollisionMeshProvider } from "../../common/mesh.types";
import type { I_SceneContext } from "../../common/scenes.types";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";
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

	}

	/**
	 * Sync mesh transform with TransformComponent each frame
	 */
	update(_delta: number): void {
		this.syncTransform();
	}

	/**
	 * Apply transform from TransformComponent + offset
	 * Offset is applied at mesh.position level so physics.getWorldPosition() includes it
	 */
	private syncTransform(): void {
		const transform = this.getComponent(TransformComponent);
		if (transform && this.mesh) {
			// Apply transform position + offset (so mesh.getWorldPosition() includes offset)
			this.mesh.position.set(
				transform.position.x + this.offset[0],
				transform.position.y + this.offset[1],
				transform.position.z + this.offset[2],
			);
			this.mesh.rotation.copy(transform.rotation);
			this.mesh.scale.copy(transform.scale);
		}
	}

	/**
	 * Create geometry based on shape type
	 * Offset is applied at mesh.position level (not geometry) so physics sees it
	 */
	private createGeometry(): BufferGeometry {
		const { shape, radius = 0.3, height = 1.5, width = 1, depth = 1 } = this.config;

		switch (shape) {
			case "capsule":
				// CapsuleGeometry(radius, length, capSegments, radialSegments)
				// 'length' is the middle cylinder section, total height = length + radius*2
				return new CapsuleGeometry(radius, height - radius * 2, 8, 16);

			case "cylinder":
				// CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
				return new CylinderGeometry(radius, radius, height, 16);

			case "cuboid":
				// BoxGeometry(width, height, depth)
				return new BoxGeometry(width, height, depth);

			default:
				throw new Error(`[CollisionProxyComponent] Unsupported shape: ${shape}`);
		}
	}

	/**
	 * Implements I_CollisionMeshProvider
	 */
	public getCollisionMesh(): Mesh {
		return this.mesh;
	}

	/**
	 * Get world position of collision mesh center (transform + offset)
	 * Since offset is now applied at mesh.position level, this delegates to mesh.getWorldPosition()
	 */
	public getWorldPosition(): Vector3 {
		if (this.mesh) {
			return this.mesh.getWorldPosition(new Vector3());
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
	 * Get collision offset from transform position
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
