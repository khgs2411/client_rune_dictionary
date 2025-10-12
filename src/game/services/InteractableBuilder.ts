import type {
  I_InteractableBehaviors,
  I_HoverBehavior,
  I_ClickBehavior,
  I_DragBehavior,
  ReactiveValue,
} from '../modules/entity/interaction.types';
import type { Intersection, Vector3 } from 'three';

/**
 * Fluent Builder for Interactable Configuration (Refactored v2)
 * Cleaner grouping by behavior type: hover, click, drag
 *
 * Supports reactive values via getter functions!
 * Example: .withHoverGlow(0xff8c00, () => gameConfig.interaction.hoverGlowIntensity)
 */
export class InteractableBuilder {
  private behaviors: I_InteractableBehaviors = {};
  private built = false;
  private onBuild?: (behaviors: I_InteractableBehaviors) => void;

  public constructor(onBuild?: (behaviors: I_InteractableBehaviors) => void) {
    this.onBuild = onBuild;
  }

  // ============================================
  // HOVER BEHAVIORS
  // ============================================

  /**
   * Add hover glow behavior (emissive material change)
   * @param color - Glow color (hex)
   * @param intensity - Static number or getter function for reactive value
   */
  public withHoverGlow(color: number = 0xff8c00, intensity: ReactiveValue<number> = 0.3): this {
    if (!this.behaviors.hover) this.behaviors.hover = {};
    this.behaviors.hover.glow = { color, intensity };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add tooltip behavior (world-space billboard)
   */
  public withTooltip(title: string, description?: string): this {
    if (!this.behaviors.hover) this.behaviors.hover = {};
    this.behaviors.hover.tooltip = { title, description };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add custom hover callbacks
   */
  public withHoverCallbacks(callbacks: I_HoverBehavior['customCallbacks']): this {
    if (!this.behaviors.hover) this.behaviors.hover = {};
    this.behaviors.hover.customCallbacks = callbacks;
    this.scheduleAutoBuild();
    return this;
  }

  // ============================================
  // CLICK BEHAVIORS
  // ============================================

  /**
   * Add click VFX behavior (text sprite effect)
   */
  public withClickVFX(text: string = 'POW!', color?: string): this {
    if (!this.behaviors.click) this.behaviors.click = {};
    this.behaviors.click.vfx = { text, color };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add camera shake behavior (screen shake on click)
   * @param intensity - Static number or getter function for reactive value
   * @param duration - Static number or getter function for reactive value
   */
  public withCameraShake(
    intensity: ReactiveValue<number> = 0.1,
    duration: ReactiveValue<number> = 0.3,
  ): this {
    if (!this.behaviors.click) this.behaviors.click = {};
    this.behaviors.click.shake = { intensity, duration };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add particle effect behavior (particle burst on click)
   * @param count - Static number or getter function for reactive value
   * @param color - Particle color (hex)
   * @param speed - Static number or getter function for reactive value
   */
  public withParticles(
    count: ReactiveValue<number> = 20,
    color?: number,
    speed?: ReactiveValue<number>,
  ): this {
    if (!this.behaviors.click) this.behaviors.click = {};
    this.behaviors.click.particles = { count, color, speed };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add custom click callbacks
   */
  public withClickCallbacks(callbacks: I_ClickBehavior['customCallbacks']): this {
    if (!this.behaviors.click) this.behaviors.click = {};
    this.behaviors.click.customCallbacks = callbacks;
    this.scheduleAutoBuild();
    return this;
  }

  // ============================================
  // DRAG BEHAVIORS (NEW!)
  // ============================================

  /**
   * Add drag behavior (move object on XZ plane)
   * Only works in editor mode!
   *
   * @example
   * ```typescript
   * .withDrag({
   *   lockAxis: ['y'],
   *   snapToGrid: 0.5,
   *   onEnd: (pos) => console.log('Moved to:', pos)
   * })
   * ```
   */
  public withDrag(options?: {
    lockAxis?: ('x' | 'y' | 'z')[];
    snapToGrid?: number;
    onStart?: (pos: Vector3) => void;
    onMove?: (pos: Vector3) => void;
    onEnd?: (pos: Vector3) => void;
  }): this {
    this.behaviors.drag = {
      enabled: true,
      lockAxis: options?.lockAxis,
      snapToGrid: options?.snapToGrid,
      customCallbacks: {
        onStart: options?.onStart,
        onMove: options?.onMove,
        onEnd: options?.onEnd,
      },
    };
    this.scheduleAutoBuild();
    return this;
  }

  // ============================================
  // BUILD
  // ============================================

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
    if (!this.built && this.onBuild) {
      this.built = true;
      Promise.resolve().then(() => this.onBuild!(this.behaviors));
    }
  }
}
