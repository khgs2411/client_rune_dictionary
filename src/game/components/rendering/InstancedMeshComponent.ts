import { InstancedMesh, Matrix4, Euler, Quaternion, Vector3 } from 'three';
import { GameComponent, ComponentPriority } from '../../GameComponent';
import { GeometryComponent } from './GeometryComponent';
import { MaterialComponent } from './MaterialComponent';
import { MeshComponent } from './MeshComponent';
import { I_SceneContext } from '@/game/common/scenes.types';

export interface I_InstanceTransform {
  position: [number, number, number];
  rotation?: [number, number, number]; // Euler angles in radians
  scale?: [number, number, number];
}

export interface I_InstancedMeshConfig {
  instances: I_InstanceTransform[]; // Array of instance transforms
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * InstancedMeshComponent - Creates Three.js InstancedMesh from Geometry + Material
 *
 * This component is for rendering MANY identical objects efficiently.
 * Use this instead of MeshComponent when you have multiple copies of the same mesh.
 *
 * This component requires:
 * - GeometryComponent (for geometry)
 * - MaterialComponent (for material)
 *
 * This component CANNOT be used with:
 * - MeshComponent (use one OR the other, not both)
 * - DragComponent (individual instances can't be dragged)
 * - Individual InteractionComponents (use InteractionService at group level if needed)
 *
 * Usage:
 * ```typescript
 * const trees = new GameObject({ id: 'tree-group' })
 *   .addComponent(new GeometryComponent({ type: 'cylinder', params: [0.2, 0.2, 1.5] }))
 *   .addComponent(new MaterialComponent({ color: 0x654321 }))
 *   .addComponent(new InstancedMeshComponent({
 *     instances: [
 *       { position: [10, 0, 0] },
 *       { position: [12, 0, 2] },
 *       { position: [14, 0, -1] }
 *     ]
 *   }));
 * ```
 */
export class InstancedMeshComponent extends GameComponent {
  public readonly priority = ComponentPriority.RENDERING; // 100 - creates mesh AFTER geometry/material

  public instancedMesh!: InstancedMesh;
  private config: I_InstancedMeshConfig;

  constructor(config: I_InstancedMeshConfig) {
    super();
    this.config = config;

    if (!config.instances || config.instances.length === 0) {
      throw new Error('[InstancedMeshComponent] instances array cannot be empty');
    }
  }

  async init(context: I_SceneContext): Promise<void> {
    // Validate: cannot use with MeshComponent
    if (this.gameObject.hasComponent(MeshComponent)) {
      throw new Error(
        `[InstancedMeshComponent] GameObject "${this.gameObject.id}" has MeshComponent. Use InstancedMeshComponent OR MeshComponent, not both.`,
      );
    }

    // Require geometry and material components
    const geometryComp = this.requireComponent(GeometryComponent);
    const materialComp = this.requireComponent(MaterialComponent);

    // Create instanced mesh
    this.instancedMesh = new InstancedMesh(
      geometryComp.geometry,
      materialComp.material,
      this.config.instances.length,
    );

    // Configure shadows
    this.instancedMesh.castShadow = this.config.castShadow ?? true;
    this.instancedMesh.receiveShadow = this.config.receiveShadow ?? true;

    // Set name from GameObject ID
    this.instancedMesh.name = this.gameObject.id;

    // Set transforms for each instance
    this.instancedMesh.count = 0;
    this.config.instances.forEach((instanceTransform, index) => {
      const matrix = new Matrix4();
      const position = new Vector3(...instanceTransform.position);
      const euler = new Euler(...(instanceTransform.rotation || [0, 0, 0]));
      const quaternion = new Quaternion().setFromEuler(euler);
      const scale = new Vector3(...(instanceTransform.scale || [1, 1, 1]));

      matrix.compose(position, quaternion, scale);
      this.instancedMesh.setMatrixAt(this.instancedMesh.count++, matrix);
    });

    this.instancedMesh.instanceMatrix.needsUpdate = true;

    // Compute bounding sphere for proper frustum culling
    this.instancedMesh.computeBoundingSphere();

    // Add to scene
    context.scene.add(this.instancedMesh);

    // Register for cleanup
    context.cleanupRegistry.registerObject(this.instancedMesh);
  }

  /**
   * Get the number of instances
   */
  getInstanceCount(): number {
    return this.config.instances.length;
  }

  /**
   * Update transform for a specific instance
   * @param index Instance index
   * @param transform New transform
   */
  updateInstance(index: number, transform: I_InstanceTransform): void {
    if (index < 0 || index >= this.config.instances.length) {
      console.warn(
        `[InstancedMeshComponent] Invalid index ${index} (max: ${this.config.instances.length - 1})`,
      );
      return;
    }

    const matrix = new Matrix4();
    const position = new Vector3(...transform.position);
    const euler = new Euler(...(transform.rotation || [0, 0, 0]));
    const quaternion = new Quaternion().setFromEuler(euler);
    const scale = new Vector3(...(transform.scale || [1, 1, 1]));

    matrix.compose(position, quaternion, scale);
    this.instancedMesh.setMatrixAt(index, matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;

    // Update config
    this.config.instances[index] = transform;
  }

  destroy(): void {
    // Mesh cleanup handled by lifecycle.register()
  }
}
