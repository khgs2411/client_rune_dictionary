import { Intersection } from 'three';
import { GameComponent } from '../../GameComponent';
import type { I_GameContext, I_Interactable, I_InteractionBuilder } from '../../types';
import { MeshComponent } from '../rendering/MeshComponent';

export interface I_HoverConfig {
  glowColor?: number;
  glowIntensity?: number | (() => number);
  tooltip?: {
    title: string;
    description?: string;
  };
  onStart?: (intersection: Intersection) => void;
  onEnd?: () => void;
}

/**
 * HoverComponent - Enables hover interaction for GameObject
 *
 * This component requires:
 * - MeshComponent (for interaction registration)
 *
 * Implements I_Interactable for lifecycle coordination by GameObject
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new HoverComponent({
 *   glowColor: 0xff8c00,
 *   tooltip: { title: 'Box', description: 'A mysterious box' }
 * }));
 * ```
 */
export class HoverComponent extends GameComponent implements I_Interactable {
  private config: I_HoverConfig;

  constructor(config: I_HoverConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    // No registration here - happens in registerWithService
  }

  /**
   * Register hover behavior with InteractionService builder
   * Called by GameObject during interaction lifecycle coordination
   */
  registerWithService(builder: I_InteractionBuilder, context: I_GameContext): void {
    if (this.config.glowColor) {
      builder.withHoverGlow(this.config.glowColor, this.config.glowIntensity);
    }

    if (this.config.tooltip) {
      builder.withTooltip(this.config.tooltip.title, this.config.tooltip.description);
    }

    if (this.config.onStart || this.config.onEnd) {
      builder.withHoverCallbacks({
        onStart: this.config.onStart,
        onEnd: this.config.onEnd,
      });
    }
  }

  destroy(): void {
    // Interaction cleanup happens automatically in InteractionService.destroy()
  }
}
