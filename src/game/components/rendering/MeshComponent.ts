import { Mesh } from 'three';
import { GameComponent, ComponentPriority } from '../../GameComponent';
import type { I_GameContext } from '../../common/gameobject.types';
import { GeometryComponent } from './GeometryComponent';
import { MaterialComponent } from './MaterialComponent';
import { TransformComponent } from './TransformComponent';

export interface I_MeshConfig {
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * MeshComponent - Creates Three.js Mesh from Geometry + Material
 *
 * This component requires:
 * - GeometryComponent (for geometry)
 * - MaterialComponent (for material)
 *
 * Optionally uses:
 * - TransformComponent (for position/rotation/scale)
 *
 * Usage:
 * ```typescript
 * gameObject
 *   .addComponent(new GeometryComponent({ type: 'box', params: [1, 1, 1] }))
 *   .addComponent(new MaterialComponent({ color: 0xff1493 }))
 *   .addComponent(new TransformComponent({ position: [0, 1, 0] }))
 *   .addComponent(new MeshComponent());
 * ```
 */
export class MeshComponent extends GameComponent {
  public readonly priority = ComponentPriority.RENDERING; // 100 - creates mesh AFTER transform/persistence

  public mesh!: Mesh;
  private config: I_MeshConfig;

  constructor(config: I_MeshConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    // Restrict: cannot use with InstancedMeshComponent
    const InstancedMeshComponent = await import('./InstancedMeshComponent').then(
      (m) => m.InstancedMeshComponent,
    );
    this.restrictComponent(
      InstancedMeshComponent,
      'Use InstancedMeshComponent OR MeshComponent, not both.',
    );

    // Require geometry and material components
    const geometryComp = this.requireComponent(GeometryComponent);
    const materialComp = this.requireComponent(MaterialComponent);

    // Create mesh
    this.mesh = new Mesh(geometryComp.geometry, materialComp.material);

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
    context.cleanupRegistry.register(this.mesh);
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

  destroy(): void {
    // Mesh cleanup handled by lifecycle.register()
  }
}
