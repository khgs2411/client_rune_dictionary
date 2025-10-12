import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
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
import { ModuleRegistry } from '@/game/ModuleRegistry';
import { InteractionService } from '@/game/services/InteractionService';
import { CollisionService } from '@/game/services/CollisionService';
import { VFXModule } from '@/game/modules/scene/VFXModule';
import { PhysicsService } from '@/game/services/PhysicsService';

/**
 * Base class for game scenes with typed module registry support
 * Implements template pattern with default lifecycle implementations
 * Subclasses only need to override scene-specific logic
 *
 * Refactored to use:
 * - ModuleRegistry utility (eliminates duplicate code)
 * - InteractionService (eliminates I_InteractableModule boilerplate)
 * - VFXModule for visual effects (Three.js object pooling)
 * - Optional lifecycle hooks (no need for I_UpdateableModule, I_ThemedModule interfaces)
 */
export abstract class GameScene<TModuleRegistry extends Record<string, I_SceneModule> = Record<string, I_SceneModule>> {
  private enabled = false;

  protected lifecycle: SceneLifecycle = new SceneLifecycle();
  protected sceneEvents = useRxjs('scene:loading');
  protected moduleEvents = useRxjs('module:loading');

  // Module registry (handles all module tracking)
  private registry = new ModuleRegistry<TModuleRegistry>();

  // Services (shared across modules)
  protected services = {
    interaction: new InteractionService(),
    collision: new CollisionService(),
    vfx: new VFXModule(),
    physics: new PhysicsService(),
  };

  // High-level entity composables
  protected character!: ReturnType<typeof useCharacter>;
  protected settings!: SettingsStore;
  public camera!: ReturnType<typeof useCamera>;

  // Status flags
  public modulesLoaded = false;

  // Engine instance (set by subclass constructor)
  public abstract readonly engine: Engine;
  abstract readonly name: string;

  constructor() {
    // Subscribe to module loading events
    this.moduleEvents.$subscribe({
      loaded: (data: ModuleLoadingProgressPayload) => {
        if (data.sceneName !== this.name) return;

        // Find module by name and mark as initialized
        this.registry.forEach((module) => {
          if (this.registry.getModuleName(module) === data.moduleName) {
            this.registry.markInitialized(module);
            this.loading('loaded', { loaded: this.registry.initializedCount(), assetName:data.moduleName });
          }
        });
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
  public async start(): Promise<void> {
    console.log(`🎬 [${this.name}] Initializing scene...`);

    await this.initializeServices();
    this.registerModules();
    this.addSceneObjects();
    this.startModuleLoading();
    this.finalizeSetup();

    console.log(`✅ [${this.name}] Scene initialization complete`);
  }


  /**
   * Update loop
   * Can be overridden for custom update order
   */
  public update(delta: number): void {
    if (!this.enabled) return;

    // Update character and camera
    this.character.update(delta);
    this.camera.update(this.character.controller.getPosition());

    // Update services
    this.updateAllServices(delta);

    // Update only initialized updateable modules (performance optimization)
    this.registry.getInitializedUpdateable().forEach((module) => {
      if (module.update) {
        module.update(delta);
      }
    });
  }

  /**
   * Add a module to the registry with type-safe key checking
   */
  public addModule<K extends keyof TModuleRegistry>(key: K, module: TModuleRegistry[K]): this {
    this.registry.add(key, module);
    console.log(`➕ [${this.name}] Added module: "${String(key)}"`);
    return this;
  }

  /**
   * Get a module from the registry
   */
  public getModule<K extends keyof TModuleRegistry>(key: K): TModuleRegistry[K] | undefined {
    return this.registry.get(key);
  }

  /**
   * Get module count
   */
  public moduleCount(): number {
    return this.registry.count();
  }

  /**
   * Iterate all modules
   */
  public forEachModule(callback: (module: I_SceneModule) => void): void {
    this.registry.forEach(callback);
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
  protected async initializeServices(): Promise<void> {
    this.settings = useSettingsStore();
    this.camera = useCamera();
    this.character = useCharacter({
      cameraAngleH: this.camera.controller.angle.horizontal,
    });

    // Initialize all services (async - wait for physics, etc.)
    await this.initializeAllServices();
  }

  protected async initializeAllServices(): Promise<void> {
    for (const service of Object.values(this.services)) {
      await service.start(this.getModuleContext());
    }
  }

  protected updateAllServices(delta: number): void {
    for (const service of Object.values(this.services)) {
      if (service.update) {
        service.update(delta);
      }
    }
  }

  protected async destroyAllServices(): Promise<void> {
    for (const service of Object.values(this.services)) {
      await service.destroy();
    }
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
      services: this.services, // Pass services (interaction, etc.)
      camera: this.camera,
      character: this.character,
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
   * Cleanup
   * Can be overridden for custom cleanup order
   */
  public destroy(): void {
    console.log(`🧹 [${this.name}] Starting scene cleanup...`);

    this.character.destroy();
    this.camera.destroy();
    this.destroyAllServices();
    this.forEachModule((m) => m.destroy());
    this.lifecycle.cleanup(this.engine.scene);
    this.registry.clear();

    console.log(`✅ [${this.name}] Scene cleanup complete`);
  }
}
