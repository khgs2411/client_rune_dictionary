import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  PlaneGeometry,
  SphereGeometry,
} from 'three';
import { GameComponent } from '../../GameComponent';
import { I_SceneContext } from '@/game/common/scenes.types';

export type GeometryType = 'plane' | 'box' | 'sphere' | 'cylinder' | 'cone' | 'capsule';

export interface I_GeometryConfig {
  type: GeometryType;
  params: number[];
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

    switch (type) {
      case 'plane':
        // params: [width, height]
        return new PlaneGeometry(params[0], params[1]);

      case 'box':
        // params: [width, height, depth]
        return new BoxGeometry(params[0], params[1], params[2]);

      case 'sphere':
        // params: [radius, widthSegments?, heightSegments?]
        return new SphereGeometry(params[0], params[1] || 32, params[2] || 16);

      case 'cylinder':
        // params: [radiusTop, radiusBottom, height, radialSegments?]
        return new CylinderGeometry(params[0], params[1], params[2], params[3] || 16);

      case 'cone':
        // params: [radius, height, radialSegments?]
        return new ConeGeometry(params[0], params[1], params[2] || 16);

      case 'capsule':
        // params: [radius, height, radialSegments?, heightSegments?]
        // return new CylinderGeometry(params[0], params[0], params[1], params[2] || 8, params[3] || 16);
        return new CapsuleGeometry(params[0], params[1], params[2] || 8, params[3] || 16)

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
