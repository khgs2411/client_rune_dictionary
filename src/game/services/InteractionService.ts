import { InteractableModule } from '@/game/modules/entity/InteractableModule';
import { VisualFeedbackModule } from '@/game/modules/entity/VisualFeedbackModule';
import type { I_InteractionEntityConfig } from '@/game/modules/entity/interaction.types';
import type { I_ModuleContext } from '@/scenes/scenes.types';
import type { Object3D } from 'three';

/**
 * Interaction Service
 * Pure service that coordinates interaction detection and visual feedback
 *
 * NOT a module - just a service that wraps entity modules
 * Passed via context to scene modules for easy access
 *
 * Benefits:
 * - Single source of truth for interactions
 * - No need for I_InteractableModule interface
 * - No need for setInteractionSystem/clearInteractionSystem boilerplate
 * - Modules just call `ctx.services.interaction.register()` directly
 */
export class InteractionService {
  private interactionModule: InteractableModule;
  private visualFeedbackModule: VisualFeedbackModule;
  private initialized = false;

  constructor() {
    this.interactionModule = new InteractableModule();
    this.visualFeedbackModule = new VisualFeedbackModule();
  }

  /**
   * Initialize the service with scene context
   * Called once by GameScene during initialization
   */
  async start(ctx: I_ModuleContext): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️ [InteractionService] Already initialized');
      return;
    }

    // Convert to entity context (entity modules don't need full scene context)
    const entityCtx: I_ModuleContext = {
      scene: ctx.scene,
      lifecycle: ctx.lifecycle,
      sceneName: ctx.sceneName,
      engine: ctx.engine,
      settings: ctx.settings,
      camera: ctx.camera,
      character: ctx.character,
    };

    // Start entity modules
    await this.interactionModule.start(entityCtx);
    await this.visualFeedbackModule.start(entityCtx);

    this.initialized = true;
    console.log('✅ [InteractionService] Initialized');
  }

  /**
   * Register an object as interactable
   * Call this from any scene module to make objects interactive
   *
   * @example
   * ```typescript
   * ctx.services.interaction.register('box-1', mesh, {
   *   hoverable: true,
   *   clickable: true,
   *   tooltip: { title: 'Mysterious Box' }
   * });
   * ```
   */
  register(id: string, object: Object3D, config: I_InteractionEntityConfig): void {
    if (!this.initialized) {
      console.warn('⚠️ [InteractionService] Not initialized yet, queueing registration:', id);
    }
    this.interactionModule.register(id, object, config);
  }

  /**
   * Unregister an interactable object
   */
  unregister(id: string): void {
    this.interactionModule.unregister(id);
  }

  /**
   * Enable/disable the interaction system
   */
  setEnabled(enabled: boolean): void {
    this.interactionModule.setEnabled(enabled);
  }

  /**
   * Update (called each frame by GameScene)
   */
  update(delta: number): void {
    // InteractableModule and VisualFeedbackModule are event-driven, no updates needed
    // But keep this method in case we need it later
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    await this.interactionModule.destroy();
    await this.visualFeedbackModule.destroy();
    this.initialized = false;
    console.log('🧹 [InteractionService] Destroyed');
  }
}
