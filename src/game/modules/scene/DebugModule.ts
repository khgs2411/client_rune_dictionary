import SceneModule from '@/game/modules/SceneModule';
import { I_SceneContext } from '@/game/common/scenes.types';
import { I_SceneModule } from '@/game/common/scenes.types';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

/**
 * Debug Module
 * Temporary debug visualization (red cube)
 */
export class DebugModule extends SceneModule implements I_SceneModule {
  constructor() {
    super('debug');
  }
  protected async init(context: I_SceneContext): Promise<void> {
    // Simulate async loading delay (for testing loading screen)
    // Bright red cube for debugging camera view
    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    const cube = new Mesh(geometry, material);
    cube.position.set(10, 1, -8); // Moved to avoid z-fighting with scene objects
    this.addToScene(context, cube);
  }

  public addToScene(context: I_SceneContext, cube: Mesh) {
    context.scene.add(cube);
    context.cleanupRegistry.registerObject(cube);
  }

  public update(delta: number): void {
    // Static debug cube, nothing to update
  }

  public destroy(): Promise<void> {
    // Lifecycle handles cleanup
    return Promise.resolve();
  }
}
