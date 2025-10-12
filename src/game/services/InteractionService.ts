import type { I_ModuleContext, I_SceneService } from '@/scenes/scenes.types';
import type {
  I_InteractableObject,
  I_InteractionCallbacks,
  I_InteractableBehaviors,
  I_HoverState,
  I_InteractionConfig,
  ReactiveValue,
} from '@/game/modules/entity/interaction.types';
import { useEventListener } from '@vueuse/core';
import { Camera, Intersection, Object3D, Raycaster, Vector2 } from 'three';
import type { VFXModule } from '@/game/modules/scene/VFXModule';

/**
 * Fluent Builder for Interactable Registration
 * Provides clean API with behavior composition
 *
 * Supports reactive values via getter functions!
 * Example: .withHoverGlow(0xff8c00, () => gameConfig.interaction.hoverGlowIntensity)
 */
class InteractableBuilder {
  private id: string;
  private object3D: Object3D;
  private behaviors: I_InteractableBehaviors = {};
  private service: InteractionService;
  private buildScheduled = false;

  constructor(id: string, object3D: Object3D, service: InteractionService) {
    this.id = id;
    this.object3D = object3D;
    this.service = service;
  }

  /**
   * Add hover glow behavior (emissive material change)
   * @param intensity - Static number or getter function for reactive value
   */
  withHoverGlow(color: number = 0xff8c00, intensity: ReactiveValue<number> = 0.3): this {
    this.behaviors.hoverGlow = { color, intensity };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add click VFX behavior (POW! text sprite)
   */
  withClickVFX(text?: string, color?: string): this {
    this.behaviors.clickVFX = { text: text || 'POW!', color };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add tooltip behavior (world-space billboard)
   */
  withTooltip(title: string, description?: string): this {
    this.behaviors.tooltip = { title, description };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add camera shake behavior (screen shake on click)
   * @param intensity - Static number or getter function for reactive value
   * @param duration - Static number or getter function for reactive value
   */
  withCameraShake(intensity: ReactiveValue<number> = 0.1, duration: ReactiveValue<number> = 0.3): this {
    this.behaviors.cameraShake = { intensity, duration };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add particle effect behavior (particle burst on click)
   * @param count - Static number or getter function for reactive value
   * @param speed - Static number or getter function for reactive value
   */
  withParticleEffect(count: ReactiveValue<number> = 20, color?: number, speed?: ReactiveValue<number>): this {
    this.behaviors.particleEffect = { count, color, speed };
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Add custom callbacks (for complex business logic)
   */
  withCustomCallbacks(callbacks: I_InteractionCallbacks): this {
    this.behaviors.customCallbacks = callbacks;
    this.scheduleAutoBuild();
    return this;
  }

  /**
   * Manually trigger build (optional - auto-builds after microtask)
   */
  build(): void {
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
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private interactables = new Map<string, I_InteractableObject>();
  private currentHover: I_HoverState | null = null;
  private pointerDirty = false;
  private pointerDownPos: { x: number; y: number } | null = null;

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

    const canvas = ctx.engine.renderer.domElement;

    // Event-driven raycasting (only when pointer moves!)
    useEventListener(canvas, 'pointermove', (e: PointerEvent) => {
      if (!this.config.enabled) return;
      this.updatePointerPosition(e, canvas);
      this.pointerDirty = true;
    });

    // Click detection
    useEventListener(canvas, 'pointerdown', (e: PointerEvent) => {
      if (!this.config.enabled) return;
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    useEventListener(canvas, 'pointerup', (e: PointerEvent) => {
      if (!this.config.enabled || !this.pointerDownPos) return;

      // Check if this was a click (not a drag)
      const dx = e.clientX - this.pointerDownPos.x;
      const dy = e.clientY - this.pointerDownPos.y;
      const dragDistance = Math.sqrt(dx * dx + dy * dy);

      if (dragDistance <= this.config.clickMaxDragDistance) {
        this.handleClick();
      }

      this.pointerDownPos = null;
    });

    // Clear hover when pointer leaves canvas
    useEventListener(canvas, 'pointerleave', () => {
      this.endHover();
    });

    console.log('✅ [InteractionService] Initialized (hybrid mode, hover threshold: %dms)', this.config.hoverHoldThreshold);
  }

  /**
   * Update (called each frame by GameScene)
   * ONLY runs raycasting if pointer moved (event-driven)
   * Always checks hover-hold timing (lightweight)
   */
  update(_delta: number): void {
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
    this.interactables.clear();
    this.currentHover = null;
    console.log('🧹 [InteractionService] Destroyed');
  }

  // ============================================
  // PUBLIC API
  // ============================================

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
  register(id: string, object3D: Object3D): InteractableBuilder {
    return new InteractableBuilder(id, object3D, this);
  }

  /**
   * Unregister interactable
   */
  unregister(id: string): void {
    const obj = this.interactables.get(id);
    if (obj && this.currentHover?.object.id === id) {
      this.endHover();
    }
    this.interactables.delete(id);
  }

  /**
   * Enable/disable interaction system
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled && this.currentHover) {
      this.endHover();
    }
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Internal registration (called by builder)
   */
  _internalRegister(id: string, object3D: Object3D, behaviors: I_InteractableBehaviors): void {
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

    this.interactables.set(id, {
      id,
      object3D,
      callbacks,
      behaviors,
      hoverable,
      clickable,
    });

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
  private buildCallbacks(object3D: Object3D, behaviors: I_InteractableBehaviors): I_InteractionCallbacks {
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
    vfx: VFXModule | null
  ): void {
    if (behaviors.hoverGlow) {
      const { color, intensity } = behaviors.hoverGlow;

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
    vfx: VFXModule | null
  ): void {
    if (behaviors.clickVFX) {
      const { text, color } = behaviors.clickVFX;

      callbacks.onClick = (intersection) => {
        vfx?.showClickEffect(intersection.point, text, color);
        behaviors.customCallbacks?.onClick?.(intersection);
      };
    } else if (behaviors.customCallbacks?.onClick) {
      // No VFX, but custom callback exists
      callbacks.onClick = behaviors.customCallbacks.onClick;
    }
  }

  /**
   * Build tooltip callbacks (world-space billboard)
   */
  private buildTooltipCallbacks(
    callbacks: I_InteractionCallbacks,
    behaviors: I_InteractableBehaviors,
    object3D: Object3D,
    vfx: VFXModule | null
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
    vfx: VFXModule | null
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
    vfx: VFXModule | null
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
          speed !== undefined ? this.resolveValue(speed) : undefined
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
   * Update pointer position (normalized device coordinates)
   */
  private updatePointerPosition(event: PointerEvent, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Perform raycast (only when pointer moves)
   */
  private performRaycast(camera: Camera): void {
    this.raycaster.setFromCamera(this.pointer, camera);

    const objects = Array.from(this.interactables.values()).map((i) => i.object3D);
    const intersects = this.raycaster.intersectObjects(objects, true);

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
   * Handle click (pointer up with minimal drag)
   */
  private handleClick(): void {
    if (!this.currentHover || !this.currentHover.object.clickable) return;

    // Perform fresh raycast for accurate click position
    if (this.context.camera) {
      this.raycaster.setFromCamera(this.pointer, this.context.camera.instance);
      const intersects = this.raycaster.intersectObject(this.currentHover.object.object3D, true);

      if (intersects.length > 0) {
        this.currentHover.object.callbacks.onClick?.(intersects[0]);
      }
    }
  }
}
