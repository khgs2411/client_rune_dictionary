import { Mesh, Object3D, Scene } from 'three';
import type { WatchStopHandle } from 'vue';

/**
 * Manages lifecycle of Three.js objects and Vue watchers
 * Handles automatic cleanup and disposal to prevent memory leaks
 */

export class SceneLifecycle {
  private watchers: WatchStopHandle[] = [];
  private disposables: Object3D[] = [];

  /**
   * Register Vue watcher for automatic cleanup
   * @returns this for fluent chaining
   */
  watch(watcher: WatchStopHandle): this {
    this.watchers.push(watcher);
    return this;
  }

  /**
   * Register Three.js objects for automatic cleanup
   * @returns this for fluent chaining
   */
  register(...objects: Object3D[]): this {
    this.disposables.push(...objects);
    return this;
  }

  /**
   * Cleanup all registered resources
   * Stops watchers, removes objects from scene, and disposes geometries/materials
   */
  cleanup(scene: Scene): void {
    console.log('      ↳ Stopping', this.watchers.length, 'Vue watchers...');
    this.watchers.forEach((stop) => stop());

    console.log('      ↳ Removing', this.disposables.length, 'Three.js objects from scene...');
    console.log('      ↳ Disposing geometries and materials...');

    let disposedCount = 0;
    let errorCount = 0;

    this.disposables.forEach((obj) => {
      try {
        scene.remove(obj);
        this.dispose(obj);
        disposedCount++;
      } catch (e) {
        errorCount++;
        console.warn('      ⚠️ Failed to dispose object:', e);
      }
    });

    console.log(`      ↳ Successfully disposed: ${disposedCount}, Errors: ${errorCount}`);

    // Clear arrays
    this.watchers = [];
    this.disposables = [];
  }

  /**
   * Recursively dispose geometries and materials
   * Handles Mesh objects (covers 90% of use cases)
   */
  private dispose(obj: Object3D): void {
    obj.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }
}
