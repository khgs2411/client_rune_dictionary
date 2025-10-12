import { I_ModuleContext } from '@/scenes/scenes.types';
import { Lib, useRxjs } from 'topsyde-utils';

export default abstract class SceneModule {
  public name: string = this.constructor.name;
  protected rxjs = useRxjs('module:loading');

  protected id: string = Lib.UUID();
  protected context!: I_ModuleContext;

  constructor(moduleName?: string, private autoInitialize: boolean = true) {
    if (moduleName) {
      this.name = moduleName;
    }
  }

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
  }

  protected abstract init(context: I_ModuleContext): void | Promise<void>;

  protected initialized(sceneName: string) {
    setTimeout(() => {
      this.rxjs.$next('loaded', {
        moduleName: this.name,
        sceneName: sceneName,
      });
    }, Math.random() * 333); // Simulated delay
  }
}
