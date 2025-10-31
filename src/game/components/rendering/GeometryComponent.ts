import { I_SceneContext } from '@/game/common/scenes.types';
import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  PlaneGeometry,
  SphereGeometry,
} from 'three';
import { Guards } from 'topsyde-utils';
import { GameComponent } from '../../GameComponent';

export type GeometryType = 'plane' | 'box' | 'sphere' | 'cylinder' | 'cone' | 'capsule';

export interface I_GeometryConfig {
  type: GeometryType;
  params: number[] | { x: number; y: number; z: number };
}

/**
 * GeometryComponent - Creates and manages Three.js BufferGeometry
 *
 * This component creates geometry based on configuration.
 * MeshComponent will use this geometry to create a mesh.
 *
 * Usage:
 * ```typescript
 * // Box: [width, height, depth]
 * gameObject.addComponent(new GeometryComponent({
 *   type: 'box',
 *   params: [1, 1, 1]
 * }));
 *
 * // Sphere: [radius, widthSegments?, heightSegments?]
 * gameObject.addComponent(new GeometryComponent({
 *   type: 'sphere',
 *   params: [0.5, 16, 12]
 * }));
 *
 * // Cylinder: [radiusTop, radiusBottom, height, radialSegments?]
 * gameObject.addComponent(new GeometryComponent({
 *   type: 'cylinder',
 *   params: [0.5, 0.5, 2, 16]
 * }));
 * ```
 */
export class GeometryComponent extends GameComponent {
  public geometry!: BufferGeometry;
  private config: I_GeometryConfig;

  constructor(config: I_GeometryConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.geometry = this.createGeometry();

    // Register geometry for disposal (geometries are disposable, not Object3D)
    context.cleanupRegistry.registerDisposable(this.geometry);
  }

  private createGeometry(): BufferGeometry {
    const { type, params } = this.config;
    const width = Guards.IsArray(params) ? params[0] : params.x;
    const height = Guards.IsArray(params) ? params[1] : params.y;
    const depth = Guards.IsArray(params) ? params[2] : params.z;
    switch (type) {
      case 'plane':
        // params: [width, height]
        return new PlaneGeometry(width, height);

      case 'box':
        // params: [width, height, depth]
        return new BoxGeometry(width, height, depth);

      case 'sphere':
        // params: [radius, widthSegments?, heightSegments?]
        return new SphereGeometry(width, height, depth || 12);

      case 'cylinder':
        // params: [radiusTop, radiusBottom, height, radialSegments?]
        return new CylinderGeometry(width, height, depth || 16);

      case 'cone':
        // params: [radius, height, radialSegments?]
        return new ConeGeometry(width, height, depth || 16);

      case 'capsule':
        // params: [radius, height, radialSegments?, heightSegments?]
        // return new CylinderGeometry(params[0], params[0], params[1], params[2] || 8, params[3] || 16);
        return new CapsuleGeometry(width, height, depth || 8, depth || 16)

      default:
        console.warn(
          `[GeometryComponent] Unknown geometry type: ${type}, defaulting to box`,
        );
        return new BoxGeometry(1, 1, 1);
    }
  }

  destroy(): void {
    // Geometry cleanup handled by lifecycle.register()
  }
}
