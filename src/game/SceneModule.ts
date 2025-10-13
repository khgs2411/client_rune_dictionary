import { I_ModuleContext } from '@/game/common/scenes.types';
import { Lib, useRxjs } from 'topsyde-utils';


export default abstract class SceneModule {
  public name: string = this.constructor.name;
  protected rxjs = useRxjs('module:loading', {}, { static_instance: true });

  protected id: string; // Will be set to module name for persistence
  protected context!: I_ModuleContext;

  constructor(moduleName?: string, private autoInitialize: boolean = true) {
    if (moduleName) {
      this.name = moduleName;
    }
    // Use module name as ID for deterministic object IDs (important for save/load)
    this.id = this.name;
  }

  /**
 * Initializes the module with the provided context.
 * This method must be implemented by subclasses to perform any setup or initialization logic required for the module.
 * It can be asynchronous if needed.
 *
 * @param context - The context object containing information and dependencies required by the module.
 * @returns A void or a Promise that resolves when initialization is complete.
 */
  protected abstract init(context: I_ModuleContext): void | Promise<void>;

  /**
   * Initialize the module
   * @param context Module Context
   */
  public async start(context: I_ModuleContext): Promise<void> {
    this.context = context;
    await this.init(context);
    // Emit loading complete event
    if (this.autoInitialize) this.initialized(context.sceneName);
  }

  /**
   * Set module name (called by GameScene.addModule)
   */
  public setName(name: string): void {
    this.name = name;
    this.id = name; // Keep ID in sync with name for persistence
  }


  protected initialized(sceneName: string) {
    setTimeout(() => {
      this.rxjs.$next('loaded', {
        moduleName: this.name,
        sceneName: sceneName,
      });
    }, Math.random() * 333); // Simulated delay
  }
}
