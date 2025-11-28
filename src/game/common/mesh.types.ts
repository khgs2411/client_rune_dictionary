import type { Material, Mesh } from "three";

/**
 * Interface for components that provide mesh access for physics registration
 */
export interface I_MeshProvider {
	getMesh(): Mesh;
}

/**
 * Interface for components that provide material access
 * Implemented by MaterialComponent, ToonMaterialComponent, etc.
 */
export interface I_MaterialProvider {
	material: Material;
}
