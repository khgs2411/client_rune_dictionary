import { I_InteractableModule, I_ModuleContext, I_SceneModule, I_UpdateableModule, IsInteractableModule, IsUpdateableModule } from '@/scenes/scenes.types';
import { SceneLifecycle } from '@/game/SceneLifecycle';
import { useRxjs } from 'topsyde-utils';
import {
  SceneErrorPayload,
  SceneLoadingEvent,
  SceneLoadingProgressPayload,
  SceneLoadingStartPayload,
  ModuleLoadingProgressPayload,
  SceneLoadedPayload,
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
export abstract class GameScene<TModuleRegistry extends Record<string, I_SceneModule> = Record<string, I_SceneModule>> {
  private enabled = false;
  private modulesLoaded = false;
  protected modules: Partial<TModuleRegistry> = {};
  protected updateableModules: Set<I_UpdateableModule> = new Set();
  protected interactableModules: Set<I_InteractableModule> = new Set();

  protected initializedModules: Set<I_SceneModule> = new Set();
  protected initializedUpdateableModules: Set<I_UpdateableModule> = new Set();
  protected moduleNames: Map<I_SceneModule, string> = new Map();
  protected lifecycle: SceneLifecycle = new SceneLifecycle();
  protected sceneEvents = useRxjs('scene:loading');
  protected moduleEvents = useRxjs('module:loading');

  // High-level entity composables
  protected character!: ReturnType<typeof useCharacter>;
  protected settings!: SettingsStore;

  public camera!: ReturnType<typeof useCamera>;

  // Engine instance (set by subclass constructor)
  public abstract readonly engine: Engine;
  abstract readonly name: string;

  constructor() {
    // Subscribe to module loading events
    this.moduleEvents.$subscribe({
      loaded: (data: ModuleLoadingProgressPayload) => {
        if (data.sceneName !== this.name) return;

        for (const [module, moduleName] of this.moduleNames.entries()) {
          if (moduleName === data.moduleName) {
            this.markModuleInitialized(module);
            console.log(`✅ [${this.name}] Loaded Module: "${data.moduleName}"`);
            this.loading('loaded', { loaded: this.initializedModules.size });
            break;
          }
        }
      },
    });

    this.sceneEvents.$subscribe({
      complete: (data: SceneLoadedPayload) => {
        if (data.sceneName !== this.name) return;
        this.modulesLoaded = true;
        this.enabled = this.modulesLoaded;
      },
    });
  }

  /**
   * Scene name (must be overridden by subclass)
   */


  /**
   * Template method: Scene initialization flow
   * Can be overridden for custom initialization order
   */
  public start(): void {
    console.log(`🎬 [${this.name}] Initializing scene...`);

    this.initializeComposables();
    this.registerModules();
    this.addSceneObjects();
    this.forEachInteractableModule();
    this.startModuleLoading();
    this.finalizeSetup();

    console.log(`✅ [${this.name}] Scene initialization complete`);
  }


  /**
   * Add a module to the registry with type-safe key checking
   */
  protected addModule<K extends keyof TModuleRegistry>(key: K, module: TModuleRegistry[K]): this {
    this.modules[key] = module;
    this.moduleNames.set(module as I_SceneModule, String(key)); // Track module name
    
    this.updateableModules = Object.values(this.modules).reduce((acc, m) => {
      if (IsUpdateableModule(m)) acc.add(m);
      return acc;
    }, new Set());

    this.interactableModules = Object.values(this.modules).reduce((acc, m) => {
      if (IsInteractableModule(m)) {
        acc.add(m);
      }
      return acc;
    }, new Set());
    return this;
  }

  protected getModule<K extends keyof TModuleRegistry>(key: K): TModuleRegistry[K] | undefined {
    return this.modules[key];
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


  private forEachInteractableModule(): void {
    this.interactableModules.forEach((module) => {
      this.setupInteractableModules(module);
    });
  }

  protected abstract setupInteractableModules(m:I_InteractableModule): void


  /**
   * Mark a module as initialized (called after module.start())
   */
  protected markModuleInitialized(module: I_SceneModule): void {
    this.initializedModules.add(module);
    if (IsUpdateableModule(module)) {
      this.initializedUpdateableModules.add(module);
    }
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
    this.sceneEvents.$next(event, { sceneName: this.name, ...data });
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

  /** Add scene objects (MUST be implemented by subclass)
   * This is where scene-specific objects are added to the scene
   */
  protected abstract addSceneObjects(): void;


  /**
   * Start async module loading
   * Override only if you need custom context or loading logic
   */
  protected startModuleLoading(): void {
    const context: I_ModuleContext = this.getModuleContext()

    this.loading('start', { totalAssets: this.moduleCount() });
    this.forEachModule((m) => m.start(context));
  }

  protected getModuleContext(): I_ModuleContext {
    return {
      engine: this.engine,
      sceneName: this.name,
      scene: this.engine.scene,
      lifecycle: this.lifecycle,
      settings: this.settings,
      camera: this.camera, // Pass camera for modules that need it (interaction, etc.)
      character: this.character, // Pass character for modules that need it (interaction, etc.)
    };
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
    if (!this.enabled) return;
    this.character.update(delta);
    this.camera.update(this.character.controller.getPosition());
    this.initializedUpdateableModules.forEach((module) => {
      module.update(delta);
    });
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
