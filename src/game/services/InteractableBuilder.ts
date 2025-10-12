import { Object3D } from 'three';
import type { I_InteractableBehaviors, ReactiveValue, I_InteractionCallbacks } from '../modules/entity/interaction.types';
import { InteractionService } from './InteractionService';

/**
 * Fluent Builder for Interactable Registration
 * Provides clean API with behavior composition
 *
 * Supports reactive values via getter functions!
 * Example: .withHoverGlow(0xff8c00, () => gameConfig.interaction.hoverGlowIntensity)
 */
export class InteractableBuilder {
  private id: string;
  private object3D: Object3D;
  private behaviors: I_InteractableBehaviors = {};
  private service: InteractionService;
  private buildScheduled = false;

  public constructor(id: string, object3D: Object3D, service: InteractionService) {
    this.id = id;
    this.object3D = object3D;
    this.service = service;
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
   * Manually trigger build (optional - auto-builds after microtask)
   */
  public build(): void {
    this.service._internalRegister(this.id, this.object3D, this.behaviors);
  }

  /**
   * Auto-build after current sync execution completes
   * Allows method chaining to complete before registration
   */
  private scheduleAutoBuild(): void {
    if (!this.buildScheduled) {
      this.buildScheduled = true;
      Promise.resolve().then(() => this.build());
    }
  }
}
