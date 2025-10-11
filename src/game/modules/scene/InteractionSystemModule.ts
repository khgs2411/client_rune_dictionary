import SceneModule from '@/game/SceneModule';
import { I_EntityModule, I_HasUpdateableModules, I_ModuleContext, I_SceneModule, I_UpdateableModule, IsUpdateableModule } from '@/scenes/scenes.types';
import type { Object3D } from 'three';
import { InteractableModule } from '../entity/InteractableModule';
import type { I_InteractionEntityConfig } from '../entity/interaction.types';
import { VisualFeedbackModule } from '../entity/VisualFeedbackModule';


interface InteractionSystemModuleRegistry extends Record<string, I_EntityModule> {
  interaction: InteractableModule;
  visualFeedback: VisualFeedbackModule;
}

export interface I_InteractionSystem extends I_UpdateableModule, I_HasUpdateableModules<InteractionSystemModuleRegistry> { }

/**
 * Interaction System Module
 * Unified module that handles both interaction detection and visual feedback
 * Combines InteractionEntityModule and VisualFeedbackEntityModule into a single interface
 */
export class InteractionSystemModule<
  TModuleRegistry extends InteractionSystemModuleRegistry = InteractionSystemModuleRegistry
> extends SceneModule implements I_InteractionSystem {
  // private interaction = new InteractableModule();
  // private visualFeedback = new VisualFeedbackModule();

  public modulesLoaded = false;
  public modules: Partial<TModuleRegistry> = {};
  public updateableModules: Set<I_UpdateableModule> = new Set();
  public initializedModules: Set<I_SceneModule> = new Set();
  public initializedUpdateableModules: Set<I_UpdateableModule> = new Set();
  public moduleNames: Map<I_SceneModule, string> = new Map();

  constructor(moduleName?: string) {
    super(moduleName);
    this.addModule('interaction', new InteractableModule())
      .addModule('visualFeedback', new VisualFeedbackModule());
  }

  async start(context: I_ModuleContext): Promise<void> {
    await this.forEachModule(async (m) => await m.start(context));
    this.initialized(context.sceneName);
  }
  public async forEachModule<T extends I_SceneModule>(callback: (m: T) => Promise<any>) {
    for (const module of Object.values(this.modules)) {
      if (module) await callback(module as T);
    }
  }

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
   * Register an object as interactable
   */
  public register(id: string, object: Object3D, config: I_InteractionEntityConfig): void {
    const interaction = this.getModule('interaction');
    if (interaction) {
      interaction.register(id, object, config);
    }
  }

  /**
   * Unregister an interactable object
   */
  public unregister(id: string): void {
    const interaction = this.getModule('interaction');
    if (interaction) {
      interaction.unregister(id);
    }
  }

  public async update(delta: number, ...args: any[]): Promise<void> {
    await this.forEachModule<I_UpdateableModule>(async (m) => await m.update(delta, ...args));
  }

  public async destroy(): Promise<void> {
    await this.forEachModule<I_UpdateableModule>(async (m) => await m.destroy());
  }

  /**
   * Enable/disable the interaction system
   */
  public setEnabled(enabled: boolean): void {
    const interaction = this.getModule('interaction');
    if (interaction) {
      interaction.setEnabled(enabled);
    }
  }
}
