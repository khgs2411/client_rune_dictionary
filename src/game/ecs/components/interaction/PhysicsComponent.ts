import { GameComponent, ComponentPriority } from '../../GameComponent';
import type { I_GameContext } from '../../types';
import { MeshComponent } from '../rendering/MeshComponent';

export interface I_PhysicsConfig {
  type: 'static' | 'kinematic';
  shape?: 'cuboid' | 'sphere' | 'capsule' | 'cylinder';
  showDebug?: boolean;
}

/**
 * PhysicsComponent - Registers GameObject with PhysicsService
 *
 * This component requires:
 * - MeshComponent (to extract geometry/position for physics body)
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new PhysicsComponent({
 *   type: 'static',
 *   shape: 'cuboid' // Optional: auto-detected from geometry if not specified
 * }));
 * ```
 */
export class PhysicsComponent extends GameComponent {
  public readonly priority = ComponentPriority.PHYSICS; // 200 - depends on mesh

  private config: I_PhysicsConfig;
  private isRegistered = false;

  constructor(config: I_PhysicsConfig) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    // Require mesh component
    const meshComp = this.requireComponent(MeshComponent);

    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[PhysicsComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`,
      );
      return;
    }

    // Register with physics service based on type
    if (this.config.type === 'static') {
      context.services.physics.registerStaticFromMesh(
        this.gameObject.id,
        meshComp.mesh,
        { showDebug: this.config.showDebug },
      );
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
      // Physics cleanup happens automatically in PhysicsService.destroy()
      this.isRegistered = false;
    }
  }
}
