import type { I_InteractableBehaviors, ReactiveValue, I_InteractionCallbacks } from '../modules/entity/interaction.types';

/**
 * Fluent Builder for Interactable Configuration
 * Pure data builder with no side effects
 *
 * Supports reactive values via getter functions!
 * Example: .withHoverGlow(0xff8c00, () => gameConfig.interaction.hoverGlowIntensity)
 */
export class InteractableBuilder {
  private behaviors: I_InteractableBehaviors = {};
  private manualBuild = false;
  private onBuild?: (behaviors: I_InteractableBehaviors) => void;

  public constructor(onBuild?: (behaviors: I_InteractableBehaviors) => void) {
    this.onBuild = onBuild;
  }

  /**
   * Add hover glow behavior (emissive material change)
   * @param intensity - Static number or getter function for reactive value
   */
  public withHoverGlow(color: number = 0xff8c00, intensity: ReactiveValue<number> = 0.3): this {
    this.behaviors.hoverGlow = { color, intensity };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add click VFX behavior (POW! text sprite)
   */
  public withClickVFX(text?: string, color?: string): this {
    this.behaviors.clickVFX = { text: text || 'POW!', color };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add tooltip behavior (world-space billboard)
   */
  public withTooltip(title: string, description?: string): this {
    this.behaviors.tooltip = { title, description };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add camera shake behavior (screen shake on click)
   * @param intensity - Static number or getter function for reactive value
   * @param duration - Static number or getter function for reactive value
   */
  public withCameraShake(intensity: ReactiveValue<number> = 0.1, duration: ReactiveValue<number> = 0.3): this {
    this.behaviors.cameraShake = { intensity, duration };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add particle effect behavior (particle burst on click)
   * @param count - Static number or getter function for reactive value
   * @param speed - Static number or getter function for reactive value
   */
  public withParticleEffect(count: ReactiveValue<number> = 20, color?: number, speed?: ReactiveValue<number>): this {
    this.behaviors.particleEffect = { count, color, speed };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add custom callbacks (for complex business logic)
   */
  public withCustomCallbacks(callbacks: I_InteractionCallbacks): this {
    this.behaviors.customCallbacks = callbacks;
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Get the built configuration (for manual use)
   */
  public build(): I_InteractableBehaviors {
    return this.behaviors;
  }

  /**
   * Auto-build after current sync execution completes
   * Allows method chaining to complete before registration
   */
  private scheduleAutoBuild(): void {
    if (!this.manualBuild && this.onBuild) {
      this.manualBuild = true;
      Promise.resolve().then(() => this.onBuild!(this.behaviors));
    }
  }
}
