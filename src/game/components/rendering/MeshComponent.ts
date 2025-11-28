import { I_SceneContext } from "@/game/common/scenes.types";
import { Mesh } from "three";
import type { I_MaterialProvider, I_MeshProvider } from "../../common/mesh.types";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";
import { GeometryComponent } from "./GeometryComponent";
import { TransformComponent } from "./TransformComponent";

export interface I_MeshConfig {
	castShadow?: boolean;
	receiveShadow?: boolean;
}

/**
 * MeshComponent - Creates Three.js Mesh from Geometry + Material
 *
 * Implements I_MeshProvider to provide standardized mesh access for physics registration.
 *
 * This component requires:
 * - GeometryComponent (for geometry)
 * - Any I_MaterialProvider (MaterialComponent, ToonMaterialComponent, etc.)
 *
 * Optionally uses:
 * - TransformComponent (for position/rotation/scale)
 *
 * Usage:
 * ```typescript
 * // With standard material
 * gameObject
 *   .addComponent(new GeometryComponent({ type: 'box', params: [1, 1, 1] }))
 *   .addComponent(new MaterialComponent({ color: 0xff1493 }))
 *   .addComponent(new MeshComponent());
 *
 * // With toon material (cel-shading)
 * gameObject
 *   .addComponent(new GeometryComponent({ type: 'box', params: [1, 1, 1] }))
 *   .addComponent(new ToonMaterialComponent({ color: 0x228b22, vibrant: true }))
 *   .addComponent(new MeshComponent());
 * ```
 */
export class MeshComponent extends GameComponent implements I_MeshProvider {
	public readonly priority = ComponentPriority.RENDERING; // 100 - creates mesh AFTER transform/persistence

	public mesh!: Mesh;
	private config: I_MeshConfig;

	constructor(config: I_MeshConfig = {}) {
		super();
		this.config = config;
		// Register trait for interface-based lookup
		this.registerTrait(TRAIT.MESH_PROVIDER);
	}

	async init(context: I_SceneContext): Promise<void> {
		// Restrict: cannot use with InstancedMeshComponent
		const InstancedMeshComponent = await import("./InstancedMeshComponent").then((m) => m.InstancedMeshComponent);
		this.restrictComponent(InstancedMeshComponent, "Use InstancedMeshComponent OR MeshComponent, not both.");

		// Require geometry component
		const geometryComp = this.requireComponent(GeometryComponent);

		// Find any component that has MATERIAL_PROVIDER trait
		const materialProvider = this.requireByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER);

		// Create mesh
		this.mesh = new Mesh(geometryComp.geometry, materialProvider.material);

		// Configure shadows
		this.mesh.castShadow = this.config.castShadow ?? true;
		this.mesh.receiveShadow = this.config.receiveShadow ?? true;

		// Set name from GameObject ID
		this.mesh.name = this.gameObject.id;

		// Apply transform if available
		const transformComp = this.getComponent(TransformComponent);
		if (transformComp) {
			this.applyTransform(transformComp);
		}

		// Add to scene
		context.scene.add(this.mesh);

		// Register for cleanup
		context.cleanupRegistry.registerObject(this.mesh);
	}

	/**
	 * Apply transform from TransformComponent to mesh
	 */
	private applyTransform(transform: TransformComponent): void {
		this.mesh.position.copy(transform.position);
		this.mesh.rotation.copy(transform.rotation);
		this.mesh.scale.copy(transform.scale);
	}

	/**
	 * Update mesh transform from TransformComponent
	 * Call this if transform changes after initialization
	 */
	updateTransform(): void {
		const transformComp = this.getComponent(TransformComponent);
		if (transformComp) {
			this.applyTransform(transformComp);
		}
	}

	/**
	 * Sync mesh transform with TransformComponent every frame
	 */
	update(delta: number): void {
		const transformComp = this.getComponent(TransformComponent);
		if (transformComp) {
			// Sync position/rotation/scale from TransformComponent to mesh
			this.mesh.position.copy(transformComp.position);
			this.mesh.rotation.copy(transformComp.rotation);
			this.mesh.scale.copy(transformComp.scale);
		}
	}

	/**
	 * Implements I_MeshProvider to return mesh for physics registration
	 */
	public getMesh(): Mesh {
		return this.mesh;
	}

	destroy(): void {
		// Remove mesh from scene when GameObject is destroyed
		if (this.mesh && this.mesh.parent) {
			this.mesh.parent.remove(this.mesh);
		}
	}
}
