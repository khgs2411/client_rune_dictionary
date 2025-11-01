import type { I_SceneContext, I_SceneService } from '@/game/common/scenes.types';
import { Mouse } from '@/game/utils/Mouse';
import { Raycast } from '@/game/utils/Raycast';
import { useGameConfigStore } from '@/stores/config.store';
import { GridHelper, Intersection, Mesh, Object3D, Plane, Vector3 } from 'three';
import SceneService from './SceneService';

/**
 * Callback types for interaction events
 */
export type MouseClickCallback = (event: MouseEvent, intersection?: Intersection) => void;
export type KeyPressCallback = (event: KeyboardEvent) => void;
export type HoverCallback = (intersection: Intersection) => void;
export type HoverEndCallback = () => void;
export type DragStartCallback = (startPos: Vector3) => void;
export type DragMoveCallback = (currentPos: Vector3) => void;
export type DragEndCallback = (endPos: Vector3) => void;

/**
 * Registered interaction handlers
 */
interface MouseClickHandler {
  id: string;
  button: 'left' | 'right' | 'middle';
  callback: MouseClickCallback;
  requireHover?: boolean; // Only trigger if hovering over registered object
  object3D?: Object3D; // Optional - for raycasting
}

interface KeyPressHandler {
  id: string;
  key: string;
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean };
  callback: KeyPressCallback;
}

interface HoverHandler {
  id: string;
  object3D: Object3D;
  onStart?: HoverCallback;
  onEnd?: HoverEndCallback;
}

interface DragHandler {
  id: string;
  object3D: Object3D;
  onStart?: DragStartCallback;
  onMove?: DragMoveCallback;
  onEnd?: DragEndCallback;
  lockAxis?: ('x' | 'y' | 'z')[];
  snapToGrid?: number | (() => number); // Can be static value or dynamic getter
}

/**
 * InteractionService - Clean API layer for input event registration
 *
 * This service provides a clean API for registering input event callbacks.
 * It handles the low-level event listening, raycasting, and drag detection,
 * but delegates all behavior logic to components via callbacks.
 *
 * Key principles:
 * - Pure event registration API (like PhysicsService)
 * - No VFX logic (components decide what VFX to use)
 * - No behavior logic (components implement their own logic)
 * - Reusable for any input-driven component
 *
 * API:
 * - registerMouseClick() - Register mouse click callback
 * - registerKeyPress() - Register keyboard callback
 * - registerHover() - Register hover callbacks with raycast detection
 * - registerDrag() - Register drag callbacks with plane intersection
 * - unregister() - Clean up registered handler
 */
export class InteractionService extends SceneService implements I_SceneService {
  // Utilities
  private raycast = new Raycast();
  private mouse!: Mouse;

  // Handler registries
  private mouseClickHandlers = new Map<string, MouseClickHandler>();
  private keyPressHandlers = new Map<string, KeyPressHandler>();
  private hoverHandlers = new Map<string, HoverHandler>();
  private dragHandlers = new Map<string, DragHandler>();

  // Hover state
  private currentHover: { id: string; object3D: Object3D } | null = null;
  private pointerDirty = false;

  // Drag state
  private activeDrag: {
    id: string;
    startPos: Vector3;
    currentPos: Vector3;
    dragPlane: Plane;
  } | null = null;

  // Cached arrays for raycasting
  private hoverObjectsArray: Object3D[] = [];

  // Grid helper for drag visualization
  private gridHelper: GridHelper | null = null;

  // Opacity cache for drag (to restore original values)
  private opacityCache = new Map<string, number>();

  // ============================================
  // LIFECYCLE
  // ============================================

  async init(ctx: I_SceneContext): Promise<void> {
    this.context = ctx;

    // Initialize Mouse utility
    this.mouse = new Mouse({
      target: ctx.engine.renderer.domElement,
      preventContextMenu: true,
      trackScroll: false,
      dragThreshold: 5,
    });

    // Track pointer movement for hover detection
    this.mouse.on('move', () => {
      this.pointerDirty = true;
    });

    // Mouse click events
    this.mouse.on('click', this.handleClick.bind(this));

    // Drag events
    this.mouse.on('dragstart', this.handleDragStart.bind(this));
    this.mouse.on('drag', this.handleDrag.bind(this));
    this.mouse.on('dragend', this.handleDragEnd.bind(this));

    // Clear hover when pointer leaves
    this.mouse.on('leave', () => this.clearHover());

    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Create grid helper for drag visualization (100x100 grid, 1 unit divisions)
    this.gridHelper = new GridHelper(100, 100, 0x444444, 0x222222);
    this.gridHelper.visible = false; // Hidden by default
    ctx.scene.add(this.gridHelper);
    ctx.cleanupRegistry.registerObject(this.gridHelper);

  }

  public update(_delta: number): void {
    // Update hover detection if pointer moved
    if (this.pointerDirty && !this.activeDrag) {
      this.updateHover();
      this.pointerDirty = false;
    }
  }

  async destroy(): Promise<void> {
    this.mouse.destroy();
    this.mouseClickHandlers.clear();
    this.keyPressHandlers.clear();
    this.hoverHandlers.clear();
    this.dragHandlers.clear();
    this.opacityCache.clear();
    this.gridHelper = null; // Cleanup is handled by cleanupRegistry
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  // ============================================
  // MOUSE CLICK API
  // ============================================

  /**
   * Register a mouse click callback
   *
   * @param id - Unique identifier
   * @param button - Mouse button to listen for
   * @param callback - Function to call when clicked
   * @param options - Optional configuration
   * @returns Unregister function
   *
   * @example
   * ```typescript
   * interactionService.registerMouseClick('my-click', 'left', (event, intersection) => {
   * }, { requireHover: true, object3D: mesh });
   * ```
   */
  public registerMouseClick(
    id: string,
    button: 'left' | 'right' | 'middle',
    callback: MouseClickCallback,
    options?: {
      requireHover?: boolean;
      object3D?: Object3D;
    },
  ): () => void {
    this.mouseClickHandlers.set(id, {
      id,
      button,
      callback,
      requireHover: options?.requireHover,
      object3D: options?.object3D,
    });

    return () => this.unregisterMouseClick(id);
  }

  private unregisterMouseClick(id: string): void {
    this.mouseClickHandlers.delete(id);
  }

  // ============================================
  // KEYBOARD API
  // ============================================

  /**
   * Register a keyboard callback
   *
   * @param id - Unique identifier
   * @param key - Key to listen for (e.g., '1', 'a', 'Escape')
   * @param callback - Function to call when key pressed
   * @param modifiers - Optional modifier keys (ctrl, shift, alt)
   * @returns Unregister function
   *
   * @example
   * ```typescript
   * interactionService.registerKeyPress('spawn-fireball', '1', (event) => {
   *   spawner.spawn('fireball', ownerId);
   * });
   * ```
   */
  public registerKeyPress(
    id: string,
    key: string,
    callback: KeyPressCallback,
    modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean },
  ): () => void {
    this.keyPressHandlers.set(id, {
      id,
      key,
      modifiers,
      callback,
    });

    return () => this.unregisterKeyPress(id);
  }

  private unregisterKeyPress(id: string): void {
    this.keyPressHandlers.delete(id);
  }

  // ============================================
  // HOVER API
  // ============================================

  /**
   * Register hover callbacks with raycast detection
   *
   * @param id - Unique identifier
   * @param object3D - Object to detect hover on
   * @param callbacks - Hover start/end callbacks
   * @returns Unregister function
   *
   * @example
   * ```typescript
   * interactionService.registerHover('my-hover', mesh, {
   *   onStart: (intersection) => {
   *     vfxService.applyGlow(mesh, 0xff8c00, 0.3);
   *   },
   *   onEnd: () => {
   *     vfxService.restoreGlow(mesh);
   *   }
   * });
   * ```
   */
  public registerHover(
    id: string,
    object3D: Object3D,
    callbacks: {
      onStart?: HoverCallback;
      onEnd?: HoverEndCallback;
    },
  ): () => void {
    this.hoverHandlers.set(id, {
      id,
      object3D,
      onStart: callbacks.onStart,
      onEnd: callbacks.onEnd,
    });

    // Update cached array for raycasting
    this.rebuildHoverArray();

    return () => this.unregisterHover(id);
  }

  private unregisterHover(id: string): void {
    this.hoverHandlers.delete(id);
    this.rebuildHoverArray();

    // Clear hover if this was the active one
    if (this.currentHover?.id === id) {
      this.clearHover();
    }
  }

  private rebuildHoverArray(): void {
    this.hoverObjectsArray = Array.from(this.hoverHandlers.values()).map((h) => h.object3D);
  }

  // ============================================
  // DRAG API
  // ============================================

  /**
   * Register drag callbacks
   *
   * @param id - Unique identifier
   * @param object3D - Object to drag
   * @param callbacks - Drag start/move/end callbacks
   * @param options - Drag configuration (axis lock, grid snap)
   * @returns Unregister function
   *
   * @example
   * ```typescript
   * interactionService.registerDrag('my-drag', mesh, {
   *   onMove: (currentPos) => mesh.position.copy(currentPos),
   * }, { lockAxis: ['y'], snapToGrid: 0.5 });
   *
   * // Or use a getter for dynamic values:
   * interactionService.registerDrag('my-drag', mesh, {
   *   onMove: (currentPos) => mesh.position.copy(currentPos),
   * }, { snapToGrid: () => gameConfig.editor.snapToGrid });
   * ```
   */
  public registerDrag(
    id: string,
    object3D: Object3D,
    callbacks: {
      onStart?: DragStartCallback;
      onMove?: DragMoveCallback;
      onEnd?: DragEndCallback;
    },
    options?: {
      lockAxis?: ('x' | 'y' | 'z')[];
      snapToGrid?: number | (() => number); // Can be static or dynamic
    },
  ): () => void {
    this.dragHandlers.set(id, {
      id,
      object3D,
      onStart: callbacks.onStart,
      onMove: callbacks.onMove,
      onEnd: callbacks.onEnd,
      lockAxis: options?.lockAxis,
      snapToGrid: options?.snapToGrid,
    });

    return () => this.unregisterDrag(id);
  }

  private unregisterDrag(id: string): void {
    this.dragHandlers.delete(id);

    // Cancel drag if this was the active one
    if (this.activeDrag?.id === id) {
      this.activeDrag = null;
    }
  }

  // ============================================
  // GENERIC UNREGISTER
  // ============================================

  /**
   * Unregister any handler by ID
   */
  public unregister(id: string): void {
    this.unregisterMouseClick(id);
    this.unregisterKeyPress(id);
    this.unregisterHover(id);
    this.unregisterDrag(id);
  }

  // ============================================
  // INTERNAL EVENT HANDLERS
  // ============================================

  private handleClick(): void {
    const buttonMap = { left: 0, middle: 1, right: 2 };
    this.mouseClickHandlers.forEach((handler) => {

      // Get current mouse button from last event
      const lastButton = (this.mouse as any).lastButton || 0;

      if (lastButton !== buttonMap[handler.button]) return;

      // If requireHover, check if hovering over the object
      if (handler.requireHover && handler.object3D) {
        if (!this.currentHover || this.currentHover.object3D !== handler.object3D) {
          return;
        }
      }

      // Raycast to get intersection point (if object3D provided)
      let intersection: Intersection | undefined;
      if (handler.object3D && this.context.camera) {
        const intersects = this.raycast.fromCamera(
          this.mouse.normalizedPositionRef,
          this.context.camera.instance,
          [handler.object3D],
        );
        intersection = intersects[0];
      }

      // Trigger callback (components decide what to do)
      handler.callback(new MouseEvent('click'), intersection);
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keyPressHandlers.forEach((handler) => {
      if (event.key !== handler.key) return;

      // Check modifiers
      if (handler.modifiers) {
        if (handler.modifiers.ctrl && !event.ctrlKey) return;
        if (handler.modifiers.shift && !event.shiftKey) return;
        if (handler.modifiers.alt && !event.altKey) return;
      }

      event.preventDefault();
      handler.callback(event);
    });
  }

  private updateHover(): void {
    if (!this.context.camera || this.hoverObjectsArray.length === 0) return;

    const intersects = this.raycast.fromCamera(
      this.mouse.normalizedPositionRef,
      this.context.camera.instance,
      this.hoverObjectsArray,
    );

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      const handler = this.findHoverHandler(hitObject);

      if (handler) {
        // Start new hover or continue existing
        if (!this.currentHover || this.currentHover.id !== handler.id) {
          this.clearHover();
          this.startHover(handler, intersects[0]);
        }
        return;
      }
    }

    // No hit - clear hover
    this.clearHover();
  }

  private findHoverHandler(object3D: Object3D): HoverHandler | null {
    for (const handler of this.hoverHandlers.values()) {
      if (handler.object3D === object3D || this.isChildOf(object3D, handler.object3D)) {
        return handler;
      }
    }
    return null;
  }

  private findDragHandler(object3D: Object3D): DragHandler | null {
    for (const handler of this.dragHandlers.values()) {
      if (handler.object3D === object3D || this.isChildOf(object3D, handler.object3D)) {
        return handler;
      }
    }
    return null;
  }

  private startHover(handler: HoverHandler, intersection: Intersection): void {
    this.currentHover = { id: handler.id, object3D: handler.object3D };
    handler.onStart?.(intersection);
  }

  private clearHover(): void {
    if (!this.currentHover) return;

    const handler = this.hoverHandlers.get(this.currentHover.id);
    handler?.onEnd?.();

    this.currentHover = null;
  }

  private handleDragStart(): void {
    if (!this.currentHover) return;

    // Find drag handler by object3D (not by ID, as drag and hover may have different IDs)
    const handler = this.findDragHandler(this.currentHover.object3D);
    if (!handler) return;

    const startPos = handler.object3D.position.clone();

    this.activeDrag = {
      id: handler.id,
      startPos,
      currentPos: startPos.clone(),
      dragPlane: new Plane(new Vector3(0, 1, 0), -startPos.y),
    };

    const gameConfig = useGameConfigStore();

    // Show grid helper if enabled in editor settings
    if (this.gridHelper && gameConfig.editor.showGrid) {
      this.gridHelper.position.y = startPos.y; // Position grid at drag plane height
      this.gridHelper.visible = true;
    }

    // Apply drag opacity (read live from config)
    this.applyDragOpacity(handler.object3D, gameConfig.editor.dragOpacity);

    handler.onStart?.(startPos);
  }

  private handleDrag(): void {
    if (!this.activeDrag || !this.context.camera) return;

    const handler = this.dragHandlers.get(this.activeDrag.id);
    if (!handler) return;

    // Raycast to drag plane
    const raycaster = this.raycast.getRaycaster();
    raycaster.setFromCamera(this.mouse.normalizedPositionRef, this.context.camera.instance);

    const intersectionPoint = new Vector3();
    const hit = raycaster.ray.intersectPlane(this.activeDrag.dragPlane, intersectionPoint);

    if (!hit) return;

    let newPos = intersectionPoint.clone();

    // Apply axis locks
    if (handler.lockAxis) {
      if (handler.lockAxis.includes('x')) newPos.x = this.activeDrag.startPos.x;
      if (handler.lockAxis.includes('y')) newPos.y = this.activeDrag.startPos.y;
      if (handler.lockAxis.includes('z')) newPos.z = this.activeDrag.startPos.z;
    }

    // Apply grid snapping (resolve value if it's a function)
    if (handler.snapToGrid) {
      const snapValue = typeof handler.snapToGrid === 'function'
        ? handler.snapToGrid()
        : handler.snapToGrid;

      if (snapValue > 0) {
        newPos.x = Math.round(newPos.x / snapValue) * snapValue;
        newPos.z = Math.round(newPos.z / snapValue) * snapValue;
      }
    }

    this.activeDrag.currentPos.copy(newPos);
    handler.onMove?.(newPos);
  }

  private handleDragEnd(): void {
    if (!this.activeDrag) return;

    const handler = this.dragHandlers.get(this.activeDrag.id);
    if (handler) {
      // Restore opacity before calling onEnd
      this.restoreDragOpacity(handler.object3D);

      handler.onEnd?.(this.activeDrag.currentPos.clone());
    }

    // Hide grid helper
    if (this.gridHelper) {
      this.gridHelper.visible = false;
    }

    this.activeDrag = null;
  }

  // ============================================
  // UTILITIES
  // ============================================

  private isChildOf(child: Object3D, parent: Object3D): boolean {
    let current: Object3D | null = child;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    return false;
  }

  /**
   * Apply drag opacity to object (makes it semi-transparent while dragging)
   */
  private applyDragOpacity(object3D: Object3D, opacity: number): void {
    object3D.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as Mesh;
        const mat = mesh.material as any; // Material types vary

        if (mat && mat.opacity !== undefined) {
          // Cache original opacity
          if (!this.opacityCache.has(mesh.uuid)) {
            this.opacityCache.set(mesh.uuid, mat.opacity);
          }

          // Apply drag opacity
          mat.transparent = true; // Ensure transparency is enabled
          mat.opacity = opacity;
          mat.needsUpdate = true;
        }
      }
    });
  }

  /**
   * Restore original opacity after drag
   */
  private restoreDragOpacity(object3D: Object3D): void {
    object3D.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as Mesh;
        const original = this.opacityCache.get(mesh.uuid);

        if (original !== undefined) {
          const mat = mesh.material as any; // Material types vary
          if (mat && mat.opacity !== undefined) {
            mat.opacity = original;
            mat.transparent = original < 1.0; // Only keep transparent if original was transparent
            mat.needsUpdate = true;
          }

          // Clear from cache
          this.opacityCache.delete(mesh.uuid);
        }
      }
    });
  }

  /**
   * Get mouse utility (for advanced use cases)
   */
  public getMouse(): Mouse {
    return this.mouse;
  }

  /**
   * Get raycast utility (for advanced use cases)
   */
  public getRaycast(): Raycast {
    return this.raycast;
  }
}
