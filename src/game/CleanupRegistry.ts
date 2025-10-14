import { Mesh, Object3D, Scene, BufferGeometry, Material, Texture, Group, Sprite, Points, Line } from 'three';
import type { WatchStopHandle } from 'vue';

/**
 * Interface for any resource that can be disposed
 * Allows CleanupRegistry to manage cleanup of any disposable resource
 * (Geometry, Material, Texture, RenderTarget, custom resources, etc.)
 */
export interface I_Disposable {
  dispose(): void;
}

/**
 * CleanupRegistry - Unified resource cleanup system
 *
 * Manages lifecycle of Three.js objects, Vue watchers, and disposable resources.
 * Prevents memory leaks by handling automatic cleanup and disposal.
 *
 * **Architecture:**
 * - Each GameComponent has its own CleanupRegistry instance
 * - Each GameScene has its own CleanupRegistry instance
 * - Components register their resources during init()
 * - Cleanup happens automatically on destroy()
 *
 * **What it cleans:**
 * - Object3D (Mesh, Group, Sprite, etc.) - Removes from scene + recursive disposal
 * - Geometries, Materials, Textures - Disposes via dispose()
 * - Vue watchers - Stops via stop()
 *
 * **Performance:**
 * - Fluent API for chaining: `cleanup.registerObject(a).registerObject(b)`
 * - Batch operations: `cleanup.registerObject(a, b, c)`
 * - Safe error handling (one failure doesn't block others)
 */
export class CleanupRegistry {
  private watchers: WatchStopHandle[] = [];
  private objects: Object3D[] = []; // Object3D instances (with recursive disposal)
  private disposables: I_Disposable[] = []; // Raw disposables (geometry, material, texture, etc.)

  /**
   * Register Vue watcher for automatic cleanup
   * @returns this for fluent chaining
   */
  registerWatcher(watcher: WatchStopHandle): this {
    this.watchers.push(watcher);
    return this;
  }

  /**
   * Register Three.js objects for automatic cleanup
   *
   * Handles all Object3D types:
   * - Mesh, Group, Sprite, Points, Line, etc.
   * - Recursively disposes geometries and materials
   * - Removes from scene before disposal
   *
   * @param objects - One or more Object3D instances to register
   * @returns this for fluent chaining
   *
   * @example
   * ```typescript
   * this.cleanup
   *   .registerObject(mesh)
   *   .registerObject(group1, group2, sprite);
   * ```
   */
  registerObject(...objects: Object3D[]): this {
    this.objects.push(...objects);
    return this;
  }

  /**
   * Register raw disposable resources (geometry, material, texture, etc.)
   *
   * Use this for resources NOT attached to Object3D, such as:
   * - Shared geometries/materials used across multiple meshes
   * - Textures not yet assigned to materials
   * - Custom disposable resources
   *
   * @param resources - One or more disposable resources
   * @returns this for fluent chaining
   *
   * @example
   * ```typescript
   * const sharedGeometry = new BoxGeometry();
   * const sharedTexture = new CanvasTexture(canvas);
   * this.cleanup
   *   .registerDisposable(sharedGeometry)
   *   .registerDisposable(sharedTexture);
   * ```
   */
  registerDisposable(...resources: I_Disposable[]): this {
    this.disposables.push(...resources);
    return this;
  }

  /**
   * Cleanup all registered resources
   *
   * **Execution order:**
   * 1. Stop Vue watchers
   * 2. Remove Object3D from scene + recursive disposal
   * 3. Dispose raw resources
   * 4. Clear all registries
   *
   * **Error handling:**
   * - Individual failures don't block other cleanups
   * - Warnings logged for failed operations
   *
   * @param scene - Three.js scene (for removing objects)
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
        console.warn('⚠️ [CleanupRegistry] Failed to dispose Object3D:', e);
      }
    });

    // Dispose raw disposables (geometry, material, texture, etc.)
    this.disposables.forEach((resource) => {
      try {
        resource.dispose();
        disposableCount++;
      } catch (e) {
        errorCount++;
        console.warn('⚠️ [CleanupRegistry] Failed to dispose resource:', e);
      }
    });

    // Clear all arrays
    this.watchers = [];
    this.objects = [];
    this.disposables = [];

    if (objectCount > 0 || disposableCount > 0) {
      console.log(
        `🧹 [CleanupRegistry] Cleaned up ${objectCount} objects, ${disposableCount} disposables${errorCount > 0 ? `, ${errorCount} errors` : ''}`,
      );
    }
  }

  /**
   * Recursively dispose geometries and materials from Object3D
   *
   * **Handles:**
   * - Mesh (geometry + material/material[])
   * - Sprite (geometry + material)
   * - Points (geometry + material)
   * - Line (geometry + material)
   * - Groups (recursively traverses children)
   *
   * **Material handling:**
   * - Single material: mat.dispose()
   * - Material array: mat.forEach(m => m.dispose())
   * - Textures in materials: texture.dispose() for maps
   *
   * @private
   */
  private disposeObject3D(obj: Object3D): void {
    obj.traverse((child) => {
      // Handle Mesh, Sprite, Points, Line (all have geometry + material)
      if (this.hasGeometryAndMaterial(child)) {
        this.disposeGeometry(child);
        this.disposeMaterial(child);
      }
    });
  }

  /**
   * Type guard: Check if object has geometry and material properties
   * @private
   */
  private hasGeometryAndMaterial(obj: Object3D): obj is Mesh | Sprite | Points | Line {
    return 'geometry' in obj && 'material' in obj;
  }

  /**
   * Dispose geometry from object
   * @private
   */
  private disposeGeometry(obj: Mesh | Sprite | Points | Line): void {
    const geometry = obj.geometry as BufferGeometry | undefined;
    if (geometry && 'dispose' in geometry) {
      geometry.dispose();
    }
  }

  /**
   * Dispose material(s) from object
   * Handles both single material and material arrays
   * Also disposes textures from material maps
   * @private
   */
  private disposeMaterial(obj: Mesh | Sprite | Points | Line): void {
    const material = obj.material;

    if (!material) return;

    // Handle material array (multi-material meshes)
    if (Array.isArray(material)) {
      material.forEach((mat) => this.disposeSingleMaterial(mat));
    } else {
      this.disposeSingleMaterial(material);
    }
  }

  /**
   * Dispose a single material and its textures
   * @private
   */
  private disposeSingleMaterial(material: Material): void {
    // Dispose textures from material maps
    this.disposeTextures(material);

    // Dispose the material itself
    if ('dispose' in material) {
      material.dispose();
    }
  }

  /**
   * Dispose all textures from a material
   *
   * Common texture maps:
   * - map (color/diffuse)
   * - normalMap, bumpMap, displacementMap
   * - roughnessMap, metalnessMap, aoMap
   * - emissiveMap, lightMap
   * - envMap (environment/reflection)
   * - alphaMap
   *
   * @private
   */
  private disposeTextures(material: Material): void {
    // Use string array instead of keyof Material since not all materials have all properties
    const textureProps: string[] = [
      'map',
      'normalMap',
      'bumpMap',
      'displacementMap',
      'roughnessMap',
      'metalnessMap',
      'aoMap',
      'emissiveMap',
      'lightMap',
      'envMap',
      'alphaMap',
    ];

    textureProps.forEach((prop) => {
      const texture = (material as any)[prop] as Texture | undefined;
      if (texture && texture.dispose && typeof texture.dispose === 'function') {
        texture.dispose();
      }
    });
  }

  /**
   * Get count of registered resources (for debugging)
   */
  public getRegisteredCount(): { objects: number; disposables: number; watchers: number } {
    return {
      objects: this.objects.length,
      disposables: this.disposables.length,
      watchers: this.watchers.length,
    };
  }

  /**
   * Check if registry is empty
   */
  public isEmpty(): boolean {
    return this.objects.length === 0 && this.disposables.length === 0 && this.watchers.length === 0;
  }
}
