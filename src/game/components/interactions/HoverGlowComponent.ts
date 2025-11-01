import type { I_SceneContext } from '@/game/common/scenes.types';
import { ComponentPriority, GameComponent } from '@/game/GameComponent';
import type { Intersection } from 'three';
import { MeshComponent } from '../rendering/MeshComponent';

export interface I_HoverGlowConfig {
  glowColor?: number; // Color for emissive glow (default: 0xff8c00 - orange)
  glowIntensity?: number; // Emissive intensity (default: 0.3)
  tooltip?: {
    title: string;
    description?: string;
  };
}

/**
 * HoverGlowComponent - Applies glow effect on hover
 *
 * Uses InteractionService for hover detection and VFXService for visual effects.
 * Requires MeshComponent to provide the mesh for raycasting.
 *
 * This replaces the hover functionality from InteractableBuilder with a
 * reusable component that can be added to any GameObject.
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new HoverGlowComponent({
 *   glowColor: 0xff8c00,
 *   glowIntensity: 0.3,
 *   tooltip: { title: 'Mysterious Box', description: 'Click to interact' }
 * }));
 * ```
 *
 * Priority: INTERACTION (300) - Runs after rendering and physics
 */
export class HoverGlowComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION;

  private config: I_HoverGlowConfig;
  private unregister?: () => void;

  constructor(config: I_HoverGlowConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    // Require MeshComponent for raycasting
    const meshComp = this.requireComponent(MeshComponent);

    const interaction = context.getService('interaction');
    const vfx = context.getService('vfx');

    const glowColor = this.config.glowColor ?? 0xff8c00; // Orange
    const glowIntensity = this.config.glowIntensity ?? 0.3;

    // Register hover callbacks with InteractionService
    this.unregister = interaction.registerHover(
      `${this.gameObject.id}-hover`,
      meshComp.mesh,
      {
        onStart: (intersection: Intersection) => {
          // Apply glow via VFXService
          vfx.applyEmissive(meshComp.mesh, glowColor, glowIntensity);

          // Show tooltip if configured
          if (this.config.tooltip) {
            vfx.showTooltip(
              intersection.point,
              this.config.tooltip.title,
              this.config.tooltip.description,
            );
          }
        },
        onEnd: () => {
          // Restore original emissive
          vfx.restoreEmissive(meshComp.mesh);

          // Hide tooltip
          if (this.config.tooltip) {
            vfx.hideTooltip();
          }
        },
      },
    );

  }

  destroy(): void {
    // Unregister from InteractionService
    if (this.unregister) {
      this.unregister();
    }

  }
}
