import { I_SceneModule } from '@/scenes/scenes.types';
import { SceneLifecycle } from '@/game/SceneLifecycle';

/**
 * Base class for game scenes with typed module registry support
 * Subclasses should define their own ModuleRegistry interface
 */
export abstract class GameScene<TModuleRegistry = Record<string, I_SceneModule>> {
  protected modules: Partial<TModuleRegistry> = {};
  protected lifecycle: SceneLifecycle = new SceneLifecycle();

  /**
   * Add a module to the registry with type-safe key checking
   */
  protected addModule<K extends keyof TModuleRegistry>(key: K, module: TModuleRegistry[K]): this {
    this.modules[key] = module;
    return this;
  }

  /**
   * Helper to iterate all modules (converts record to array)
   */
  protected forEachModule(callback: (module: I_SceneModule) => void): void {
    Object.values(this.modules).forEach((module) => {
      if (module) callback(module as I_SceneModule);
    });
  }

  abstract start(): void;
  abstract update(...args: any): void;
  abstract destroy(): void;
}
