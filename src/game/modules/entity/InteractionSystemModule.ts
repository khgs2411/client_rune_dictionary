import { I_ModuleContext, I_UpdateableModule } from '@/scenes/scenes.types';
import { InteractionEntityModule } from './InteractionEntityModule';
import { VisualFeedbackEntityModule } from './VisualFeedbackEntityModule';
import type { I_InteractionEntityConfig } from './interaction.types';
import type { Object3D } from 'three';
import SceneModule from '@/game/SceneModule';

/**
 * Interaction System Module
 * Unified module that handles both interaction detection and visual feedback
 * Combines InteractionEntityModule and VisualFeedbackEntityModule into a single interface
 */
export class InteractionSystemModule extends SceneModule implements I_UpdateableModule {
  private interaction = new InteractionEntityModule();
  private visualFeedback = new VisualFeedbackEntityModule();

  constructor(moduleName: string = 'interactionSystem') {
    super(moduleName);
  }

  async start(context: I_ModuleContext): Promise<void> {
    await this.interaction.start(context);
    await this.visualFeedback.start(context);
    this.initialized(context.sceneName);
  }

  /**
   * Register an object as interactable
   */
  public register(id: string, object: Object3D, config: I_InteractionEntityConfig): void {
    this.interaction.register(id, object, config);
  }

  /**
   * Unregister an interactable object
   */
  public unregister(id: string): void {
    this.interaction.unregister(id);
  }

  public update(delta: number, ...args: any[]): void {
    this.interaction.update();
    this.visualFeedback.update();
  }

  public async destroy(): Promise<void> {
    await this.interaction.destroy();
    await this.visualFeedback.destroy();
  }

  /**
   * Enable/disable the interaction system
   */
  setEnabled(enabled: boolean): void {
    this.interaction.setEnabled(enabled);
  }
}
