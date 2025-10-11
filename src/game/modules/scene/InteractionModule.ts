import SceneModule from '@/game/SceneModule';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { useEventListener } from '@vueuse/core';
import { Object3D, Raycaster, Vector2, Vector3 } from 'three';
import { useRxjs } from 'topsyde-utils';
import type {
  I_HoverState,
  I_Interactable,
  I_InteractionConfig,
  I_InteractionEvent,
} from '../entity/interaction.types';

/**
 * Interaction Module
 * Handles raycasting, hover detection, click detection for all scene objects
 * Mobile-first: supports both mouse and touch
 *
 * Emits events via RxJS 'interaction' channel:
 * - hover-start: Mouse/touch enters object
 * - hover-end: Mouse/touch leaves object
 * - hover-hold: Hover held for threshold duration (default 500ms)
 * - click: Object clicked/tapped (no drag)
 */
export class InteractionModule extends SceneModule implements I_SceneModule {
  private context!: I_ModuleContext;
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private interactables = new Map<string, I_Interactable>();
  private currentHover: I_HoverState | null = null;
  private hoverCheckInterval: number | null = null;

  // Config
  private config: Required<I_InteractionConfig> = {
    hoverHoldThreshold: 500,
    clickMaxDragDistance: 5,
    enabled: true,
  };

  // Events
  private events = useRxjs('interaction');

  // Track pointer down position for click vs drag detection
  private pointerDownPos: { x: number; y: number } | null = null;

  constructor(config?: I_InteractionConfig) {
    super('interaction');
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  async start(context: I_ModuleContext): Promise<void> {
    this.context = context;

    // Get canvas element
    const canvas = context.engine.renderer.domElement;

    // Listen to pointer move (VueUse - works for mouse and touch)
    useEventListener(canvas, 'pointermove', this.onPointerMove.bind(this));

    // Listen to pointer down/up for click detection
    useEventListener(canvas, 'pointerdown', this.onPointerDown.bind(this));
    useEventListener(canvas, 'pointerup', this.onPointerUp.bind(this));

    // Start hover hold checker (runs every 100ms)
    this.hoverCheckInterval = window.setInterval(this.checkHoverHold.bind(this), 100);

    console.log('🖱️ [InteractionModule] Initialized (hover threshold: %dms)', this.config.hoverHoldThreshold);
    this.initialized(context.sceneName);
  }

  update(delta: number): void {
    // No per-frame updates needed (event-driven)
  }

  async destroy(): Promise<void> {
    this.events.$unsubscribe();
    if (this.hoverCheckInterval) {
      clearInterval(this.hoverCheckInterval);
    }
    this.interactables.clear();
    this.currentHover = null;
  }

  /**
   * Register an object as interactable
   */
  register(interactable: I_Interactable): void {
    this.interactables.set(interactable.id, interactable);
    console.log('🎯 [InteractionModule] Registered:', interactable.id, interactable.object3D);
  }

  /**
   * Unregister an interactable
   */
  unregister(id: string): void {
    this.interactables.delete(id);
  }

  /**
   * Enable/disable interaction system
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled && this.currentHover) {
      // Clear hover state when disabled
      this.endHover();
    }
  }

  /**
   * Pointer move handler
   */
  private onPointerMove(event: PointerEvent): void {
    if (!this.config.enabled) return;

    this.updatePointerPosition(event);
    this.performRaycast();
  }

  /**
   * Pointer down handler
   */
  private onPointerDown(event: PointerEvent): void {
    if (!this.config.enabled) return;

    this.pointerDownPos = { x: event.clientX, y: event.clientY };
  }

  /**
   * Pointer up handler (click detection)
   */
  private onPointerUp(event: PointerEvent): void {
    if (!this.config.enabled || !this.pointerDownPos) return;

    // Calculate drag distance
    const dx = event.clientX - this.pointerDownPos.x;
    const dy = event.clientY - this.pointerDownPos.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    // Only fire click if drag distance is small (not a camera drag)
    if (dragDistance <= this.config.clickMaxDragDistance) {
      this.updatePointerPosition(event);
      this.performClick();
    }

    this.pointerDownPos = null;
  }

  /**
   * Update normalized pointer coordinates (-1 to 1)
   */
  private updatePointerPosition(event: PointerEvent): void {
    const canvas = this.context.engine.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Perform raycast and update hover state
   */
  private performRaycast(): void {
    if (!this.context || !this.context.camera) return;

    // Get camera from context (passed from scene)
    const camera = this.context.camera.instance;
    if (!camera) {
      console.warn('🖱️ [InteractionModule] No camera found');
      return;
    }

    // Setup raycaster
    this.raycaster.setFromCamera(this.pointer, camera);

    // Collect all interactable Object3Ds
    const objects = Array.from(this.interactables.values()).map((i) => i.object3D);

    // Raycast (recursive: true to check children)
    const intersects = this.raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
      // Find which interactable was hit (check parents)
      const hitObject = intersects[0].object;
      const interactable = this.findInteractable(hitObject);

      if (interactable) {
        const worldPos = intersects[0].point;
        const screenPos = this.worldToScreen(worldPos);

        // Start hover if new object
        if (!this.currentHover || this.currentHover.interactable.id !== interactable.id) {
          this.endHover(); // End previous hover
          this.startHover(interactable, worldPos, screenPos);
          console.log('🖱️ [InteractionModule] Hover started:', interactable.id);
        }
        return;
      } else {
        console.log('🖱️ [InteractionModule] Hit object but no interactable found:', hitObject);
      }
    }

    // No hit - end hover if active
    if (this.currentHover) {
      this.endHover();
    }
  }

  /**
   * Perform click detection (raycast on pointer up)
   */
  private performClick(): void {
    if (!this.context || !this.currentHover) return;

    console.log('🖱️ [InteractionModule] Clicked:', this.currentHover.interactable.id);

    const event: I_InteractionEvent = {
      type: 'click',
      interactable: this.currentHover.interactable,
      worldPosition: this.currentHover.worldPosition,
      screenPosition: this.currentHover.screenPosition,
      timestamp: Date.now(),
    };

    this.events.$next('click', event);
  }

  /**
   * Find interactable by checking object and its parents
   */
  private findInteractable(object: Object3D): I_Interactable | null {
    // Check if this object is registered
    for (const [id, interactable] of this.interactables) {
      if (interactable.object3D === object || interactable.object3D.uuid === object.uuid) {
        return interactable;
      }

      // Check if object is a child of this interactable
      if (object.parent && this.isChildOf(object, interactable.object3D)) {
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
  private startHover(
    interactable: I_Interactable,
    worldPosition: Vector3,
    screenPosition: { x: number; y: number }
  ): void {
    this.currentHover = {
      interactable,
      startTime: Date.now(),
      worldPosition: worldPosition as any,
      screenPosition,
    };

    const event: I_InteractionEvent = {
      type: 'hover-start',
      interactable,
      worldPosition: worldPosition as any,
      screenPosition,
      timestamp: Date.now(),
    };

    this.events.$next('hover-start', event);
  }

  /**
   * End hover state
   */
  private endHover(): void {
    if (!this.currentHover) return;

    const event: I_InteractionEvent = {
      type: 'hover-end',
      interactable: this.currentHover.interactable,
      worldPosition: this.currentHover.worldPosition,
      screenPosition: this.currentHover.screenPosition,
      timestamp: Date.now(),
    };

    this.events.$next('hover-end', event);
    this.currentHover = null;
  }

  /**
   * Check if hover has been held long enough
   */
  private checkHoverHold(): void {
    if (!this.currentHover) return;

    const elapsed = Date.now() - this.currentHover.startTime;

    if (elapsed >= this.config.hoverHoldThreshold) {
      const event: I_InteractionEvent = {
        type: 'hover-hold',
        interactable: this.currentHover.interactable,
        worldPosition: this.currentHover.worldPosition,
        screenPosition: this.currentHover.screenPosition,
        timestamp: Date.now(),
      };

      this.events.$next('hover-hold', event);

      // Reset start time to avoid spam
      this.currentHover.startTime = Date.now();
    }
  }

  /**
   * Convert world position to screen coordinates (for UI overlay)
   */
  private worldToScreen(worldPos: Vector3): { x: number; y: number } {
    if (!this.context.camera) return { x: 0, y: 0 };

    const camera = this.context.camera.instance;
    if (!camera) return { x: 0, y: 0 };

    const vector = (worldPos as any).clone();
    vector.project(camera);

    const canvas = this.context.engine.renderer.domElement;
    const widthHalf = canvas.width / 2;
    const heightHalf = canvas.height / 2;

    return {
      x: vector.x * widthHalf + widthHalf,
      y: -(vector.y * heightHalf) + heightHalf,
    };
  }
}
