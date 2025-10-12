import type { I_ModuleContext, I_SceneService } from '@/scenes/scenes.types';
import type {
  I_InteractableObject,
  I_InteractionCallbacks,
  I_InteractableBehaviors,
  I_HoverState,
  I_InteractionConfig,
} from '@/game/modules/entity/interaction.types';
import { Camera, Intersection, Object3D } from 'three';
import type { VFXModule } from '@/game/modules/scene/VFXModule';
import { Raycast } from '@/game/utils/Raycast';
import { Mouse } from '@/game/utils/Mouse';
import { InteractableBuilder } from './InteractableBuilder';
import { Guards } from 'topsyde-utils';

/**
 * Interaction Service (Refactored)
 * Hybrid event-driven + frame-based architecture with fluent API
 *
 * Features:
 * - Event-driven raycasting (only when pointer moves) ✅
 * - Frame-based hover-hold timing ✅
 * - Fluent builder API for clean registration ✅
 * - Behavior composition (hover glow, click VFX, tooltips) ✅
 * - Custom callbacks for complex logic ✅
 *
 * Usage:
 * ```typescript
 * context.services.interaction
 *   .register('box-1', mesh)
 *   .withHoverGlow()
 *   .withClickVFX('BAM!')
 *   .withTooltip('Mysterious Box', 'Click to open');
 * ```
 */
export class InteractionService implements I_SceneService {
  private context!: I_ModuleContext;
  private raycast = new Raycast();
  private mouse!: Mouse;
  private interactables = new Map<string, I_InteractableObject>();
  private interactableObjects: Object3D[] = []; // Cached array for raycasting (zero allocation per frame)
  private currentHover: I_HoverState | null = null;
  private pointerDirty = false;

  // Config
  private config: Required<I_InteractionConfig> = {
    hoverHoldThreshold: 500,
    clickMaxDragDistance: 5,
    enabled: true,
  };

  constructor(config?: I_InteractionConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Initialize service with scene context
   */
  async start(ctx: I_ModuleContext): Promise<void> {
    this.context = ctx;

    // Initialize Mouse utility with optimized configuration
    this.mouse = new Mouse({
      target: ctx.engine.renderer.domElement,
      preventContextMenu: true,
      trackScroll: false, // Don't need scroll for interactions
      dragThreshold: this.config.clickMaxDragDistance,
    });

    // Event-driven raycasting (only when pointer moves!)
    this.mouse.on('move', () => {
      if (!this.config.enabled) return;
      this.pointerDirty = true;
    });

    // Click detection (Mouse utility handles drag threshold automatically)
    this.mouse.on('click', this.handleClick.bind(this));

    // Clear hover when pointer leaves canvas
    this.mouse.on('leave', this.endHover.bind(this));

    console.log(
      '✅ [InteractionService] Initialized (hybrid mode, hover threshold: %dms)',
      this.config.hoverHoldThreshold,
    );
  }

  /**
   * Update (called each frame by GameScene)
   * ONLY runs raycasting if pointer moved (event-driven)
   * Always checks hover-hold timing (lightweight)
   */
  public update(_delta: number): void {
    if (!this.config.enabled || !this.context.camera) return;

    // Raycast ONLY if pointer moved
    if (this.pointerDirty) {
      this.performRaycast(this.context.camera.instance);
      this.pointerDirty = false;
    }

    // Check hover-hold timing (lightweight)
    if (this.currentHover && !this.currentHover.hoverHoldFired) {
      const elapsed = Date.now() - this.currentHover.startTime;
      if (elapsed >= this.config.hoverHoldThreshold) {
        this.currentHover.object.callbacks.onHoverHold?.(elapsed);
        this.currentHover.hoverHoldFired = true;
      }
    }
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    this.mouse.destroy();
    this.interactables.clear();
    this.currentHover = null;
    console.log('🧹 [InteractionService] Destroyed');
  }

  /**
   * Register interactable with fluent builder API
   *
   * @example
   * ```typescript
   * ctx.services.interaction
   *   .register('box-1', mesh)
   *   .withHoverGlow()
   *   .withClickVFX('BAM!')
   *   .withTooltip('Mysterious Box');
   * ```
   */
  public register(id: string, object3D: Object3D): InteractableBuilder {
    // Builder auto-registers via callback when chaining completes
    return new InteractableBuilder((behaviors) => {
      this._register(id, object3D, behaviors);
    });
  }

  /**
   * Unregister interactable
   */
  public unregister(id: string): void {
    const obj = this.interactables.get(id);
    if (!obj) return;

    // Clear hover if this object is currently hovered
    if (this.currentHover?.object.id === id) {
      this.endHover();
    }

    // Remove from both data structures
    this.removeInteractable(id);
  }

  /**
   * Enable/disable interaction system
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled && this.currentHover) {
      this.endHover();
    }
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Add interactable to both data structures (keeps them in sync)
   */
  private addInteractable(interactable: I_InteractableObject): void {
    this.interactables.set(interactable.id, interactable);
    this.interactableObjects.push(interactable.object3D);
  }

  /**
   * Remove interactable from both data structures (keeps them in sync)
   */
  private removeInteractable(id: string): void {
    const interactable = this.interactables.get(id);
    if (!interactable) return;

    // Remove from map
    this.interactables.delete(id);

    // Remove from array (find index and splice)
    const index = this.interactableObjects.indexOf(interactable.object3D);
    if (index !== -1) {
      this.interactableObjects.splice(index, 1);
    }
  }

  /**
   * Internal registration (called by builder callback)
   */
  private _register(id: string, object3D: Object3D, behaviors: I_InteractableBehaviors): void {
    const callbacks = this.buildCallbacks(object3D, behaviors);

    // Derive hoverable/clickable from behaviors
    const hoverable = !!(
      behaviors.hoverGlow ||
      behaviors.tooltip ||
      behaviors.customCallbacks?.onHoverStart ||
      behaviors.customCallbacks?.onHoverEnd ||
      behaviors.customCallbacks?.onHoverHold
    );

    const clickable = !!(
      behaviors.clickVFX ||
      behaviors.cameraShake ||
      behaviors.particleEffect ||
      behaviors.customCallbacks?.onClick
    );

    // FIX: If object is clickable but not hoverable, make it hoverable!
    // (click detection requires hover tracking)
    const isHoverable = hoverable || clickable;

    const interactable: I_InteractableObject = {
      id,
      object3D,
      callbacks,
      behaviors,
      hoverable: isHoverable, // Use computed hoverable (includes clickable objects)
      clickable,
    };

    // Add to both data structures
    this.addInteractable(interactable);

    console.log('  ↳ Registered interactable:', id, behaviors);
  }

  /**
   * Resolve reactive value (evaluate getter if function)
   */
  private resolveValue<T>(value: T | (() => T)): T {
    return typeof value === 'function' ? (value as () => T)() : value;
  }

  /**
   * Build callbacks from behaviors (behavior composition)
   * Reactive values are evaluated at callback execution time!
   */
  private buildCallbacks(
    object3D: Object3D,
    behaviors: I_InteractableBehaviors,
  ): I_InteractionCallbacks {
    const callbacks: I_InteractionCallbacks = {};
    const vfx = this.getVFXModule();

    // Build callbacks for each behavior
    this.buildHoverGlowCallbacks(callbacks, behaviors, object3D, vfx);
    this.buildClickVFXCallbacks(callbacks, behaviors, vfx);
    this.buildTooltipCallbacks(callbacks, behaviors, object3D, vfx);
    this.buildCameraShakeCallbacks(callbacks, behaviors, vfx);
    this.buildParticleCallbacks(callbacks, behaviors, vfx);

    return callbacks;
  }

  /**
   * Build hover glow callbacks (emissive material change)
   */
  private buildHoverGlowCallbacks(
    callbacks: I_InteractionCallbacks,
    behaviors: I_InteractableBehaviors,
    object3D: Object3D,
    vfx: VFXModule | null,
  ): void {
    if (behaviors.hoverGlow) {
      const { color, intensity } = Guards.IsObject(behaviors.hoverGlow)
        ? behaviors.hoverGlow
        : { color: 0xff8c00, intensity: 0.2 };

      callbacks.onHoverStart = (intersection) => {
        // ✨ Evaluate intensity dynamically!
        vfx?.applyEmissive(object3D, color, this.resolveValue(intensity));
        behaviors.customCallbacks?.onHoverStart?.(intersection);
      };

      callbacks.onHoverEnd = () => {
        vfx?.restoreEmissive(object3D);
        behaviors.customCallbacks?.onHoverEnd?.();
      };
    } else if (behaviors.customCallbacks?.onHoverStart || behaviors.customCallbacks?.onHoverEnd) {
      // No glow, but custom callbacks exist
      callbacks.onHoverStart = behaviors.customCallbacks.onHoverStart;
      callbacks.onHoverEnd = behaviors.customCallbacks.onHoverEnd;
    }
  }

  /**
   * Build click VFX callbacks (text sprite effects)
   */
  private buildClickVFXCallbacks(
    callbacks: I_InteractionCallbacks,
    behaviors: I_InteractableBehaviors,
    vfx: VFXModule | null,
  ): void {
    if (behaviors.clickVFX) {
      const { text, color } = Guards.IsObject(behaviors.clickVFX)
        ? behaviors.clickVFX
        : { text: undefined, color: undefined };
      const originalClick = callbacks.onClick;

      callbacks.onClick = (intersection) => {
        vfx?.showClickEffect(intersection.point, text, color);
        behaviors.customCallbacks?.onClick?.(intersection);
        originalClick?.(intersection); // Chain previous onClick
      };
    } else if (behaviors.customCallbacks?.onClick) {
      // No VFX, but custom callback exists - still chain!
      const originalClick = callbacks.onClick;
      callbacks.onClick = (intersection) => {
        behaviors.customCallbacks?.onClick?.(intersection);
        originalClick?.(intersection);
      };
    }
  }

  /**
   * Build tooltip callbacks (world-space billboard)
   */
  private buildTooltipCallbacks(
    callbacks: I_InteractionCallbacks,
    behaviors: I_InteractableBehaviors,
    object3D: Object3D,
    vfx: VFXModule | null,
  ): void {
    if (behaviors.tooltip) {
      const { title, description } = behaviors.tooltip;

      const originalHoverHold = callbacks.onHoverHold || behaviors.customCallbacks?.onHoverHold;

      callbacks.onHoverHold = (duration) => {
        // Show tooltip on first hover-hold trigger
        if (duration >= this.config.hoverHoldThreshold) {
          vfx?.showTooltip(object3D.position, title, description);
        }
        originalHoverHold?.(duration);
      };

      // Hide tooltip on hover end
      const originalHoverEnd = callbacks.onHoverEnd;
      callbacks.onHoverEnd = () => {
        vfx?.hideTooltip();
        originalHoverEnd?.();
      };
    }
  }

  /**
   * Build camera shake callbacks (click-triggered shake)
   */
  private buildCameraShakeCallbacks(
    callbacks: I_InteractionCallbacks,
    behaviors: I_InteractableBehaviors,
    vfx: VFXModule | null,
  ): void {
    if (behaviors.cameraShake) {
      const { intensity, duration } = behaviors.cameraShake;
      const originalClick = callbacks.onClick;

      callbacks.onClick = (intersection) => {
        // ✨ Evaluate intensity and duration dynamically!
        vfx?.shakeCamera(this.resolveValue(intensity), this.resolveValue(duration));
        originalClick?.(intersection);
      };
    }
  }

  /**
   * Build particle effect callbacks (click-triggered burst)
   */
  private buildParticleCallbacks(
    callbacks: I_InteractionCallbacks,
    behaviors: I_InteractableBehaviors,
    vfx: VFXModule | null,
  ): void {
    if (behaviors.particleEffect) {
      const { count, color, speed } = behaviors.particleEffect;
      const originalClick = callbacks.onClick;

      callbacks.onClick = (intersection) => {
        // ✨ Evaluate count and speed dynamically!
        vfx?.spawnParticles(
          intersection.point,
          this.resolveValue(count),
          color,
          speed !== undefined ? this.resolveValue(speed) : undefined,
        );
        originalClick?.(intersection);
      };
    }
  }

  /**
   * Get VFX module from services (helper)
   */
  private getVFXModule(): VFXModule | null {
    return this.context?.services?.vfx || null;
  }

  /**
   * Perform raycast (only when pointer moves)
   * Uses cached array for zero allocation per frame
   */
  private performRaycast(camera: Camera): void {
    const intersects = this.raycast.fromCamera(
      this.mouse.normalizedPositionRef,
      camera,
      this.interactableObjects,
    );

    if (intersects.length > 0) {
      const interactable = this.findInteractable(intersects[0].object);

      if (interactable && interactable.hoverable) {
        // Start hover if new object
        if (!this.currentHover || this.currentHover.object.id !== interactable.id) {
          this.endHover();
          this.startHover(interactable, intersects[0]);
        }
        return;
      }
    }

    // No hit - end hover
    if (this.currentHover) {
      this.endHover();
    }
  }

  /**
   * Find interactable by checking object and its parents
   */
  private findInteractable(object: Object3D): I_InteractableObject | null {
    for (const interactable of this.interactables.values()) {
      if (
        interactable.object3D === object ||
        interactable.object3D.uuid === object.uuid ||
        this.isChildOf(object, interactable.object3D)
      ) {
        return interactable;
      }
    }
    return null;
  }

  /**
   * Check if object is a child of parent
   */
  private isChildOf(object: Object3D, parent: Object3D): boolean {
    let current: Object3D | null = object;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    return false;
  }

  /**
   * Start hover state
   */
  private startHover(interactable: I_InteractableObject, intersection: Intersection): void {
    this.currentHover = {
      object: interactable,
      startTime: Date.now(),
      hoverHoldFired: false,
    };

    interactable.callbacks.onHoverStart?.(intersection);
  }

  /**
   * End hover state
   */
  private endHover(): void {
    if (!this.currentHover) return;

    this.currentHover.object.callbacks.onHoverEnd?.();
    this.currentHover = null;
  }

  /**
   * Handle click (Mouse utility ensures this is a click, not a drag)
   */
  private handleClick(): void {
    if (!this.currentHover || !this.currentHover.object.clickable || !this.config.enabled) return;

    // Perform fresh raycast for accurate click position
    if (this.context.camera) {
      const intersects = this.raycast.fromCamera(
        this.mouse.normalizedPositionRef,
        this.context.camera.instance,
        [this.currentHover.object.object3D],
      );

      if (intersects.length > 0) {
        this.currentHover.object.callbacks.onClick?.(intersects[0]);
      }
    }
  }
}
