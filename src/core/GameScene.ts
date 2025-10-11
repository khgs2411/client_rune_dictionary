import { SceneModule } from '@/common/types';
import { SceneLifecycle } from '@/core/SceneLifecycle';

export abstract class GameScene {
  protected modules: SceneModule[] = [];
  protected lifecycle: SceneLifecycle = new SceneLifecycle();

  abstract start(): void;
  abstract update(...args: any): void;
  abstract destroy(): void;
}
