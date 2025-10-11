import { SceneModule, SceneLifecycle } from '../scenes/PlaygroundScene';

export abstract class GameScene {
  protected modules: SceneModule[] = [];
  protected lifecycle: SceneLifecycle = new SceneLifecycle();

  abstract start(): void;
  abstract update(...args: any): void;
  abstract destroy(): void;
}
