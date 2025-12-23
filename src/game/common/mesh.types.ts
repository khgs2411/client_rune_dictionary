import type { Material, Mesh } from "three";
import { MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial } from "three";

/**
 * Interface for components that provide mesh access for physics registration
 */
export interface I_MeshProvider {
	getMesh(): Mesh;
}

/**
 * Interface for components that provide collision mesh (separate from visual mesh)
 * Used by CollisionComponent and KinematicCollisionComponent when sprite-based
 * GameObjects need 3D collision shapes instead of PlaneGeometry
 */
export interface I_CollisionMeshProvider {
	getCollisionMesh(): Mesh;
}

/**
 * Interface for components that provide material access
 * Implemented by MaterialComponent, ToonMaterialComponent, etc.
 */
export interface I_MaterialProvider {
	material: Material;
}

/**
 * Material types that support opacity manipulation
 * Used by OcclusionComponent, VFX effects, etc.
 */
export type OpacityMaterial = MeshStandardMaterial | MeshToonMaterial | MeshBasicMaterial;

/**
 * Type guard to check if a material supports opacity manipulation
 *
 * @param mat - The material to check
 * @returns True if the material is MeshStandardMaterial, MeshToonMaterial, or MeshBasicMaterial
 *
 * @example
 * ```typescript
 * if (isOpacityMaterial(mesh.material)) {
 *   mesh.material.opacity = 0.5;
 *   mesh.material.transparent = true;
 * }
 * ```
 */
export function isOpacityMaterial(mat: Material): mat is OpacityMaterial {
	return mat instanceof MeshStandardMaterial || mat instanceof MeshToonMaterial || mat instanceof MeshBasicMaterial;
}
