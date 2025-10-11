import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { SceneLifecycle } from '@/game/SceneLifecycle';
import { useRxjs } from 'topsyde-utils';
import {
  SceneErrorPayload,
  SceneLoadingEvent,
  SceneLoadingProgressPayload,
  SceneLoadingStartPayload,
  ModuleLoadingProgressPayload,
} from '@/common/events.types';
import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import { useSettingsStore } from '@/stores/settings.store';
import type { Engine } from '@/game/Engine';
import type { SettingsStore } from '@/stores/settings.store';

/**
 * Base class for game scenes with typed module registry support
 * Implements template pattern with default lifecycle implementations
 * Subclasses only need to override scene-specific logic
 */
export abstract class GameScene<TModuleRegistry = Record<string, I_SceneModule>> {
  protected modules: Partial<TModuleRegistry> = {};
  protected initializedModules: Set<I_SceneModule> = new Set();
  protected moduleNames: Map<I_SceneModule, string> = new Map();
  protected lifecycle: SceneLifecycle = new SceneLifecycle();
  protected rxjs = useRxjs('scene:loading');
  protected moduleLoadingRxjs = useRxjs('module:loading');

  // High-level entity composables
  public camera!: ReturnType<typeof useCamera>;
  protected character!: ReturnType<typeof useCharacter>;
  protected settings!: SettingsStore;

  // Engine instance (set by subclass constructor)
  public abstract readonly engine: Engine;

  constructor() {
    // Subscribe to module loading events
    this.moduleLoadingRxjs.$subscribe({
      loaded: (data: ModuleLoadingProgressPayload) => {
        if (data.sceneName !== this.name) return;

        for (const [module, moduleName] of this.moduleNames.entries()) {
          if (moduleName === data.moduleName) {
            this.markModuleInitialized(module);
            console.log(`✅ [${this.name}] Module "${data.moduleName}" initialized`);
            this.loading('loaded', { loaded: this.initializedModules.size });
            break;
          }
        }
      },
    });
  }

  /**
   * Scene name (must be overridden by subclass)
   */
  abstract readonly name: string;

  /**
   * Add a module to the registry with type-safe key checking
   */
  protected addModule<K extends keyof TModuleRegistry>(key: K, module: TModuleRegistry[K]): this {
    this.modules[key] = module;
    this.moduleNames.set(module as I_SceneModule, String(key)); // Track module name
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
  protected loading(event: 'start', data: Omit<SceneLoadingStartPayload, 'sceneName'>): void;
  protected loading(event: 'loaded', data: Omit<SceneLoadingProgressPayload, 'sceneName'>): void;
  protected loading(event: 'fail', data: Omit<SceneErrorPayload, 'sceneName'>): void;
  protected loading<T extends Omit<SceneLoadingEvent, 'sceneName'>>(
    event: 'start' | 'loaded' | 'fail',
    data: T
  ): void {
    this.rxjs.$next(event, { sceneName: this.name, ...data });
  }

  /**
   * Template method: Scene initialization flow
   * Can be overridden for custom initialization order
   */
  public start(): void {
    console.log(`🎬 [${this.name}] Initializing scene...`);

    this.initializeComposables();
    this.registerModules();
    this.startModuleLoading();
    this.finalizeSetup();

    console.log(`✅ [${this.name}] Scene initialization complete`);
  }

  /**
   * Default composables initialization
   * Override to customize camera/character setup
   */
  protected initializeComposables(): void {
    this.settings = useSettingsStore();
    this.camera = useCamera();
    this.character = useCharacter({
      cameraAngleH: this.camera.controller.angle.horizontal,
    });
  }

  /**
   * Register scene modules (MUST be implemented by subclass)
   * This is where scene-specific module composition happens
   */
  protected abstract registerModules(): void;

  /**
   * Start async module loading
   * Override only if you need custom context or loading logic
   */
  protected startModuleLoading(): void {
    const context: I_ModuleContext = {
      engine: this.engine,
      scene: this.engine.scene,
      lifecycle: this.lifecycle,
      settings: this.settings,
      sceneName: this.name,
    };

    this.loading('start', { totalAssets: this.moduleCount() });
    this.forEachModule((m) => m.start(context));
  }

  /**
   * Finalize setup (camera start, watchers, etc.)
   * Override to add scene-specific watchers or post-init logic
   */
  protected finalizeSetup(): void {
    this.camera.start();
  }

  /**
   * Update loop
   * Can be overridden for custom update order
   */
  public update(delta: number): void {
    this.character.update(delta);
    this.camera.update(this.character.controller.getPosition());
    this.forEachInitializedModule((m) => m.update(delta));
  }

  /**
   * Cleanup
   * Can be overridden for custom cleanup order
   */
  public destroy(): void {
    console.log(`🧹 [${this.name}] Starting scene cleanup...`);

    this.character.destroy();
    this.camera.destroy();
    this.forEachModule((m) => m.destroy());
    this.lifecycle.cleanup(this.engine.scene);

    console.log(`✅ [${this.name}] Scene cleanup complete`);
  }
}
