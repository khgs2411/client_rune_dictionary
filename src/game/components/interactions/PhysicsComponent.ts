import { GameComponent, ComponentPriority } from '../../GameComponent';
import type { I_GameContext } from '../../common/gameobject.types';
import { MeshComponent } from '../rendering/MeshComponent';
import { InstancedMeshComponent } from '../rendering/InstancedMeshComponent';

export interface I_PhysicsConfig {
  type: 'static' | 'kinematic';
  shape?: 'cuboid' | 'sphere' | 'capsule' | 'cylinder';
  showDebug?: boolean;
}

/**
 * PhysicsComponent - Registers GameObject with PhysicsService
 *
 * This component requires:
 * - MeshComponent OR InstancedMeshComponent (to extract geometry/position for physics body)
 *
 * Usage:
 * ```typescript
 * // With MeshComponent (single mesh)
 * gameObject.addComponent(new PhysicsComponent({
 *   type: 'static',
 *   shape: 'cuboid'
 * }));
 *
 * // With InstancedMeshComponent (multiple instances)
 * gameObject.addComponent(new PhysicsComponent({
 *   type: 'static',
 *   shape: 'cylinder'
 * }));
 * ```
 */
export class PhysicsComponent extends GameComponent {
  public readonly priority = ComponentPriority.PHYSICS; // 200 - depends on mesh

  private config: I_PhysicsConfig;
  private isRegistered = false;
  private instanceIds: string[] = []; // Track physics IDs for instanced meshes

  constructor(config: I_PhysicsConfig) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[PhysicsComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`,
      );
      return;
    }

    // Check which mesh component is present
    const meshComp = this.getComponent(MeshComponent);
    const instancedMeshComp = this.getComponent(InstancedMeshComponent);

    if (!meshComp && !instancedMeshComp) {
      throw new Error(
        `[PhysicsComponent] GameObject "${this.gameObject.id}" requires MeshComponent OR InstancedMeshComponent`,
      );
    }

    // Register with physics service based on type
    if (this.config.type === 'static') {
      if (meshComp) {
        // Single mesh registration
        context.services.physics.registerStaticFromMesh(
          this.gameObject.id,
          meshComp.mesh,
          { showDebug: this.config.showDebug },
        );
      } else if (instancedMeshComp) {
        // Instanced mesh registration
        this.instanceIds = context.services.physics.registerInstancedStatic(
          this.gameObject.id,
          instancedMeshComp.instancedMesh,
        );
      }
    } else {
      // Kinematic registration (future implementation)
      console.warn(
        `[PhysicsComponent] Kinematic physics not yet implemented for GameObject "${this.gameObject.id}"`,
      );
      return;
    }

    this.isRegistered = true;
  }

  /**
   * Update physics body position (for drag, teleport, etc.)
   */
  updatePosition(x: number, y: number, z: number): void {
    if (!this.isRegistered) return;

    const context = (this as any).context as I_GameContext;
    if (context?.services?.physics) {
      context.services.physics.setPosition(this.gameObject.id, { x, y, z });
    }
  }

  destroy(): void {
    if (this.isRegistered) {
      // For instanced meshes, cleanup individual instance physics bodies
      if (this.instanceIds.length > 0) {
        // Note: PhysicsService.destroy() should handle this automatically
        // but we track them here in case manual cleanup is needed
        this.instanceIds = [];
      }
      // Physics cleanup happens automatically in PhysicsService.destroy()
      this.isRegistered = false;
    }
  }
}
