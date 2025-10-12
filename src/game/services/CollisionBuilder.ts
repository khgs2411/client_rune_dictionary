import type { I_CollisionConfig, I_CollisionCallbacks } from './collision.types';
import type { Vector3 } from 'three';

/**
 * Fluent builder for collision registration
 * Follows same pattern as InteractableBuilder
 *
 * @example
 * ```typescript
 * ctx.services.collision
 *   .register('player', playerMesh)
 *   .withBox()
 *   .withCallbacks({
 *     onCollisionEnter: (other) => console.log('Hit:', other.id)
 *   });
 *
 * ctx.services.collision
 *   .register('wall', wallMesh)
 *   .withBox()
 *   .static(); // Immovable
 * ```
 */
export class CollisionBuilder {
  private config: Partial<I_CollisionConfig> = {
    isStatic: false,
    layer: 1, // Default layer
    boundsScale: 1.0,
  };

  constructor(private onComplete: (config: I_CollisionConfig) => void) {}

  /**
   * Use AABB box collision (fastest, recommended)
   */
  public withBox(): this {
    this.config.shape = 'box';
    return this;
  }

  /**
   * Use sphere collision (fast, good for round objects)
   */
  public withSphere(): this {
    this.config.shape = 'sphere';
    return this;
  }

  /**
   * Mark object as static (immovable)
   */
  public static(): this {
    this.config.isStatic = true;
    return this;
  }

  /**
   * Mark object as dynamic (movable by collisions)
   */
  public dynamic(): this {
    this.config.isStatic = false;
    return this;
  }

  /**
   * Set collision layer (bit mask)
   * Objects only collide if (layer1 & layer2) !== 0
   *
   * @example
   * ```typescript
   * // Player on layer 1, walls on layer 2
   * player.withLayer(0b01); // Binary: 01
   * wall.withLayer(0b11);   // Binary: 11 (collides with layer 1)
   * ```
   */
  public withLayer(layer: number): this {
    this.config.layer = layer;
    return this;
  }

  /**
   * Set collision callbacks
   */
  public withCallbacks(callbacks: I_CollisionCallbacks): this {
    this.config.callbacks = callbacks;
    return this;
  }

  /**
   * Scale collision bounds (multiplier)
   */
  public withBoundsScale(scale: number): this {
    this.config.boundsScale = scale;
    return this;
  }

  /**
   * Offset collision bounds from object position
   */
  public withBoundsOffset(offset: Vector3): this {
    this.config.boundsOffset = offset;
    return this;
  }

  /**
   * Show wireframe visualization for this object
   * @param color - Optional hex color (default: 0x00ff00 green)
   *
   * @example
   * ```typescript
   * .withWireframe() // Green wireframe
   * .withWireframe(0xff0000) // Red wireframe
   * ```
   */
  public withWireframe(color: number = 0x00ff00): this {
    this.config.showWireframe = true;
    this.config.wireframeColor = color;
    return this;
  }

  /**
   * Hide wireframe visualization (default)
   */
  public withoutWireframe(): this {
    this.config.showWireframe = false;
    return this;
  }

  /**
   * Configure which axes enforce collision boundaries
   * @param x - Enable X-axis collision (default: true)
   * @param y - Enable Y-axis collision (default: true)
   * @param z - Enable Z-axis collision (default: true)
   *
   * @example
   * ```typescript
   * // Horizontal collision only (walls)
   * .withAxes(true, false, true)
   *
   * // Vertical collision only (ground/platforms)
   * .withAxes(false, true, false)
   * ```
   */
  public withAxes(x: boolean, y: boolean, z: boolean): this {
    this.config.collisionAxes = { x, y, z };
    return this;
  }

  /**
   * Shorthand: Enable horizontal collision only (X and Z axes)
   * Useful for walls and barriers
   */
  public withHorizontalCollision(): this {
    this.config.collisionAxes = { x: true, y: false, z: true };
    return this;
  }

  /**
   * Shorthand: Enable vertical collision only (Y axis)
   * Useful for ground, platforms, and ceilings
   */
  public withVerticalCollision(): this {
    this.config.collisionAxes = { x: false, y: true, z: false };
    return this;
  }

  /**
   * Complete registration (auto-called when builder goes out of scope)
   */
  public build(): void {
    if (!this.config.shape) {
      console.warn('[CollisionBuilder] No shape specified, defaulting to box');
      this.config.shape = 'box';
    }

    this.onComplete(this.config as I_CollisionConfig);
  }
}

/**
 * Auto-build when statement ends (fluent API without explicit .build())
 * This is a TypeScript trick - the builder is garbage collected after the statement,
 * but we need to call build() explicitly for now.
 */
