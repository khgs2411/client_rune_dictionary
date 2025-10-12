import { I_ModuleContext } from '@/scenes/scenes.types';
import { Lib, useRxjs } from 'topsyde-utils';

export default class SceneModule {
  public name: string = this.constructor.name;
  protected rxjs = useRxjs('module:loading');

  protected id: string = Lib.UUID();

  constructor(moduleName?: string) {
    if (moduleName) {
      this.name = moduleName;
    }
  }

  public async start(context: I_ModuleContext): Promise<void> {
    // Emit loading complete event
    this.initialized(context.sceneName);
  }

  /**
   * Set module name (called by GameScene.addModule)
   */
  public setName(name: string): void {
    this.name = name;
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
