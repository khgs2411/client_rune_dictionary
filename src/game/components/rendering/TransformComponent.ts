import { I_SceneContext } from '@/game/common/scenes.types';
import { Euler, Quaternion, Vector3 } from 'three';
import { GameComponent } from '../../GameComponent';

export interface I_TransformConfig {
  position?: [number, number, number];
  rotation?: [number, number, number]; // Euler angles in radians
  scale?: [number, number, number];
}

/**
 * TransformComponent - Stores position, rotation, and scale data
 *
 * This component holds the transform state for a GameObject.
 * Other components (like MeshComponent) will apply this transform to Three.js objects.
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new TransformComponent({
 *   position: [0, 1, 0],
 *   rotation: [0, Math.PI / 4, 0],
 *   scale: [1, 1, 1]
 * }));
 * ```
 */
export class TransformComponent extends GameComponent {
  public position: Vector3;
  public rotation: Euler;
  public scale: Vector3;

  constructor(config: I_TransformConfig = {}) {
    super();

    this.position = new Vector3(...(config.position || [0, 0, 0]));
    this.rotation = new Euler(...(config.rotation || [0, 0, 0]));
    this.scale = new Vector3(...(config.scale || [1, 1, 1]));
  }

  public async init(context: I_SceneContext): Promise<void> {
    // Transform component doesn't need initialization
    // It just holds data that other components will use
  }

  public get forward(): Vector3 {
    const forward = new Vector3(0, 0, -1);
    forward.applyEuler(this.rotation);
    return forward.normalize();
  }


  /**
   * Set position
   */
  public setPosition(x: number | Vector3, y?: number, z?: number): void {
    if (x instanceof Vector3) {
      this.position.copy(x);
    } else {
      this.position.set(x, y!, z!);
    }
  }

  /**
   * Set rotation (Euler angles in radians)
   */
  public setRotation(x: number | Euler, y?: number, z?: number): void {
    if (x instanceof Euler) {
      this.rotation.copy(x);
    } else {
      this.rotation.set(x, y!, z!);
    }
  }

  /**
   * Set rotation from quaternion
   */
  public setRotationFromQuaternion(quaternion: Quaternion): void {
    this.rotation.setFromQuaternion(quaternion);
  }

  /**
   * Set scale
   */
  public setScale(x: number | Vector3, y?: number, z?: number): void {
    if (x instanceof Vector3) {
      this.scale.copy(x);
    } else if (y === undefined && z === undefined) {
      // Uniform scale
      this.scale.set(x, x, x);
    } else {
      this.scale.set(x, y!, z!);
    }
  }

  /**
   * Get position as array [x, y, z]
   */
  public getPositionArray(): [number, number, number] {
    return [this.position.x, this.position.y, this.position.z];
  }

  /**
   * Get rotation as array [x, y, z]
   */
  public getRotationArray(): [number, number, number] {
    return [this.rotation.x, this.rotation.y, this.rotation.z];
  }

  /**
   * Get scale as array [x, y, z]
   */
  public getScaleArray(): [number, number, number] {
    return [this.scale.x, this.scale.y, this.scale.z];
  }
}
