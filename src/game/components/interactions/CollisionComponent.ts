import { GameComponent, ComponentPriority } from '../../GameComponent';
import { MeshComponent } from '../rendering/MeshComponent';
import { InstancedMeshComponent } from '../rendering/InstancedMeshComponent';
import { I_SceneContext } from '@/game/common/scenes.types';

export interface I_CollisionConfig {
  type: 'static' | 'dynamic' | 'trigger';
  shape?: 'cuboid' | 'sphere' | 'capsule' | 'cylinder';
  shapeParams?: number[]; // Explicit shape dimensions (e.g., [halfWidth, halfHeight, halfDepth] for cuboid)
  showDebug?: boolean;
  onCollision?: (other: string) => void; // Callback when collision occurs (future implementation)
}

/**
 * CollisionComponent - Registers GameObject collision bodies with PhysicsService
 *
 * This component is for static/dynamic/trigger colliders only.
 * For player character controllers, use CharacterControllerComponent instead.
 *
 * Types:
 * - static: Immovable objects (walls, ground, obstacles)
 * - dynamic: Moving objects with physics (future: ragdolls, projectiles with physics)
 * - trigger: Ghost collider (detects collision but doesn't block, for projectiles/pickups)
 *
 * Usage:
 * ```typescript
 * // Static wall
 * new CollisionComponent({ type: 'static' });
 *
 * // Trigger projectile (detects hits, doesn't block)
 * new CollisionComponent({
 *   type: 'trigger',
 *   shape: 'sphere',
 *   onCollision: (otherId) => console.log('Hit:', otherId)
 * });
 * ```
 *
 * Dependencies:
 * - Requires MeshComponent OR InstancedMeshComponent
 */
export class CollisionComponent extends GameComponent {
  public readonly priority = ComponentPriority.PHYSICS; // 200 - depends on mesh

  private config: I_CollisionConfig;
  private isRegistered = false;
  private instanceIds: string[] = []; // Track physics IDs for instanced meshes

  constructor(config: I_CollisionConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[PhysicsComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`,
      );
      return;
    }

    // Get mesh components
    const meshComp = this.getComponent(MeshComponent);
    const instancedMeshComp = this.getComponent(InstancedMeshComponent);

    if (!meshComp && !instancedMeshComp) {
      throw new Error(
        `[CollisionComponent] GameObject "${this.gameObject.id}" requires MeshComponent or InstancedMeshComponent`,
      );
    }

    // Register collider with physics service
    if (meshComp) {
      // Single mesh registration
      context.services.physics.registerStaticFromMesh(
        this.gameObject.id,
        meshComp.mesh,
        { showDebug: this.config.showDebug },
      );
      console.log(
        `💥 [CollisionComponent] Registered ${this.config.type} collider for "${this.gameObject.id}"`,
      );
    } else if (instancedMeshComp) {
      // Instanced mesh registration (multiple static bodies)
      this.instanceIds = context.services.physics.registerInstancedStatic(
        this.gameObject.id,
        instancedMeshComp.instancedMesh,
      );
      console.log(
        `💥 [CollisionComponent] Registered ${this.instanceIds.length} instanced colliders for "${this.gameObject.id}"`,
      );
    }

    this.isRegistered = true;
  }

  /**
   * Update physics body position (for drag, teleport, etc.)
   */
  public updatePosition(x: number, y: number, z: number): void {
    if (!this.isRegistered) return;

    const context = (this as any).context as I_SceneContext;
    if (context?.services?.physics) {
      context.services.physics.setPosition(this.gameObject.id, { x, y, z });
    }
  }

  public destroy(): void {
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
