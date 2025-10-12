import type { I_SceneModule } from '@/scenes/scenes.types';

/**
 * Module Registry Utility
 * Manages a typed collection of modules with automatic updateable tracking
 *
 * Features:
 * - Type-safe module storage with generics
 * - Automatic updateable module detection
 * - Performance-optimized tracking (no filter() calls every frame)
 * - Initialization state management
 */
export class ModuleRegistry<TModuleRegistry extends Record<string, I_SceneModule>> {
  private modules = new Map<keyof TModuleRegistry, I_SceneModule>();
  private moduleNames = new Map<I_SceneModule, string>();
  private updateableModules = new Set<I_SceneModule>();
  private initializedModules = new Set<I_SceneModule>();
  private initializedUpdateableModules = new Set<I_SceneModule>(); // Performance: avoid filter() every frame

  /**
   * Add a module to the registry
   * Automatically tracks updateable modules
   */
  add<K extends keyof TModuleRegistry>(key: K, module: TModuleRegistry[K]): this {
    this.modules.set(key, module);

    // Track module name
    const moduleName = String(key);
    this.moduleNames.set(module as I_SceneModule, moduleName);

    // Auto-set module name if supported
    if ('setName' in module && typeof module.setName === 'function') {
      module.setName(moduleName);
    }

    // Auto-detect updateable modules
    if (this.isUpdateable(module)) {
      this.updateableModules.add(module);
    }

    return this;
  }

  /**
   * Get a module by key
   */
  get<K extends keyof TModuleRegistry>(key: K): TModuleRegistry[K] | undefined {
    return this.modules.get(key) as TModuleRegistry[K] | undefined;
  }

  /**
   * Get module name
   */
  getModuleName(module: I_SceneModule): string | undefined {
    return this.moduleNames.get(module);
  }

  /**
   * Iterate all modules
   */
  forEach(callback: (module: I_SceneModule) => void): void {
    this.modules.forEach((module) => callback(module));
  }

  /**
   * Async iteration over all modules
   */
  async forEachAsync(callback: (module: I_SceneModule) => Promise<void>): Promise<void> {
    for (const module of this.modules.values()) {
      await callback(module);
    }
  }

  /**
   * Get all updateable modules
   */
  getUpdateable(): Set<I_SceneModule> {
    return this.updateableModules;
  }

  /**
   * Get all initialized updateable modules
   * Performance: Returns a Set, no filter() call needed every frame
   */
  getInitializedUpdateable(): Set<I_SceneModule> {
    return this.initializedUpdateableModules;
  }

  /**
   * Mark module as initialized
   * Performance: Also tracks initialized updateable modules separately
   */
  markInitialized(module: I_SceneModule): void {
    this.initializedModules.add(module);

    // If this is an updateable module, add to initialized updateable set
    if (this.updateableModules.has(module)) {
      this.initializedUpdateableModules.add(module);
    }
  }

  /**
   * Get module count
   */
  count(): number {
    return this.modules.size;
  }

  /**
   * Get initialized module count
   */
  initializedCount(): number {
    return this.initializedModules.size;
  }

  /**
   * Check if all modules are initialized
   */
  allInitialized(): boolean {
    return this.initializedModules.size === this.modules.size;
  }

  /**
   * Clear all modules
   */
  clear(): void {
    this.modules.clear();
    this.moduleNames.clear();
    this.updateableModules.clear();
    this.initializedModules.clear();
    this.initializedUpdateableModules.clear();
  }

  /**
   * Type guard for updateable modules
   */
  private isUpdateable(module: any): module is I_SceneModule & { update: (delta: number, ...args: any[]) => void | Promise<void> } {
    return typeof module.update === 'function';
  }
}
