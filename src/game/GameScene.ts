import {
  ModuleLoadingProgressPayload,
  SceneErrorPayload,
  SceneLoadedPayload,
  SceneLoadingEvent,
  SceneLoadingProgressPayload,
  SceneLoadingStartPayload,
} from '@/common/events.types';
import { I_ConnectedClientData } from '@/common/types';
import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import { CleanupRegistry } from '@/game/CleanupRegistry';
import { I_SceneContext, I_SceneModule, I_ModuleServices as I_SceneServices } from '@/game/common/scenes.types';
import type { Engine } from '@/game/Engine';
import { ModuleRegistry } from '@/game/ModuleRegistry';
import { InteractionService } from '@/game/services/InteractionService';
import { PhysicsService } from '@/game/services/PhysicsService';
import { VFXService } from '@/game/services/VFXService';
import { GameConfig, useGameConfigStore } from '@/stores/config.store';
import { SceneStore as ScenesManager, useSceneStore } from '@/stores/scene.store';
import type { ApplicationSettings } from '@/stores/settings.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useWebSocketStore, WebsocketManager } from '@/stores/websocket.store';
import { useRxjs } from 'topsyde-utils';
import NetworkingService from './services/NetworkingService';

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
export abstract class GameScene<
  TModuleRegistry extends Record<string, I_SceneModule> = Record<string, I_SceneModule>,
> {
  
  private enabled = false;
  public modulesLoaded = false;

  protected cleanupRegistry: CleanupRegistry = new CleanupRegistry();
  protected sceneEvents = useRxjs('scene:loading');
  protected moduleEvents = useRxjs('module:loading');

  // Module registry (handles all module tracking)
  private registry = new ModuleRegistry<TModuleRegistry>();

  // Services (shared across modules)
  protected services: I_SceneServices = {
    interaction: new InteractionService(),
    vfx: new VFXService(),
    physics: new PhysicsService(),
    networking: new NetworkingService(),
  };

  // High-level entity composables
  protected character!: ReturnType<typeof useCharacter>;
  protected settings: ApplicationSettings;
  protected config: GameConfig;
  protected scenes: ScenesManager;
  protected websocketManager: WebsocketManager;
  public camera!: ReturnType<typeof useCamera>;

  // Status flags

  // Engine instance (set by subclass constructor)
  public abstract readonly engine: Engine;
  abstract readonly name: string;

  constructor() {
    // Subscribe to module loading events
    this.settings = useSettingsStore();
    this.config = useGameConfigStore();
    this.scenes = useSceneStore();
    this.websocketManager = useWebSocketStore();
    this.camera = useCamera();
    this.character = useCharacter({
      cameraAngleH: this.camera.controller.angle.horizontal,
    });

    this.subscribe();
  }

  /**
   * Template method: Scene initialization flow
   * Can be overridden for custom initialization order
   */
  public async start(): Promise<void> {
    console.log(`🎬 [${this.name}] Initializing scene...`);

    await this.initializeAllServices();
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
    data: T,
  ): void {
    this.sceneEvents.$next(event, { sceneName: this.name, ...data });
  }


  protected async initializeAllServices(): Promise<void> {
    for (const service of Object.values(this.services)) {
      await service.start(this.getSceneContext());
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
    const context: I_SceneContext = this.getSceneContext();

    this.loading('start', { totalAssets: this.moduleCount() });
    this.forEachModule((m) => m.start(context));
  }

  protected getSceneContext(): I_SceneContext {
    const connectedClientData: Partial<I_ConnectedClientData> = this.getClientData();

    return {
      engine: this.engine,
      sceneName: this.name,
      scene: this.engine.scene,
      clientData: connectedClientData,
      cleanupRegistry: this.cleanupRegistry,
      services: this.services, // Pass services (interaction, etc.)
      camera: this.camera,
      character: this.character,
    };
  }

  private getClientData() {

    const connectedClientData: Partial<I_ConnectedClientData> = {
      id: this.websocketManager.clientData?.id,
      name: this.websocketManager.clientData?.name,
      scene: this.name,
    };
    return connectedClientData;
  }

  /**
   * Finalize setup (camera start, watchers, etc.)
   * Override to add scene-specific watchers or post-init logic
   */
  protected finalizeSetup(): void {
    this.camera.start();
  }


  private subscribe() {
    this.moduleEvents.$subscribe({
      loaded: (data: ModuleLoadingProgressPayload) => {
        if (data.sceneName !== this.name) return;

        // Find module by name and mark as initialized
        this.registry.forEach((module) => {
          if (this.registry.getModuleName(module) === data.moduleName) {
            this.registry.markInitialized(module);
            this.loading('loaded', {
              loaded: this.registry.initializedCount(),
              assetName: data.moduleName,
            });
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
   * Cleanup
   * Can be overridden for custom cleanup order
   */
  public async destroy(): Promise<void> {
    console.log(`🧹 [${this.name}] Starting scene cleanup...`);

    this.character.destroy();
    this.camera.destroy();
    await this.destroyAllServices(); // Wait for physics cleanup!
    this.forEachModule((m) => { m.destroy(this.getSceneContext()); m.close?.() });
    this.cleanupRegistry.cleanup(this.engine.scene);
    this.registry.clear();

    console.log(`✅ [${this.name}] Scene cleanup complete`);
  }
}
