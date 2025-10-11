import type { I_ModuleContext } from '@/scenes/scenes.types';

/**
 * EntityModule Base Class
 * Low-level pluggable features for game entities
 *
 * Unlike SceneModules (high-level scene infrastructure like lighting, ground),
 * EntityModules are composable features that can be attached to individual entities
 *
 * Examples:
 * - InteractionModule: Makes entities clickable/hoverable
 * - CollisionModule: Adds collision detection
 * - HealthModule: Adds health/damage system
 * - InventoryModule: Adds item storage
 *
 * Usage:
 * ```typescript
 * class SceneObjectsModule extends SceneModule {
 *   private interaction = new InteractionEntityModule();
 *
 *   async start(context) {
 *     // Create entities
 *     // Attach entity modules to specific entities
 *     this.interaction.attachTo(mesh, config);
 *
 *     // Initialize entity modules
 *     await this.interaction.start(context);
 *   }
 * }
 * ```
 */
export abstract class EntityModule {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Initialize the entity module with scene context
   * Called once by parent SceneModule during scene setup
   */
  abstract start(context: I_ModuleContext): Promise<void>;

  /**
   * Update loop (called every frame)
   * Optional - override if entity module needs per-frame updates
   */
  update(delta: number): void {
    // Default: no per-frame updates
  }

  /**
   * Cleanup (called when parent SceneModule is destroyed)
   */
  abstract destroy(): Promise<void>;
}
