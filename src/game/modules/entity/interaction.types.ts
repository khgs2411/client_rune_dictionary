import type { Object3D, Vector3 } from 'three';

/**
 * Interaction System Types
 * Extensible foundation for all object interactions (hover, click, drag, etc.)
 */

/**
 * Base interactable object data
 * Keep minimal - extend as needed for specific use cases
 */
export interface I_Interactable {
  id: string; // Unique identifier
  object3D: Object3D; // Three.js object for raycasting
  metadata?: Record<string, any>; // Optional game data (item type, NPC name, etc.)
}

/**
 * Interaction events
 * Emitted by InteractionModule via RxJS
 */
export interface I_InteractionEvent {
  type: 'hover-start' | 'hover-end' | 'click' | 'hover-hold';
  interactable: I_Interactable;
  worldPosition: Vector3; // 3D position of interaction point
  screenPosition: { x: number; y: number }; // 2D screen coordinates (for UI overlay)
  timestamp: number;
}

/**
 * Hover state tracking
 */
export interface I_HoverState {
  interactable: I_Interactable;
  startTime: number;
  worldPosition: Vector3;
  screenPosition: { x: number; y: number };
}

/**
 * Configuration for InteractionModule
 */
export interface I_InteractionConfig {
  hoverHoldThreshold?: number; // ms before hover-hold fires (default: 500)
  clickMaxDragDistance?: number; // pixels - max mouse movement to count as click (default: 5)
  enabled?: boolean; // Can disable/enable interaction system
}
