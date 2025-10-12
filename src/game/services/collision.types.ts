import type { Object3D, Box3, Sphere, Vector3 } from 'three';

/**
 * Collision shape types
 */
export type T_CollisionShape = 'box' | 'sphere' | 'mesh';

/**
 * Collision callback functions
 */
export interface I_CollisionCallbacks {
  onCollisionEnter?: (other: I_CollidableObject) => void;
  onCollisionStay?: (other: I_CollidableObject) => void;
  onCollisionExit?: (other: I_CollidableObject) => void;
}

/**
 * Collision configuration
 */
export interface I_CollisionConfig {
  /**
   * Collision shape type
   * - box: AABB bounding box (fastest)
   * - sphere: Bounding sphere (fast)
   * - mesh: Precise mesh collision (slowest, not implemented yet)
   */
  shape: T_CollisionShape;

  /**
   * Is this object static? (immovable)
   * Static objects don't get pushed by collisions
   */
  isStatic?: boolean;

  /**
   * Collision layers (bit mask)
   * Objects only collide if (layer1 & layer2) !== 0
   */
  layer?: number;

  /**
   * Collision callbacks
   */
  callbacks?: I_CollisionCallbacks;

  /**
   * Custom scale for collision bounds (multiplier)
   * Useful for adjusting collision size without changing mesh scale
   */
  boundsScale?: number;

  /**
   * Offset from object3D position
   */
  boundsOffset?: Vector3;

  /**
   * Show wireframe visualization for this specific object
   * Overrides global debugDraw setting
   */
  showWireframe?: boolean;

  /**
   * Wireframe color (hex number)
   * Default: 0x00ff00 (green)
   */
  wireframeColor?: number;
}

/**
 * Internal collidable object
 */
export interface I_CollidableObject {
  id: string;
  object3D: Object3D;
  config: Required<I_CollisionConfig>;
  bounds: Box3 | Sphere; // Computed bounds
  lastCollisions: Set<string>; // Track collision state for enter/exit events
}

/**
 * Collision service configuration
 */
export interface I_CollisionServiceConfig {
  enabled?: boolean;
  debugDraw?: boolean; // Draw collision bounds
}
