import type { Intersection, Object3D } from 'three';

/**
 * Interaction System Types (Refactored)
 * Callback-based architecture with behavior composition
 */

/**
 * Interaction callbacks - direct function references (no events!)
 */
export interface I_InteractionCallbacks {
  onHoverStart?: (intersection: Intersection) => void;
  onHoverEnd?: () => void;
  onClick?: (intersection: Intersection) => void;
  onHoverHold?: (duration: number) => void;
}

/**
 * Reactive value type - can be static or a getter function
 * Allows Vue reactivity integration!
 */
export type ReactiveValue<T> = T | (() => T);

/**
 * Pre-built behaviors for common interaction patterns
 * These generate callbacks automatically
 *
 * Reactive values (intensity, count, etc.) can be:
 * - Static numbers: intensity: 0.5
 * - Getter functions: intensity: () => gameConfig.interaction.hoverGlowIntensity
 */
export interface I_InteractableBehaviors {
  // Hover glow behavior
  hoverGlow?: {
    color: number;
    intensity: ReactiveValue<number>; // ✨ Reactive!
  };

  // Click VFX behavior (spawns text sprite)
  clickVFX?: {
    text: string;
    color?: string;
  };

  // Tooltip behavior (shows world-space billboard)
  tooltip?: {
    title: string;
    description?: string;
  };

  // Camera shake behavior (shake on click)
  cameraShake?: {
    intensity: ReactiveValue<number>; // ✨ Reactive!
    duration: ReactiveValue<number>; // ✨ Reactive!
  };

  // Particle effect behavior (particle burst on click)
  particleEffect?: {
    count: ReactiveValue<number>; // ✨ Reactive!
    color?: number;
    speed?: ReactiveValue<number>; // ✨ Reactive!
  };

  // Custom callbacks (merged with generated callbacks)
  customCallbacks?: I_InteractionCallbacks;
}

/**
 * Internal interactable object data
 */
export interface I_InteractableObject {
  id: string;
  object3D: Object3D;
  callbacks: I_InteractionCallbacks;
  behaviors: I_InteractableBehaviors;
  hoverable: boolean;
  clickable: boolean;
}

/**
 * Hover state tracking (internal)
 */
export interface I_HoverState {
  object: I_InteractableObject;
  startTime: number;
  hoverHoldFired: boolean;
}

/**
 * Configuration for InteractionService
 */
export interface I_InteractionConfig {
  hoverHoldThreshold?: number; // ms before hover-hold fires (default: 500)
  clickMaxDragDistance?: number; // pixels - max mouse movement to count as click (default: 5)
  enabled?: boolean;
}
