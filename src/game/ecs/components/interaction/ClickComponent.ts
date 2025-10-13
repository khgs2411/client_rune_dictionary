import { Intersection } from 'three';
import { GameComponent } from '../../GameComponent';
import type { I_GameContext, I_Interactable, I_InteractionBuilder } from '../../gameobject.types';
import { MeshComponent } from '../rendering/MeshComponent';

export interface I_ClickConfig {
  vfxText?: string;
  vfxColor?: string;
  onClick?: (intersection: Intersection) => void;
}

/**
 * ClickComponent - Enables click interaction for GameObject
 *
 * This component requires:
 * - MeshComponent (for interaction registration)
 *
 * Implements I_Interactable for lifecycle coordination by GameObject
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new ClickComponent({
 *   vfxText: 'CLICK!',
 *   onClick: () => console.log('Clicked!')
 * }));
 * ```
 */
export class ClickComponent extends GameComponent implements I_Interactable {
  private config: I_ClickConfig;

  constructor(config: I_ClickConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    // No registration here - happens in registerWithService
  }

  /**
   * Register click behavior with InteractionService builder
   * Called by GameObject during interaction lifecycle coordination
   */
  registerInteractions(builder: I_InteractionBuilder, context: I_GameContext): void {
    if (this.config.vfxText) {
      builder.withClickVFX(this.config.vfxText, this.config.vfxColor);
    }

    if (this.config.onClick) {
      builder.withClickCallbacks({ onClick: this.config.onClick });
    }
  }

  destroy(): void {
    // Interaction cleanup happens automatically in InteractionService.destroy()
  }
}
