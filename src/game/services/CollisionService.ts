import type { I_ModuleContext, I_SceneService } from '@/scenes/scenes.types';
import type {
  I_CollidableObject,
  I_CollisionConfig,
  I_CollisionServiceConfig,
} from './collision.types';
import { Box3, Sphere, Vector3, Object3D, BoxHelper, Box3Helper } from 'three';
import { CollisionBuilder } from './CollisionBuilder';
import { SphereHelper } from '@/game/utils/SphereHelper';

/**
 * Collision Service
 * Handles physics-based collision detection and boundary enforcement
 *
 * Features:
 * - Bounding box (AABB) and sphere collision detection
 * - Static vs dynamic objects (immovable vs movable)
 * - Collision layers for filtering
 * - Enter/Stay/Exit callbacks
 * - Automatic boundary enforcement (pushes objects apart)
 * - Debug visualization
 *
 * Usage:
 * ```typescript
 * // Static wall
 * ctx.services.collision
 *   .register('wall', wallMesh)
 *   .withBox()
 *   .static()
 *   .build();
 *
 * // Dynamic player
 * ctx.services.collision
 *   .register('player', playerMesh)
 *   .withBox()
 *   .dynamic()
 *   .withCallbacks({
 *     onCollisionEnter: (other) => console.log('Collided with:', other.id)
 *   })
 *   .build();
 * ```
 */
export class CollisionService implements I_SceneService {
  private context!: I_ModuleContext;
  private collidables = new Map<string, I_CollidableObject>();
  private debugHelpers = new Map<string, BoxHelper | Box3Helper | SphereHelper>();

  private config: Required<I_CollisionServiceConfig> = {
    enabled: true,
    debugDraw: false,
  };

  constructor(config?: I_CollisionServiceConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Initialize service with scene context
   */
  async start(ctx: I_ModuleContext): Promise<void> {
    this.context = ctx;
    console.log('✅ [CollisionService] Initialized (debug draw: %s)', this.config.debugDraw);
  }

  /**
   * Update (called each frame by GameScene)
   * Performs collision detection and boundary enforcement
   */
  public update(_delta: number): void {
    if (!this.config.enabled) return;

    // Update bounds for all objects
    this.updateBounds();

    // Detect and resolve collisions
    this.detectCollisions();

    // Update global debug visualization
    if (this.config.debugDraw) {
      this.updateDebugHelpers();
    }

    // Update per-object wireframes (always, if enabled per-object)
    this.updatePerObjectWireframes();
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    this.collidables.clear();
    this.clearDebugHelpers();
    console.log('🧹 [CollisionService] Destroyed');
  }

  /**
   * Register collidable with fluent builder API
   */
  public register(id: string, object3D: Object3D): CollisionBuilder {
    return new CollisionBuilder((config) => {
      this._register(id, object3D, config);
    });
  }

  /**
   * Unregister collidable
   */
  public unregister(id: string): void {
    this.collidables.delete(id);
    this.removeDebugHelper(id);
  }

  /**
   * Enable/disable collision system
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Enable/disable debug visualization
   */
  public setDebugDraw(enabled: boolean): void {
    this.config.debugDraw = enabled;
    if (!enabled) {
      this.clearDebugHelpers();
    }
  }

  /**
   * Get collidable by ID (useful for querying)
   */
  public get(id: string): I_CollidableObject | undefined {
    return this.collidables.get(id);
  }

  // ============================================
  // INTERNAL METHODS
  // ============================================

  /**
   * Internal registration (called by builder)
   */
  private _register(id: string, object3D: Object3D, config: I_CollisionConfig): void {
    // Fill defaults
    const fullConfig: Required<I_CollisionConfig> = {
      shape: config.shape,
      isStatic: config.isStatic ?? false,
      layer: config.layer ?? 1,
      callbacks: config.callbacks ?? {},
      boundsScale: config.boundsScale ?? 1.0,
      boundsOffset: config.boundsOffset ?? new Vector3(),
      showWireframe: config.showWireframe ?? false,
      wireframeColor: config.wireframeColor ?? 0x00ff00,
      collisionAxes: config.collisionAxes ?? { x: true, y: true, z: true },
    };

    // Create bounds
    const bounds = this.createBounds(object3D, fullConfig);

    const collidable: I_CollidableObject = {
      id,
      object3D,
      config: fullConfig,
      bounds,
      lastCollisions: new Set(),
    };

    this.collidables.set(id, collidable);

    // Note: Wireframe helpers are created during update() loop
    // This avoids accessing this.context before service.start() is called

    console.log('  ↳ Registered collidable:', id, fullConfig);
  }

  /**
   * Create collision bounds based on shape type
   */
  private createBounds(object3D: Object3D, config: Required<I_CollisionConfig>): Box3 | Sphere {
    if (config.shape === 'sphere') {
      const sphere = new Sphere();
      const box = new Box3().setFromObject(object3D);
      box.getCenter(sphere.center);
      sphere.radius = box.min.distanceTo(box.max) / 2;
      sphere.radius *= config.boundsScale;
      sphere.center.add(config.boundsOffset);
      return sphere;
    } else {
      // Default to box
      const box = new Box3().setFromObject(object3D);
      if (config.boundsScale !== 1.0) {
        const center = new Vector3();
        box.getCenter(center);
        const size = new Vector3();
        box.getSize(size);
        size.multiplyScalar(config.boundsScale);
        box.setFromCenterAndSize(center, size);
      }
      box.translate(config.boundsOffset);
      return box;
    }
  }

  /**
   * Update bounds for all collidables (they may have moved)
   */
  private updateBounds(): void {
    for (const collidable of this.collidables.values()) {
      if (collidable.config.shape === 'sphere') {
        const sphere = collidable.bounds as Sphere;
        const box = new Box3().setFromObject(collidable.object3D);
        box.getCenter(sphere.center);
        sphere.radius = box.min.distanceTo(box.max) / 2;
        sphere.radius *= collidable.config.boundsScale;
        sphere.center.add(collidable.config.boundsOffset);
      } else {
        const box = collidable.bounds as Box3;
        box.setFromObject(collidable.object3D);
        if (collidable.config.boundsScale !== 1.0) {
          const center = new Vector3();
          box.getCenter(center);
          const size = new Vector3();
          box.getSize(size);
          size.multiplyScalar(collidable.config.boundsScale);
          box.setFromCenterAndSize(center, size);
        }
        box.translate(collidable.config.boundsOffset);
      }
    }
  }

  /**
   * Detect collisions and enforce boundaries
   */
  private detectCollisions(): void {
    const collidables = Array.from(this.collidables.values());
    const currentCollisions = new Map<string, Set<string>>();

    // Initialize current collision tracking
    for (const collidable of collidables) {
      currentCollisions.set(collidable.id, new Set());
    }

    // Check all pairs
    for (let i = 0; i < collidables.length; i++) {
      const a = collidables[i];

      for (let j = i + 1; j < collidables.length; j++) {
        const b = collidables[j];

        // Layer filtering
        if ((a.config.layer & b.config.layer) === 0) continue;

        // Check collision
        const isColliding = this.checkCollision(a, b);

        if (isColliding) {
          // Track collision
          currentCollisions.get(a.id)?.add(b.id);
          currentCollisions.get(b.id)?.add(a.id);

          // Enforce boundaries (push objects apart)
          this.resolveBoundaries(a, b);

          // Fire callbacks
          this.handleCollisionCallbacks(a, b);
        }
      }
    }

    // Fire exit callbacks for collisions that ended
    this.handleCollisionExits(currentCollisions);

    // Update last collision state
    for (const collidable of collidables) {
      collidable.lastCollisions = currentCollisions.get(collidable.id) || new Set();
    }
  }

  /**
   * Check if two collidables are colliding
   */
  private checkCollision(a: I_CollidableObject, b: I_CollidableObject): boolean {
    const aIsBox = a.bounds instanceof Box3;
    const bIsBox = b.bounds instanceof Box3;

    if (aIsBox && bIsBox) {
      // Box-Box collision
      return (a.bounds as Box3).intersectsBox(b.bounds as Box3);
    } else if (!aIsBox && !bIsBox) {
      // Sphere-Sphere collision
      return (a.bounds as Sphere).intersectsSphere(b.bounds as Sphere);
    } else {
      // Box-Sphere collision
      const box = (aIsBox ? a.bounds : b.bounds) as Box3;
      const sphere = (aIsBox ? b.bounds : a.bounds) as Sphere;
      return box.intersectsSphere(sphere);
    }
  }

  /**
   * Resolve boundaries by pushing objects apart
   * Only pushes dynamic objects (isStatic === false)
   * Character colliders are NOT pushed - they handle their own position locking
   */
  private resolveBoundaries(a: I_CollidableObject, b: I_CollidableObject): void {
    // If both static, no resolution needed
    if (a.config.isStatic && b.config.isStatic) return;

    // Don't push character colliders - they handle their own position correction
    const aIsCharacter = a.id.startsWith('character-');
    const bIsCharacter = b.id.startsWith('character-');
    if (aIsCharacter && bIsCharacter) return; // Both are character parts
    if (aIsCharacter) return; // Don't push character, let it handle its own position
    if (bIsCharacter) return; // Don't push character, let it handle its own position

    const aCenter = new Vector3();
    const bCenter = new Vector3();

    // Get centers
    if (a.bounds instanceof Box3) {
      a.bounds.getCenter(aCenter);
    } else {
      aCenter.copy((a.bounds as Sphere).center);
    }

    if (b.bounds instanceof Box3) {
      b.bounds.getCenter(bCenter);
    } else {
      bCenter.copy((b.bounds as Sphere).center);
    }

    // Calculate push direction
    const pushDirection = new Vector3().subVectors(aCenter, bCenter);
    const distance = pushDirection.length();

    if (distance === 0) {
      // Objects are at exact same position, push in arbitrary direction
      pushDirection.set(1, 0, 0);
    } else {
      pushDirection.normalize();
    }

    // Calculate overlap distance
    const overlap = this.calculateOverlap(a, b, distance);

    if (overlap <= 0) return; // No overlap

    // Calculate push amounts (based on static/dynamic)
    let pushAmountA = 0;
    let pushAmountB = 0;

    if (a.config.isStatic) {
      pushAmountB = overlap;
    } else if (b.config.isStatic) {
      pushAmountA = overlap;
    } else {
      // Both dynamic - push equally
      pushAmountA = overlap / 2;
      pushAmountB = overlap / 2;
    }

    // Apply push (only on enabled axes)
    if (pushAmountA > 0) {
      if (a.config.collisionAxes.x) a.object3D.position.x += pushDirection.x * pushAmountA;
      if (a.config.collisionAxes.y) a.object3D.position.y += pushDirection.y * pushAmountA;
      if (a.config.collisionAxes.z) a.object3D.position.z += pushDirection.z * pushAmountA;
    }

    if (pushAmountB > 0) {
      if (b.config.collisionAxes.x) b.object3D.position.x -= pushDirection.x * pushAmountB;
      if (b.config.collisionAxes.y) b.object3D.position.y -= pushDirection.y * pushAmountB;
      if (b.config.collisionAxes.z) b.object3D.position.z -= pushDirection.z * pushAmountB;
    }
  }

  /**
   * Calculate overlap distance between two collidables
   */
  private calculateOverlap(
    a: I_CollidableObject,
    b: I_CollidableObject,
    centerDistance: number,
  ): number {
    const aIsBox = a.bounds instanceof Box3;
    const bIsBox = b.bounds instanceof Box3;

    if (!aIsBox && !bIsBox) {
      // Sphere-Sphere: overlap = (r1 + r2) - distance
      const radiusSum = (a.bounds as Sphere).radius + (b.bounds as Sphere).radius;
      return radiusSum - centerDistance;
    } else {
      // Box-Box or Box-Sphere: approximate overlap
      // This is simplified - for perfect accuracy, use SAT algorithm
      let aSize = 0;
      let bSize = 0;

      if (aIsBox) {
        const size = new Vector3();
        (a.bounds as Box3).getSize(size);
        aSize = size.length() / 2;
      } else {
        aSize = (a.bounds as Sphere).radius;
      }

      if (bIsBox) {
        const size = new Vector3();
        (b.bounds as Box3).getSize(size);
        bSize = size.length() / 2;
      } else {
        bSize = (b.bounds as Sphere).radius;
      }

      return aSize + bSize - centerDistance;
    }
  }

  /**
   * Handle collision callbacks (enter/stay)
   */
  private handleCollisionCallbacks(a: I_CollidableObject, b: I_CollidableObject): void {
    const aWasColliding = a.lastCollisions.has(b.id);
    const bWasColliding = b.lastCollisions.has(a.id);

    if (!aWasColliding) {
      // Collision just started for A
      a.config.callbacks.onCollisionEnter?.(b);
    } else {
      // Collision continuing for A
      a.config.callbacks.onCollisionStay?.(b);
    }

    if (!bWasColliding) {
      // Collision just started for B
      b.config.callbacks.onCollisionEnter?.(a);
    } else {
      // Collision continuing for B
      b.config.callbacks.onCollisionStay?.(a);
    }
  }

  /**
   * Handle collision exit callbacks
   */
  private handleCollisionExits(currentCollisions: Map<string, Set<string>>): void {
    for (const collidable of this.collidables.values()) {
      const current = currentCollisions.get(collidable.id) || new Set();
      const previous = collidable.lastCollisions;

      // Find collisions that ended
      for (const previousId of previous) {
        if (!current.has(previousId)) {
          const other = this.collidables.get(previousId);
          if (other) {
            collidable.config.callbacks.onCollisionExit?.(other);
          }
        }
      }
    }
  }

  /**
   * Update debug helpers (visualize collision bounds)
   * Only updates global debug helpers (per-object wireframes are handled separately)
   */
  private updateDebugHelpers(): void {
    for (const collidable of this.collidables.values()) {
      // Skip if this object has its own wireframe
      if (collidable.config.showWireframe) continue;

      if (!this.debugHelpers.has(collidable.id)) {
        // Create debug helper
        this.createWireframeHelper(collidable);
      } else {
        // Update existing helper
        this.updateWireframeHelper(collidable);
      }
    }
  }

  /**
   * Create wireframe helper for a collidable
   */
  private createWireframeHelper(collidable: I_CollidableObject): void {
    // Safety check: Don't create helpers if context isn't initialized yet
    if (!this.context) return;

    const color = collidable.config.wireframeColor;

    if (collidable.bounds instanceof Box3) {
      const helper = new Box3Helper(collidable.bounds, color);
      this.context.scene.add(helper);
      this.debugHelpers.set(collidable.id, helper);
    } else if (collidable.bounds instanceof Sphere) {
      const helper = new SphereHelper(collidable.bounds, color);
      this.context.scene.add(helper);
      this.debugHelpers.set(collidable.id, helper);
    }
  }

  /**
   * Update existing wireframe helper
   */
  private updateWireframeHelper(collidable: I_CollidableObject): void {
    const helper = this.debugHelpers.get(collidable.id);
    if (!helper) return;

    if (helper instanceof Box3Helper && collidable.bounds instanceof Box3) {
      (helper as any).box = collidable.bounds; // Update box reference
    } else if (helper instanceof SphereHelper && collidable.bounds instanceof Sphere) {
      helper.sphere = collidable.bounds;
      helper.updateGeometry();
    }
  }

  /**
   * Update per-object wireframes (objects with showWireframe: true)
   */
  private updatePerObjectWireframes(): void {
    for (const collidable of this.collidables.values()) {
      if (!collidable.config.showWireframe) continue;

      // Create helper if it doesn't exist
      if (!this.debugHelpers.has(collidable.id)) {
        this.createWireframeHelper(collidable);
      } else {
        // Update existing helper
        this.updateWireframeHelper(collidable);
      }
    }
  }

  /**
   * Clear all debug helpers
   */
  private clearDebugHelpers(): void {
    for (const helper of this.debugHelpers.values()) {
      this.context.scene.remove(helper);
      helper.dispose();
    }
    this.debugHelpers.clear();
  }

  /**
   * Remove single debug helper
   */
  private removeDebugHelper(id: string): void {
    const helper = this.debugHelpers.get(id);
    if (helper) {
      this.context.scene.remove(helper);
      helper.dispose();
      this.debugHelpers.delete(id);
    }
  }
}
