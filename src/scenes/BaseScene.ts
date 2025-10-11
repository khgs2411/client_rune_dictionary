import { I_SceneModule } from '@/scenes/scenes.types';
import { SceneLifecycle } from '@/game/SceneLifecycle';
import { useRxjs } from 'topsyde-utils';

/**
 * Base class for game scenes with typed module registry support
 * Subclasses should define their own ModuleRegistry interface
 */
export abstract class GameScene<TModuleRegistry = Record<string, I_SceneModule>> {
  protected modules: Partial<TModuleRegistry> = {};
  protected initializedModules: Set<I_SceneModule> = new Set();
  protected lifecycle: SceneLifecycle = new SceneLifecycle();
  protected rxjs = useRxjs('scene:loading');

  /**
   * Scene name (must be overridden by subclass)
   */
  abstract readonly name: string;

  /**
   * Add a module to the registry with type-safe key checking
   */
  protected addModule<K extends keyof TModuleRegistry>(key: K, module: TModuleRegistry[K]): this {
    this.modules[key] = module;
    return this;
  }

  protected moduleCount(): number {
    return Object.keys(this.modules).length;
  }

  /**
   * Helper to iterate all modules (converts record to array)
   */
  protected forEachModule(callback: (module: I_SceneModule) => void): void {
    Object.values(this.modules).forEach((module) => {
      if (module) callback(module as I_SceneModule);
    });
  }

  /**
   * Helper to iterate only initialized modules (safe for update loop)
   */
  protected forEachInitializedModule(callback: (module: I_SceneModule) => void): void {
    this.initializedModules.forEach((module) => {
      callback(module);
    });
  }

  /**
   * Mark a module as initialized (called after module.start())
   */
  protected markModuleInitialized(module: I_SceneModule): void {
    this.initializedModules.add(module);
  }

  /**
   * Emit loading event with simple API
   */
  protected loading(
    event: 'start' | 'update' | 'fail',
    data: Record<string, any> = {}
  ): void {
    this.rxjs.$next(event, {
      sceneName: this.name,
      ...data,
    });
  }

  abstract start(): void;
  abstract update(...args: any): void;
  abstract destroy(): void;
}
