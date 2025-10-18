import { GameComponent, ComponentPriority } from '../../GameComponent';
import { MeshComponent } from '../rendering/MeshComponent';
import { InstancedMeshComponent } from '../rendering/InstancedMeshComponent';
import { I_SceneContext } from '@/game/common/scenes.types';

export interface I_CollisionConfig {
  type: 'static' | 'dynamic' | 'trigger';
  shape?: 'cuboid' | 'sphere' | 'capsule' | 'cylinder';
  shapeParams?: number[]; // Explicit shape dimensions (e.g., [halfWidth, halfHeight, halfDepth] for cuboid)
  showDebug?: boolean;

  // Collision callbacks
  onCollisionEnter?: (otherId: string) => void;
  onCollisionStay?: (otherId: string) => void;
  onCollisionExit?: (otherId: string) => void;
}

/**
 * CollisionComponent - Registers GameObject collision bodies with PhysicsService
 *
 * This component is for static/dynamic/trigger colliders only.
 * For player character controllers, use KinematicPhysicsComponent instead.
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
 *   onCollisionEnter: (otherId) => console.log('Hit:', otherId),
 *   onCollisionExit: (otherId) => console.log('Stopped touching:', otherId)
 * });
 * ```
 *
 * Dependencies:
 * - Requires MeshComponent OR InstancedMeshComponent
 */
export class CollisionComponent extends GameComponent {
  public readonly priority = ComponentPriority.PHYSICS; // 200 - depends on mesh

  protected config: I_CollisionConfig;
  protected isRegistered = false;
  protected instanceIds: string[] = []; // Track physics IDs for instanced meshes
  protected context: I_SceneContext | null = null;

  constructor(config: I_CollisionConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.context = context;

    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[CollisionComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`,
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
    } else if (instancedMeshComp) {
      // Instanced mesh registration (multiple static bodies)
      this.instanceIds = context.services.physics.registerInstancedStatic(
        this.gameObject.id,
        instancedMeshComp.instancedMesh,
      );
    }

    // Register collision callbacks if provided
    this.registerCallbacks();

    this.isRegistered = true;
  }

  /**
   * Register collision callbacks with PhysicsService
   * Can be overridden by subclasses
   */
  protected registerCallbacks(): void {
    if (!this.context) return;

    if (
      this.config.onCollisionEnter ||
      this.config.onCollisionStay ||
      this.config.onCollisionExit
    ) {
      this.context.services.physics.registerCollisionCallbacks(this.gameObject.id, {
        onCollisionEnter: this.config.onCollisionEnter,
        onCollisionStay: this.config.onCollisionStay,
        onCollisionExit: this.config.onCollisionExit,
      });
    }
  }

  /**
   * Update physics body position (for drag, teleport, etc.)
   */
  public updatePosition(x: number, y: number, z: number): void {
    if (!this.isRegistered || !this.context) return;
    this.context.services.physics.setPosition(this.gameObject.id, { x, y, z });
  }

  /**
   * Get current position from physics
   */
  public getPosition(): { x: number; y: number; z: number } | null {
    if (!this.isRegistered || !this.context) return null;
    return this.context.services.physics.getPosition(this.gameObject.id);
  }

  public destroy(): void {
    if (this.isRegistered) {
      // For instanced meshes, cleanup individual instance physics bodies
      if (this.instanceIds.length > 0) {
        this.instanceIds = [];
      }

      // Unregister collision callbacks
      if (this.context?.services?.physics) {
        this.context.services.physics.unregisterCollisionCallbacks(this.gameObject.id);
      }

      // Physics cleanup happens automatically in PhysicsService.destroy()
      this.isRegistered = false;
      this.context = null;
    }
  }
}
