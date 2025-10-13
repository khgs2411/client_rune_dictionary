import { Mesh, Object3D, Scene } from 'three';
import type { WatchStopHandle } from 'vue';

/**
 * Interface for any resource that can be disposed
 * Allows SceneLifecycle to manage cleanup of any disposable resource
 * (Geometry, Material, Texture, RenderTarget, custom resources, etc.)
 */
export interface I_Disposable {
  dispose(): void;
}

/**
 * Manages lifecycle of Three.js objects, Vue watchers, and disposable resources
 * Handles automatic cleanup and disposal to prevent memory leaks
 *
 * Architecture:
 * - Single source of truth for cleanup
 * - Components/Services/Modules register themselves for cleanup
 * - Supports Object3D (with recursive traversal), raw disposables, and watchers
 */
export class CleanupRegistry {
  private watchers: WatchStopHandle[] = [];
  private objects: Object3D[] = []; // Object3D instances (with recursive disposal)
  private disposables: I_Disposable[] = []; // Raw disposables (geometry, material, etc.)

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
   * Objects are removed from scene and recursively disposed (traverse + dispose geometry/material)
   * @returns this for fluent chaining
   */
  register(...objects: Object3D[]): this {
    this.objects.push(...objects);
    return this;
  }

  /**
   * Register raw disposable resources (geometry, material, texture, etc.)
   * These are disposed directly without scene removal or traversal
   * Use this for resources not attached to Object3D
   * @returns this for fluent chaining
   */
  registerDisposable(...resources: I_Disposable[]): this {
    this.disposables.push(...resources);
    return this;
  }

  /**
   * Register a module/service/component for tracking
   * This is syntactic sugar for consistency - actual destroy() is called by parent
   * Useful for future extensions (auto-destroy, dependency tracking, etc.)
   * @returns this for fluent chaining
   */
  registerModule(module: { destroy?: () => Promise<void> | void }): this {
    // Currently just a marker for future functionality
    // The parent (GameScene, GameObject, etc.) still manually calls destroy()
    // This could be extended to auto-call destroy on cleanup if needed
    return this;
  }

  /**
   * Cleanup all registered resources
   * Stops watchers, removes objects from scene, and disposes all resources
   */
  cleanup(scene: Scene): void {
    // Stop Vue watchers
    this.watchers.forEach((stop) => stop());

    let objectCount = 0;
    let disposableCount = 0;
    let errorCount = 0;

    // Dispose Object3D instances (remove from scene + recursive disposal)
    this.objects.forEach((obj) => {
      try {
        scene.remove(obj);
        this.disposeObject3D(obj);
        objectCount++;
      } catch (e) {
        errorCount++;
        console.warn('⚠️ [SceneLifecycle] Failed to dispose Object3D:', e);
      }
    });

    // Dispose raw disposables (geometry, material, etc.)
    this.disposables.forEach((resource) => {
      try {
        resource.dispose();
        disposableCount++;
      } catch (e) {
        errorCount++;
        console.warn('⚠️ [SceneLifecycle] Failed to dispose resource:', e);
      }
    });

    // Clear all arrays
    this.watchers = [];
    this.objects = [];
    this.disposables = [];

    if (objectCount > 0 || disposableCount > 0) {
      console.log(
        `🧹 [SceneLifecycle] Cleaned up ${objectCount} objects, ${disposableCount} disposables, ${errorCount} errors`,
      );
    }
  }

  /**
   * Recursively dispose geometries and materials from Object3D
   * Handles Mesh objects (covers 90% of use cases)
   */
  private disposeObject3D(obj: Object3D): void {
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
