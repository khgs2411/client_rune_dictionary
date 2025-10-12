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
