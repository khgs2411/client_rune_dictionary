import { I_HasInteractableModules, I_HasUpdateableModules, I_InteractableModule, I_ModuleContext, I_SceneModule, I_UpdateableModule, IsInteractableModule, IsUpdateableModule } from '@/scenes/scenes.types';
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

export interface I_GameScene extends I_HasInteractableModules, I_HasUpdateableModules { }

/**
 * Base class for game scenes with typed module registry support
 * Implements template pattern with default lifecycle implementations
 * Subclasses only need to override scene-specific logic
 */
export abstract class GameScene<TModuleRegistry extends Record<string, I_SceneModule> = Record<string, I_SceneModule>> implements I_GameScene {
  private enabled = false;

  protected lifecycle: SceneLifecycle = new SceneLifecycle();
  protected sceneEvents = useRxjs('scene:loading');
  protected moduleEvents = useRxjs('module:loading');

  // High-level entity composables
  protected character!: ReturnType<typeof useCharacter>;
  protected settings!: SettingsStore;

  public modulesLoaded = false;
  public modules: Partial<TModuleRegistry> = {};
  public updateableModules: Set<I_UpdateableModule> = new Set();
  public interactableModules: Set<I_InteractableModule> = new Set();
  public initializedModules: Set<I_SceneModule> = new Set();
  public initializedUpdateableModules: Set<I_UpdateableModule> = new Set();
  public moduleNames: Map<I_SceneModule, string> = new Map();

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

        // Run module setup logic once all modules are loaded
        this.setupModules();

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
    this.startModuleLoading();
    this.finalizeSetup();

    console.log(`✅ [${this.name}] Scene initialization complete`);
  }


  /**
   * Add a module to the registry with type-safe key checking
   */
  public addModule<K extends keyof TModuleRegistry>(key: K, module: TModuleRegistry[K]): this {
    this.modules[key] = module;

    // Auto-set module name from registry key
    const moduleName = String(key);
    if ('setName' in module && typeof module.setName === 'function') {
      module.setName(moduleName);
    }

    this.moduleNames.set(module as I_SceneModule, moduleName); // Track module name

    if (IsUpdateableModule(module)) {
      this.updateableModules.add(module);
    }
    if (IsInteractableModule(module)) {
      this.interactableModules.add(module);
    }

    console.log(`➕ [${this.name}] Added module: "${moduleName}"`);
    return this;
  }

  public getModule<K extends keyof TModuleRegistry>(key: K): TModuleRegistry[K] | undefined {
    return this.modules[key];
  }

  public moduleCount(): number {
    return Object.keys(this.modules).length;
  }

  /**
   * Helper to iterate all modules (converts record to array)
   */
  public forEachModule(callback: (module: I_SceneModule) => void): void {
    Object.values(this.modules).forEach((module) => {
      if (module) callback(module as I_SceneModule);
    });
  }


  private setupModules() {
    // Register interactable objects after all modules are loaded
    this.setupEveryInteractableModule();
  }

  private setupEveryInteractableModule(): void {
    console.log(`🔗 [${this.name}] Setting up ${this.interactableModules.size} interactable modules...`);
    this.interactableModules.forEach((module) => {
      this.setupInteractableModules(module);
    });
  }

  private disposeEveryInteractableModule(): void {
    console.log(`🔗 [${this.name}] Disposing ${this.interactableModules.size} interactable modules...`);
    this.interactableModules.forEach((module) => {
      this.disposeInteractableModules(module);
    });
  }

  /**
   * Setup interactable modules (default implementation)
   * Override only if you need custom behavior
   */
  protected setupInteractableModules(m: I_InteractableModule): void {
    // Default: look for 'interaction' module in registry
    const interactionSystem = this.getModule('interaction' as keyof TModuleRegistry);
    if (interactionSystem && 'register' in interactionSystem) {
      m.setInteractionSystem(interactionSystem as any);
    }
  }

  /**
   * Dispose interactable modules (default implementation)
   * Override only if you need custom behavior
   */
  protected disposeInteractableModules(m: I_InteractableModule): void {
    // Default: look for 'interaction' module in registry
    const interactionSystem = this.getModule('interaction' as keyof TModuleRegistry);
    if (interactionSystem && 'unregister' in interactionSystem) {
      m.clearInteractionSystem(interactionSystem as any);
    }
  }


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
    this.disposeEveryInteractableModule();
    this.forEachModule((m) => m.destroy());
    this.lifecycle.cleanup(this.engine.scene);

    console.log(`✅ [${this.name}] Scene cleanup complete`);
  }
}
