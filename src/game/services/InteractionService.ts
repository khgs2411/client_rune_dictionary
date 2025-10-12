import type { I_ModuleContext, I_SceneService } from '@/scenes/scenes.types';
import type {
  I_InteractableObject,
  I_HoverState,
  I_DragState,
  I_InteractionConfig,
  I_InteractableBehaviors,
  ReactiveValue,
} from '@/game/modules/entity/interaction.types';
import { Camera, Intersection, Object3D, Plane, Vector3 } from 'three';
import { Raycast } from '@/game/utils/Raycast';
import { Mouse } from '@/game/utils/Mouse';
import { InteractableBuilder } from './InteractableBuilder';
import { useGameConfigStore, type GameConfig } from '@/stores/gameConfig.store';

/**
 * Interaction Service (Refactored v2)
 * Cleaner architecture with separated hover, click, and drag systems
 *
 * Features:
 * - Event-driven hover detection (only raycasts when pointer moves) ✅
 * - Click behaviors (VFX, shake, particles) - disabled in editor mode ✅
 * - Drag system (move objects on XZ plane) - only in editor mode ✅
 * - Fluent builder API ✅
 * - Leverages Mouse utility's built-in drag detection ✅
 *
 * Usage:
 * ```typescript
 * context.services.interaction
 *   .register('box-1', mesh)
 *   .withHoverGlow()
 *   .withClickVFX('POW!')
 *   .withDrag({ lockAxis: ['y'] });
 * ```
 */
export class InteractionService implements I_SceneService {
  private context!: I_ModuleContext;
  private config: GameConfig;

  // Utilities
  private raycast = new Raycast();
  private mouse!: Mouse;

  // State
  private objects = new Map<string, I_InteractableObject>();
  private objectArray: Object3D[] = []; // Cached array for raycasting
  private hoverState: I_HoverState | null = null;
  private dragState: I_DragState | null = null;
  private pointerDirty = false;

  // Config
  private interactionConfig: Required<I_InteractionConfig> = {
    hoverHoldThreshold: 500,
    enabled: true,
  };

  constructor(config?: I_InteractionConfig) {
    if (config) {
      this.interactionConfig = { ...this.interactionConfig, ...config };
    }
    // Initialize game config early (before start() is called)
    this.config = useGameConfigStore();
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  /**
   * Initialize service with scene context
   */
  async start(ctx: I_ModuleContext): Promise<void> {
    this.context = ctx;
    // Config already initialized in constructor

    // Initialize Mouse utility with drag detection
    this.mouse = new Mouse({
      target: ctx.engine.renderer.domElement,
      preventContextMenu: true,
      trackScroll: false,
      dragThreshold: 5, // 5px threshold for drag vs click
    });

    // HOVER SYSTEM: Track pointer movement
    this.mouse.on('move', () => {
      if (!this.interactionConfig.enabled) return;
      this.pointerDirty = true;
    });

    // DRAG SYSTEM: Use Mouse utility's built-in drag events!
    this.mouse.on('dragstart', this.handleDragStart.bind(this));
    this.mouse.on('drag', this.handleDrag.bind(this));
    this.mouse.on('dragend', this.handleDragEnd.bind(this));

    // CLICK SYSTEM: Mouse utility handles drag threshold automatically
    this.mouse.on('click', this.handleClick.bind(this));

    // CLEANUP: Clear hover when pointer leaves canvas
    this.mouse.on('leave', this.clearHover.bind(this));

    console.log(
      '✅ [InteractionService] Initialized (hover threshold: %dms, drag threshold: 5px)',
      this.interactionConfig.hoverHoldThreshold,
    );
  }

  /**
   * Update (called each frame by GameScene)
   * ONLY runs raycasting if pointer moved (event-driven hover)
   * Always checks hover-hold timing (lightweight)
   */
  public update(_delta: number): void {
    if (!this.interactionConfig.enabled || !this.context.camera) return;

    // RAYCAST: Only when pointer moved AND not dragging
    if (this.pointerDirty && !this.dragState) {
      this.updateHover();
      this.pointerDirty = false;
    }

    // HOVER-HOLD: Check timing
    if (this.hoverState && !this.hoverState.holdFired) {
      const elapsed = Date.now() - this.hoverState.startTime;
      if (elapsed >= this.interactionConfig.hoverHoldThreshold) {
        this.fireHoverHold(elapsed);
        this.hoverState.holdFired = true;
      }
    }
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    this.mouse.destroy();
    this.objects.clear();
    this.objectArray = [];
    this.hoverState = null;
    this.dragState = null;
    console.log('🧹 [InteractionService] Destroyed');
  }

  // ============================================
  // HOVER SYSTEM
  // ============================================

  private updateHover(): void {
    if (!this.context.camera) return;
    const intersects = this.raycast.fromCamera(
      this.mouse.normalizedPositionRef,
      this.context.camera.instance,
      this.objectArray,
    );

    if (intersects.length > 0) {
      const object = this.findObject(intersects[0].object);

      if (object && object.behaviors.hover) {
        // Start new hover or continue existing
        if (!this.hoverState || this.hoverState.objectId !== object.id) {
          this.clearHover();
          this.startHover(object, intersects[0]);
        }
        return;
      }
    }

    // No hit - clear hover
    this.clearHover();
  }

  private startHover(object: I_InteractableObject, intersection: Intersection): void {
    this.hoverState = {
      objectId: object.id,
      startTime: Date.now(),
      holdFired: false,
    };

    const hover = object.behaviors.hover;
    if (!hover) return;

    // Apply hover glow
    if (hover.glow) {
      this.context.services.vfx.applyEmissive(
        object.object3D,
        hover.glow.color,
        this.resolve(hover.glow.intensity),
      );
    }

    // Fire custom callback
    hover.customCallbacks?.onStart?.(intersection);
  }

  private clearHover(): void {
    if (!this.hoverState) return;

    const object = this.objects.get(this.hoverState.objectId);
    if (!object) return;
    const hover = object?.behaviors.hover;

    // Restore glow
    if (hover?.glow) {
      this.context.services.vfx.restoreEmissive(object.object3D);
    }

    // Hide tooltip
    this.context.services.vfx.hideTooltip();

    // Fire custom callback
    hover?.customCallbacks?.onEnd?.();

    this.hoverState = null;
  }

  private fireHoverHold(duration: number): void {
    if (!this.hoverState) return;

    const object = this.objects.get(this.hoverState.objectId);
    if (!object) return;
    const hover = object?.behaviors.hover;

    // Show tooltip
    if (hover?.tooltip) {
      this.context.services.vfx.showTooltip(
        object.object3D.position,
        hover.tooltip.title,
        hover.tooltip.description,
      );
    }

    // Fire custom callback
    hover?.customCallbacks?.onHold?.(duration);
  }

  // ============================================
  // CLICK SYSTEM
  // ============================================

  private handleClick(): void {
    if (!this.hoverState) return;

    const object = this.objects.get(this.hoverState.objectId);
    const click = object?.behaviors.click;

    if (!click) return;

    // 🛠️ EDITOR MODE: Disable click behaviors
    if (this.config.editor.enabled) {
      console.log('🛠️ [InteractionService] Editor mode: Click behaviors disabled');
      return;
    }

    // Perform fresh raycast for accurate position
    const intersects = this.raycast.fromCamera(
      this.mouse.normalizedPositionRef,
      this.context.camera!.instance,
      [object.object3D],
    );

    if (intersects.length === 0) return;

    const intersection = intersects[0];

    // Apply click VFX
    if (click.vfx) {
      this.context.services.vfx.showClickEffect(
        intersection.point,
        click.vfx.text,
        click.vfx.color,
      );
    }

    // Apply camera shake
    if (click.shake) {
      this.context.services.vfx.shakeCamera(
        this.resolve(click.shake.intensity),
        this.resolve(click.shake.duration),
      );
    }

    // Apply particles
    if (click.particles) {
      this.context.services.vfx.spawnParticles(
        intersection.point,
        this.resolve(click.particles.count),
        click.particles.color,
        click.particles.speed ? this.resolve(click.particles.speed) : undefined,
      );
    }

    // Fire custom callback
    click.customCallbacks?.onClick?.(intersection);
  }

  // ============================================
  // DRAG SYSTEM (NEW!)
  // ============================================

  private handleDragStart(): void {
    if (!this.hoverState) return;

    const object = this.objects.get(this.hoverState.objectId);
    if (!object) return;
    const drag = object?.behaviors.drag;

    // Check if draggable
    if (!drag?.enabled) return;

    // 🛠️ EDITOR MODE: Only allow dragging in editor mode
    if (!this.config.editor.enabled) return;

    // Create drag state
    this.dragState = {
      objectId: object.id,
      startPos: object.object3D.position.clone(),
      currentPos: object.object3D.position.clone(),
      dragPlane: this.createDragPlane(object.object3D.position.y),
    };

    // Apply drag styling (opacity)
    this.applyDragStyle(object.object3D, true);

    // Fire custom callback
    drag.customCallbacks?.onStart?.(this.dragState.startPos.clone());

    console.log('🎯 [InteractionService] Started dragging:', object.id);
  }

  private handleDrag(): void {
    if (!this.dragState) return;

    const object = this.objects.get(this.dragState.objectId);
    const drag = object?.behaviors.drag;

    if (!object || !drag) return;

    // Raycast to drag plane
    const intersectionPoint = this.raycastToPlane(this.dragState.dragPlane);
    if (!intersectionPoint) return;

    const newPos = intersectionPoint.clone();

    // Apply axis locks (default: lock Y)
    const lockedAxes = drag.lockAxis || ['y'];
    if (lockedAxes.includes('x')) {
      newPos.x = this.dragState.startPos.x;
    }
    if (lockedAxes.includes('y')) {
      newPos.y = this.dragState.startPos.y;
    }
    if (lockedAxes.includes('z')) {
      newPos.z = this.dragState.startPos.z;
    }

    // Apply grid snapping
    const snapSize = drag.snapToGrid ?? this.config.editor.snapToGrid;
    if (snapSize && this.config.editor.enabled) {
      newPos.x = Math.round(newPos.x / snapSize) * snapSize;
      newPos.z = Math.round(newPos.z / snapSize) * snapSize;
    }

    // Update object position
    object.object3D.position.copy(newPos);
    this.dragState.currentPos.copy(newPos);

    // Fire custom callback
    drag.customCallbacks?.onMove?.(newPos.clone());
  }

  private handleDragEnd(): void {
    if (!this.dragState) return;

    const object = this.objects.get(this.dragState.objectId);
    const drag = object?.behaviors.drag;

    if (!object || !drag) return;

    const finalPos = this.dragState.currentPos.clone();

    // Restore styling
    this.applyDragStyle(object.object3D, false);

    // Fire custom callback
    drag.customCallbacks?.onEnd?.(finalPos);

    console.log('✅ [InteractionService] Finished dragging at:', finalPos);

    // Clear drag state
    this.dragState = null;
  }

  // ============================================
  // DRAG HELPERS
  // ============================================

  private createDragPlane(y: number): Plane {
    return new Plane(new Vector3(0, 1, 0), -y); // XZ plane at object height
  }

  private raycastToPlane(plane: Plane): Vector3 | null {
    const raycaster = this.raycast.getRaycaster();
    raycaster.setFromCamera(this.mouse.normalizedPositionRef, this.context.camera!.instance);

    const intersectionPoint = new Vector3();
    const hit = raycaster.ray.intersectPlane(plane, intersectionPoint);

    return hit ? intersectionPoint : null;
  }

  private applyDragStyle(object: Object3D, isDragging: boolean): void {
    const opacity = isDragging ? this.config.editor.dragOpacity : 1.0;

    object.traverse((child) => {
      if ((child as any).material) {
        const material = (child as any).material;
        material.transparent = isDragging;
        material.opacity = opacity;
        material.needsUpdate = true;
      }
    });
  }

  // ============================================
  // UTILITIES
  // ============================================

  private findObject(threeObj: Object3D): I_InteractableObject | null {
    for (const obj of this.objects.values()) {
      if (obj.object3D === threeObj || this.isChildOf(threeObj, obj.object3D)) {
        return obj;
      }
    }
    return null;
  }

  private isChildOf(child: Object3D, parent: Object3D): boolean {
    let current: Object3D | null = child;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    return false;
  }

  private resolve<T>(value: ReactiveValue<T>): T {
    return typeof value === 'function' ? (value as () => T)() : value;
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
   *   .withClickVFX('POW!')
   *   .withDrag({ lockAxis: ['y'] });
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
    const obj = this.objects.get(id);
    if (!obj) return;

    // Clear states if active
    if (this.hoverState?.objectId === id) {
      this.clearHover();
    }
    if (this.dragState?.objectId === id) {
      this.dragState = null;
    }

    // Remove from collections
    this.objects.delete(id);
    const index = this.objectArray.indexOf(obj.object3D);
    if (index !== -1) {
      this.objectArray.splice(index, 1);
    }
  }

  /**
   * Enable/disable interaction system
   */
  public setEnabled(enabled: boolean): void {
    this.interactionConfig.enabled = enabled;
    if (!enabled) {
      this.clearHover();
      this.dragState = null;
    }
  }

  // ============================================
  // INTERNAL
  // ============================================

  private _register(id: string, object3D: Object3D, behaviors: I_InteractableBehaviors): void {
    const interactable: I_InteractableObject = {
      id,
      object3D,
      behaviors,
    };

    this.objects.set(id, interactable);
    this.objectArray.push(object3D);

    console.log('  ↳ Registered interactable:', id, behaviors);
  }
}
