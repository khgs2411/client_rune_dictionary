import { Vector2 } from 'three';

export type MouseEventType =
  | 'move'
  | 'down'
  | 'up'
  | 'click'
  | 'rightclick'
  | 'middleclick'
  | 'dragstart'
  | 'drag'
  | 'dragend'
  | 'scroll'
  | 'enter'
  | 'leave'
  | 'pointerlockchange';

export interface I_MouseEvent {
  position: Vector2;
  normalizedPosition: Vector2;
  delta: Vector2;
  button?: number;
  buttons: Set<number>;
}

export interface I_MouseScrollEvent extends I_MouseEvent {
  scrollDelta: number;
}

export interface I_MouseDragEvent extends I_MouseEvent {
  dragStartPosition: Vector2;
  dragDistance: number;
}

export type MouseEventCallback = (event: I_MouseEvent) => void;
export type MouseScrollEventCallback = (event: I_MouseScrollEvent) => void;
export type MouseDragEventCallback = (event: I_MouseDragEvent) => void;

export interface I_MouseUtilityConfig {
  /** Target element to track mouse events on (defaults to window) */
  target?: HTMLElement | Window;
  /** Whether to prevent context menu on right-click */
  preventContextMenu?: boolean;
  /** Whether to track scroll events */
  trackScroll?: boolean;
  /** Sensitivity multiplier for scroll events (default: 1) */
  scrollSensitivity?: number;
  /** Whether to automatically reset scroll delta each frame */
  autoResetScroll?: boolean;
  /** Whether to capture pointer lock events (for FPS-style controls) */
  supportPointerLock?: boolean;
  /** Distance threshold to distinguish click from drag (pixels) */
  dragThreshold?: number;
}

/**
 * High-performance mouse utility class for Three.js games
 * Provides event callbacks, normalized coordinates, button states, scroll tracking, and delta movement
 * Pure TypeScript implementation without Vue dependencies for maximum performance
 */
export class Mouse {
  private config: Required<I_MouseUtilityConfig>;

  // Position tracking
  private _position = new Vector2(0, 0);
  private _previousPosition = new Vector2(0, 0);
  private _delta = new Vector2(0, 0);
  private _normalizedPosition = new Vector2(0, 0);

  // Button and state tracking
  private _buttons = new Set<number>();
  private _isDown = false;
  private _isInside = false;
  private _isDragging = false;

  // Scroll tracking
  private _scrollDelta = 0;

  // Drag tracking
  private _totalDistance = 0;
  private _dragStartPosition = new Vector2(0, 0);

  // Pointer lock support
  private _isPointerLocked = false;
  private _pointerLockDelta = new Vector2(0, 0);

  // Canvas dimensions for NDC calculation
  private canvasWidth = 0;
  private canvasHeight = 0;

  // Event callbacks registry
  private eventCallbacks: Map<MouseEventType, Set<(...args: any[]) => void>> = new Map();

  // Event listeners bound to this instance (cast to EventListener for addEventListener compatibility)
  private boundHandlers = {
    mouseMove: ((e: Event) => this.handleMouseMove(e as MouseEvent)) as EventListener,
    mouseDown: ((e: Event) => this.handleMouseDown(e as MouseEvent)) as EventListener,
    mouseUp: ((e: Event) => this.handleMouseUp(e as MouseEvent)) as EventListener,
    mouseEnter: (() => this.handleMouseEnter()) as EventListener,
    mouseLeave: (() => this.handleMouseLeave()) as EventListener,
    wheel: ((e: Event) => this.handleWheel(e as WheelEvent)) as EventListener,
    contextMenu: ((e: Event) => this.handleContextMenu(e)) as EventListener,
    resize: (() => this.handleResize()) as EventListener,
    pointerLockChange: (() => this.handlePointerLockChange()) as EventListener,
  };

  constructor(config: I_MouseUtilityConfig = {}) {
    this.config = {
      target: config.target ?? window,
      preventContextMenu: config.preventContextMenu ?? true,
      trackScroll: config.trackScroll ?? true,
      scrollSensitivity: config.scrollSensitivity ?? 1,
      autoResetScroll: config.autoResetScroll ?? true,
      supportPointerLock: config.supportPointerLock ?? false,
      dragThreshold: config.dragThreshold ?? 5,
    };

    this.initialize();
  }

  private initialize(): void {
    const target = this.config.target;

    // Mouse movement
    target.addEventListener('mousemove', this.boundHandlers.mouseMove as EventListener);

    // Mouse buttons
    target.addEventListener('mousedown', this.boundHandlers.mouseDown as EventListener);
    target.addEventListener('mouseup', this.boundHandlers.mouseUp as EventListener);

    // Mouse enter/leave
    target.addEventListener('mouseenter', this.boundHandlers.mouseEnter as EventListener);
    target.addEventListener('mouseleave', this.boundHandlers.mouseLeave as EventListener);

    // Scroll
    if (this.config.trackScroll) {
      target.addEventListener('wheel', this.boundHandlers.wheel as EventListener, {
        passive: false,
      });
    }

    // Context menu
    if (this.config.preventContextMenu) {
      target.addEventListener('contextmenu', this.boundHandlers.contextMenu as EventListener);
    }

    // Window resize for NDC calculation
    window.addEventListener('resize', this.boundHandlers.resize as EventListener);

    // Pointer lock support
    if (this.config.supportPointerLock) {
      document.addEventListener(
        'pointerlockchange',
        this.boundHandlers.pointerLockChange as EventListener,
      );
    }

    // Initialize dimensions
    this.handleResize();
  }

  private handleMouseMove(event: MouseEvent): void {
    // Handle pointer lock movement (for FPS-style controls)
    if (this._isPointerLocked) {
      this._pointerLockDelta.set(event.movementX, event.movementY);
      this._delta.copy(this._pointerLockDelta);

      this.emit('move', {
        position: this._position.clone(),
        normalizedPosition: this._normalizedPosition.clone(),
        delta: this._delta.clone(),
        buttons: new Set(this._buttons),
      });
      return;
    }

    // Regular mouse movement
    const newX = event.clientX;
    const newY = event.clientY;

    // Calculate delta
    this._delta.set(newX - this._position.x, newY - this._position.y);

    // Update total distance (useful for drag threshold detection)
    if (this._isDown) {
      this._totalDistance += Math.abs(this._delta.x) + Math.abs(this._delta.y);

      // Check if we've exceeded drag threshold
      if (!this._isDragging && this._totalDistance > this.config.dragThreshold) {
        this._isDragging = true;
        this.emit('dragstart', {
          position: this._position.clone(),
          normalizedPosition: this._normalizedPosition.clone(),
          delta: this._delta.clone(),
          buttons: new Set(this._buttons),
          dragStartPosition: this._dragStartPosition.clone(),
          dragDistance: this._totalDistance,
        });
      }

      // Emit drag events
      if (this._isDragging) {
        this.emit('drag', {
          position: this._position.clone(),
          normalizedPosition: this._normalizedPosition.clone(),
          delta: this._delta.clone(),
          buttons: new Set(this._buttons),
          dragStartPosition: this._dragStartPosition.clone(),
          dragDistance: this._totalDistance,
        });
      }
    }

    // Update position
    this._previousPosition.copy(this._position);
    this._position.set(newX, newY);

    // Update normalized device coordinates (-1 to 1)
    this._normalizedPosition.set(
      (newX / this.canvasWidth) * 2 - 1,
      -(newY / this.canvasHeight) * 2 + 1,
    );

    // Emit move event
    this.emit('move', {
      position: this._position.clone(),
      normalizedPosition: this._normalizedPosition.clone(),
      delta: this._delta.clone(),
      buttons: new Set(this._buttons),
    });
  }

  private handleMouseDown(event: MouseEvent): void {
    this._isDown = true;
    this._buttons.add(event.button);
    this._totalDistance = 0;
    this._dragStartPosition.copy(this._position);

    // Emit down event
    this.emit('down', {
      position: this._position.clone(),
      normalizedPosition: this._normalizedPosition.clone(),
      delta: this._delta.clone(),
      button: event.button,
      buttons: new Set(this._buttons),
    });
  }

  private handleMouseUp(event: MouseEvent): void {
    const wasDown = this._isDown;
    const wasDragging = this._isDragging;

    this._buttons.delete(event.button);
    if (this._buttons.size === 0) {
      this._isDown = false;
    }

    // Emit up event
    this.emit('up', {
      position: this._position.clone(),
      normalizedPosition: this._normalizedPosition.clone(),
      delta: this._delta.clone(),
      button: event.button,
      buttons: new Set(this._buttons),
    });

    // Emit drag end if we were dragging
    if (wasDragging) {
      this._isDragging = false;
      this.emit('dragend', {
        position: this._position.clone(),
        normalizedPosition: this._normalizedPosition.clone(),
        delta: this._delta.clone(),
        buttons: new Set(this._buttons),
        dragStartPosition: this._dragStartPosition.clone(),
        dragDistance: this._totalDistance,
      });
    }

    // Emit click event only if we didn't drag (below threshold)
    if (wasDown && !wasDragging && this._totalDistance <= this.config.dragThreshold) {
      const clickEvent = {
        position: this._position.clone(),
        normalizedPosition: this._normalizedPosition.clone(),
        delta: this._delta.clone(),
        button: event.button,
        buttons: new Set(this._buttons),
      };

      // Emit general click and button-specific click
      this.emit('click', clickEvent);

      if (event.button === 0) {
        // Left click is already 'click'
      } else if (event.button === 2) {
        this.emit('rightclick', clickEvent);
      } else if (event.button === 1) {
        this.emit('middleclick', clickEvent);
      }
    }

    // Reset drag tracking
    this._totalDistance = 0;
  }

  private handleMouseEnter(): void {
    this._isInside = true;
    this.emit('enter', {
      position: this._position.clone(),
      normalizedPosition: this._normalizedPosition.clone(),
      delta: this._delta.clone(),
      buttons: new Set(this._buttons),
    });
  }

  private handleMouseLeave(): void {
    this._isInside = false;
    this._isDown = false;
    this._buttons.clear();

    this.emit('leave', {
      position: this._position.clone(),
      normalizedPosition: this._normalizedPosition.clone(),
      delta: this._delta.clone(),
      buttons: new Set(this._buttons),
    });
  }

  private handleWheel(event: WheelEvent): void {
    if (this.config.preventContextMenu) {
      event.preventDefault();
    }

    // Accumulate scroll delta
    this._scrollDelta += event.deltaY * this.config.scrollSensitivity;

    // Emit scroll event
    this.emit('scroll', {
      position: this._position.clone(),
      normalizedPosition: this._normalizedPosition.clone(),
      delta: this._delta.clone(),
      buttons: new Set(this._buttons),
      scrollDelta: this._scrollDelta,
    });
  }

  private handleContextMenu(event: Event): void {
    event.preventDefault();
  }

  private handleResize(): void {
    if (this.config.target instanceof HTMLElement) {
      this.canvasWidth = this.config.target.clientWidth;
      this.canvasHeight = this.config.target.clientHeight;
    } else {
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;
    }
  }

  private handlePointerLockChange(): void {
    const wasLocked = this._isPointerLocked;
    this._isPointerLocked = document.pointerLockElement !== null;

    if (wasLocked !== this._isPointerLocked) {
      this.emit('pointerlockchange', {
        position: this._position.clone(),
        normalizedPosition: this._normalizedPosition.clone(),
        delta: this._delta.clone(),
        buttons: new Set(this._buttons),
      });
    }
  }

  /**
   * Subscribe to mouse events
   * @param event - Event type to listen for
   * @param callback - Callback function to execute
   * @returns Unsubscribe function
   */
  public on(
    event: 'move' | 'down' | 'up' | 'enter' | 'leave',
    callback: MouseEventCallback,
  ): () => void;
  public on(
    event: 'click' | 'rightclick' | 'middleclick',
    callback: MouseEventCallback,
  ): () => void;
  public on(event: 'dragstart' | 'drag' | 'dragend', callback: MouseDragEventCallback): () => void;
  public on(event: 'scroll', callback: MouseScrollEventCallback): () => void;
  public on(event: 'pointerlockchange', callback: MouseEventCallback): () => void;
  public on(event: MouseEventType, callback: (...args: any[]) => void): () => void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }

    this.eventCallbacks.get(event)!.add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from mouse events
   */
  public off(event: MouseEventType, callback: (...args: any[]) => void): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit event to all subscribers
   */
  private emit(event: MouseEventType, data: any): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Request pointer lock (for FPS-style controls)
   * Must be called from a user interaction event
   */
  public requestPointerLock(): void {
    if (!this.config.supportPointerLock) {
      console.warn('Pointer lock not enabled in config');
      return;
    }

    if (this.config.target instanceof HTMLElement) {
      this.config.target.requestPointerLock();
    }
  }

  /**
   * Exit pointer lock
   */
  public exitPointerLock(): void {
    if (this._isPointerLocked) {
      document.exitPointerLock();
    }
  }

  /**
   * Call this in your update loop to reset per-frame values
   */
  public update(): void {
    // Reset delta for next frame
    this._delta.set(0, 0);
    this._pointerLockDelta.set(0, 0);

    // Optionally reset scroll delta
    if (this.config.autoResetScroll) {
      this._scrollDelta = 0;
    }
  }

  /**
   * Manually reset scroll delta (useful if autoResetScroll is false)
   */
  public resetScroll(): void {
    this._scrollDelta = 0;
  }

  /**
   * Reset total distance (useful for new drag operations)
   */
  public resetDistance(): void {
    this._totalDistance = 0;
  }

  /**
   * Check if a specific mouse button is pressed
   * @param button - 0: left, 1: middle, 2: right
   */
  public isButtonPressed(button: number): boolean {
    return this._buttons.has(button);
  }

  /**
   * Check if left mouse button is pressed
   */
  public get isLeftButtonPressed(): boolean {
    return this.isButtonPressed(0);
  }

  /**
   * Check if right mouse button is pressed
   */
  public get isRightButtonPressed(): boolean {
    return this.isButtonPressed(2);
  }

  /**
   * Check if middle mouse button is pressed
   */
  public get isMiddleButtonPressed(): boolean {
    return this.isButtonPressed(1);
  }

  /**
   * Check if mouse has moved more than threshold since mousedown (useful for click vs drag detection)
   */
  public hasMovedMoreThan(threshold: number): boolean {
    return this._totalDistance > threshold;
  }

  /**
   * Get distance from drag start position
   */
  public getDistanceFromDragStart(): number {
    return this._position.distanceTo(this._dragStartPosition);
  }

  /**
   * Get current position in screen coordinates (pixels)
   */
  public get position(): Vector2 {
    return this._position.clone();
  }

  /**
   * Get current position in normalized device coordinates (-1 to 1)
   * Suitable for raycasting with Three.js
   */
  public get normalizedPosition(): Vector2 {
    return this._normalizedPosition.clone();
  }

  /**
   * Get mouse delta since last frame
   */
  public get delta(): Vector2 {
    return this._delta.clone();
  }

  /**
   * Get reference to internal delta vector (no clone, for performance)
   * Use carefully - don't modify this vector!
   */
  public get deltaRef(): Vector2 {
    return this._delta;
  }

  /**
   * Get reference to internal position vector (no clone, for performance)
   * Use carefully - don't modify this vector!
   */
  public get positionRef(): Vector2 {
    return this._position;
  }

  /**
   * Get reference to internal normalized position vector (no clone, for performance)
   * Use carefully - don't modify this vector!
   */
  public get normalizedPositionRef(): Vector2 {
    return this._normalizedPosition;
  }

  /**
   * Get current scroll delta
   */
  public get scrollDelta(): number {
    return this._scrollDelta;
  }

  /**
   * Get whether mouse is currently down
   */
  public get isDown(): boolean {
    return this._isDown;
  }

  /**
   * Get whether mouse is inside target element
   */
  public get isInside(): boolean {
    return this._isInside;
  }

  /**
   * Get whether currently dragging
   */
  public get isDragging(): boolean {
    return this._isDragging;
  }

  /**
   * Get whether pointer is locked
   */
  public get isPointerLocked(): boolean {
    return this._isPointerLocked;
  }

  /**
   * Get total distance moved since last mousedown
   */
  public get totalDistance(): number {
    return this._totalDistance;
  }

  /**
   * Get drag start position
   */
  public get dragStartPosition(): Vector2 {
    return this._dragStartPosition.clone();
  }

  /**
   * Get all pressed button numbers
   */
  public get pressedButtons(): number[] {
    return Array.from(this._buttons);
  }

  /**
   * Cleanup all event listeners
   * Call this when destroying the scene/component
   */
  public destroy(): void {
    const target = this.config.target;

    target.removeEventListener('mousemove', this.boundHandlers.mouseMove as EventListener);
    target.removeEventListener('mousedown', this.boundHandlers.mouseDown as EventListener);
    target.removeEventListener('mouseup', this.boundHandlers.mouseUp as EventListener);
    target.removeEventListener('mouseenter', this.boundHandlers.mouseEnter as EventListener);
    target.removeEventListener('mouseleave', this.boundHandlers.mouseLeave as EventListener);

    if (this.config.trackScroll) {
      target.removeEventListener('wheel', this.boundHandlers.wheel as EventListener);
    }

    if (this.config.preventContextMenu) {
      target.removeEventListener('contextmenu', this.boundHandlers.contextMenu as EventListener);
    }

    window.removeEventListener('resize', this.boundHandlers.resize as EventListener);

    if (this.config.supportPointerLock) {
      document.removeEventListener(
        'pointerlockchange',
        this.boundHandlers.pointerLockChange as EventListener,
      );
    }

    // Exit pointer lock if active
    this.exitPointerLock();

    // Clear all event callbacks
    this.eventCallbacks.clear();

    // Clear state
    this._buttons.clear();
  }
}
