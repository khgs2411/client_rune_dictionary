import type { Intersection, Object3D, Vector3 } from 'three';

/**
 * Interaction System Types (Refactored v2)
 * Cleaner separation: hover, click, drag behaviors
 */

/**
 * Reactive value type - can be static or a getter function
 * Allows Vue reactivity integration!
 */
export type ReactiveValue<T> = T | (() => T);

/**
 * Hover behavior configuration
 * Handles: glow effects, tooltips, hover callbacks
 */
export interface I_HoverBehavior {
  glow?: {
    color: number;
    intensity: ReactiveValue<number>; // ✨ Reactive!
  };

  tooltip?: {
    title: string;
    description?: string;
  };

  customCallbacks?: {
    onStart?: (intersection: Intersection) => void;
    onEnd?: () => void;
    onHold?: (duration: number) => void;
  };
}

/**
 * Click behavior configuration
 * Handles: VFX, camera shake, particles
 */
export interface I_ClickBehavior {
  vfx?: {
    text?: string;
    color?: string;
  };

  shake?: {
    intensity: ReactiveValue<number>; // ✨ Reactive!
    duration: ReactiveValue<number>; // ✨ Reactive!
  };

  particles?: {
    count: ReactiveValue<number>; // ✨ Reactive!
    color?: number;
    speed?: ReactiveValue<number>; // ✨ Reactive!
  };

  customCallbacks?: {
    onClick?: (intersection: Intersection) => void;
  };
}

/**
 * Drag behavior configuration
 * Handles: object dragging on XZ plane (editor mode)
 */
export interface I_DragBehavior {
  enabled: boolean; // Is draggable?
  lockAxis?: ('x' | 'y' | 'z')[]; // Lock specific axes (default: lock Y)
  snapToGrid?: number; // Override global snap (0 = no snap)

  customCallbacks?: {
    onStart?: (position: Vector3) => void;
    onMove?: (position: Vector3) => void;
    onEnd?: (position: Vector3) => void;
  };
}

/**
 * Unified interaction behaviors
 * Clean separation by interaction type
 */
export interface I_InteractableBehaviors {
  hover?: I_HoverBehavior;
  click?: I_ClickBehavior;
  drag?: I_DragBehavior;
}

/**
 * Internal interactable object data
 */
export interface I_InteractableObject {
  id: string;
  object3D: Object3D;
  behaviors: I_InteractableBehaviors;
}

/**
 * Hover state tracking (internal)
 */
export interface I_HoverState {
  objectId: string;
  startTime: number;
  holdFired: boolean;
}

/**
 * Drag state tracking (internal)
 */
export interface I_DragState {
  objectId: string;
  startPos: Vector3;
  currentPos: Vector3;
  dragPlane: any; // Three.js Plane
}

/**
 * Configuration for InteractionService
 */
export interface I_InteractionConfig {
  hoverHoldThreshold?: number; // ms before hover-hold fires (default: 500)
  enabled?: boolean;
}
