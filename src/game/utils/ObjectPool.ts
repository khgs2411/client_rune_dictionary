import { GameObject } from '@/game/GameObject';
import { nanoid } from 'nanoid';

/**
 * Factory function type for creating GameObjects
 * @param id - Unique instance ID
 * @param config - Configuration object
 * @returns New GameObject instance
 */
export type FactoryFunction<T extends GameObject = GameObject> = (
  id: string,
  config: any,
) => T;

/**
 * ObjectPool - Generic object pooling for GameObjects
 *
 * Manages a pool of reusable GameObject instances to avoid
 * expensive creation/destruction operations.
 *
 * Features:
 * - Lazy creation (objects created on-demand)
 * - Automatic reset via GameObject.reset() method
 * - Tracks active vs available instances
 * - Optional max pool size
 *
 * Usage:
 * ```typescript
 * const pool = new ObjectPool(
 *   'fireball',
 *   (id, config) => new Fireball({ id, ...config })
 * );
 *
 * const fireball = pool.acquire({ position: [0, 1, 0] });
 * // ... use fireball
 * pool.release(fireball);
 * ```
 */
export class ObjectPool<T extends GameObject = GameObject> {
  private available: T[] = []; // Ready to reuse
  private active = new Set<string>(); // IDs currently in use
  private factory: FactoryFunction<T>;
  private maxSize: number;
  public readonly type: string;

  /**
   * Create an object pool
   * @param type - Pool type identifier (e.g., 'fireball', 'monster')
   * @param factory - Function to create new instances
   * @param maxSize - Maximum pool size (0 = unlimited)
   */
  constructor(type: string, factory: FactoryFunction<T>, maxSize: number = 0) {
    this.type = type;
    this.factory = factory;
    this.maxSize = maxSize;
  }

  /**
   * Get an object from the pool (reused or newly created)
   * @param config - Configuration to pass to factory or reset
   * @returns GameObject instance
   */
  acquire(config: any = {}): T {
    let obj: T;

    if (this.available.length > 0) {
      // Reuse from pool
      obj = this.available.pop()!;

      // Reset object state if reset method exists
      if ('reset' in obj && typeof obj.reset === 'function') {
        (obj as any).reset(config);
      }

      console.log(`♻️  [ObjectPool:${this.type}] Reused from pool (available: ${this.available.length})`);
    } else {
      // Create new instance
      const id = nanoid(8); // Short unique ID
      obj = this.factory(id, config);

      console.log(
        `✨ [ObjectPool:${this.type}] Created new instance (active: ${this.active.size + 1})`,
      );
    }

    this.active.add(obj.id);
    return obj;
  }

  /**
   * Return an object to the pool for reuse
   * @param obj - GameObject to return
   */
  release(obj: T): void {
    if (!this.active.has(obj.id)) {
      console.warn(
        `[ObjectPool:${this.type}] Attempted to release object that wasn't active: ${obj.id}`,
      );
      return;
    }

    this.active.delete(obj.id);

    // Only keep in pool if under max size (0 = unlimited)
    if (this.maxSize === 0 || this.available.length < this.maxSize) {
      this.available.push(obj);
      console.log(
        `♻️  [ObjectPool:${this.type}] Returned to pool (available: ${this.available.length})`,
      );
    } else {
      // Pool is full, actually destroy the object
      obj.destroy();
      console.log(
        `🗑️  [ObjectPool:${this.type}] Pool full, destroyed object (max: ${this.maxSize})`,
      );
    }
  }

  /**
   * Pre-warm the pool by creating instances ahead of time
   * @param count - Number of instances to create
   */
  preWarm(count: number): void {
    const toCreate = Math.max(0, count - this.available.length);

    for (let i = 0; i < toCreate; i++) {
      const id = nanoid(8);
      const obj = this.factory(id, {});
      this.available.push(obj);
    }

    console.log(
      `🔥 [ObjectPool:${this.type}] Pre-warmed pool with ${toCreate} instances (total available: ${this.available.length})`,
    );
  }

  /**
   * Clear all available instances from pool (does not affect active objects)
   */
  clear(): void {
    // Destroy all available objects
    this.available.forEach((obj) => obj.destroy());
    this.available = [];

    console.log(`🧹 [ObjectPool:${this.type}] Cleared pool (active: ${this.active.size})`);
  }

  /**
   * Get count of active instances
   */
  getActiveCount(): number {
    return this.active.size;
  }

  /**
   * Get count of available instances
   */
  getAvailableCount(): number {
    return this.available.length;
  }

  /**
   * Get total instances (active + available)
   */
  getTotalCount(): number {
    return this.active.size + this.available.length;
  }

  /**
   * Check if an instance is currently active
   */
  isActive(id: string): boolean {
    return this.active.has(id);
  }
}
