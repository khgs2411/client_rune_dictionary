import type { Mesh } from 'three';

/**
 * Interface for components that provide mesh access for physics registration
 */
export interface I_MeshProvider {
  getMesh(): Mesh;
}
