import { Camera, Intersection, Object3D, Raycaster, Vector2, Vector3 } from 'three';

/**
 * Raycast Utility Class
 *
 * Pure raycast encapsulation - agnostic to input source
 * Can raycast from camera (pointer), direction (projectile), or object-to-object (line of sight)
 *
 * Usage:
 * ```typescript
 * const raycast = new Raycast();
 *
 * // Pointer-based
 * const hits = raycast.fromCamera(pointer, camera, objects);
 *
 * // Directional (fireball collision)
 * const hits = raycast.fromDirection(fireballPos, fireballDir, objects);
 *
 * // Utilities
 * const firstHit = raycast.getFirstHit(hits);
 * const distance = raycast.distanceTo(from, to);
 * ```
 */
export class Raycast {
  private raycaster: Raycaster;

  constructor() {
    this.raycaster = new Raycaster();
  }

  /**
   * Raycast from camera using normalized device coordinates
   * Use case: Mouse/pointer interaction
   *
   * @param ndc - Normalized device coordinates (-1 to 1)
   * @param camera - Three.js camera
   * @param objects - Objects to test against
   * @returns Array of intersections (sorted by distance, closest first)
   */
  fromCamera(ndc: Vector2, camera: Camera, objects: Object3D[]): Intersection[] {
    this.raycaster.setFromCamera(ndc, camera);
    return this.raycaster.intersectObjects(objects, true);
  }

  /**
   * Raycast from origin point in direction
   * Use case: Projectile collision, line of sight, AI detection
   *
   * @param origin - Starting point (world space)
   * @param direction - Direction vector (will be normalized)
   * @param objects - Objects to test against
   * @returns Array of intersections (sorted by distance, closest first)
   */
  fromDirection(origin: Vector3, direction: Vector3, objects: Object3D[]): Intersection[] {
    this.raycaster.set(origin, direction.clone().normalize());
    return this.raycaster.intersectObjects(objects, true);
  }

  /**
   * Get first hit from intersection results
   * Use case: Simple "did we hit anything?" checks
   *
   * @param intersections - Results from raycast
   * @returns First intersection or null
   */
  getFirstHit(intersections: Intersection[]): Intersection | null {
    return intersections[0] || null;
  }

  /**
   * Calculate distance between two points
   * Use case: Range checks, proximity detection
   *
   * @param from - Starting point
   * @param to - End point
   * @returns Distance in world units
   */
  distanceTo(from: Vector3, to: Vector3): number {
    return from.distanceTo(to);
  }

  /**
   * Get the underlying Raycaster instance (advanced usage)
   * Use case: Direct access for custom configuration (near/far planes, layer masks, etc.)
   */
  getRaycaster(): Raycaster {
    return this.raycaster;
  }
}
