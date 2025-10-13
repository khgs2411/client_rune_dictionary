import SceneModule from '@/game/SceneModule';
import { I_ModuleContext } from '@/scenes/scenes.types';
import { I_SceneModule } from '@/scenes/scenes.types';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

/**
 * Debug Module
 * Temporary debug visualization (red cube)
 */
export class DebugModule extends SceneModule implements I_SceneModule {
  constructor() {
    super('debug');
  }
  protected async init(context: I_ModuleContext): Promise<void> {
    // Simulate async loading delay (for testing loading screen)
    // Bright red cube for debugging camera view
    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    const cube = new Mesh(geometry, material);
    cube.position.set(10, 1, -8); // Moved to avoid z-fighting with scene objects
    this.addToScene(context, cube);
  }

  public addToScene(context: I_ModuleContext, cube: Mesh) {
    context.scene.add(cube);
    context.cleanupRegistry.register(cube);
  }

  public update(delta: number): void {
    // Static debug cube, nothing to update
  }

  public destroy(): Promise<void> {
    // Lifecycle handles cleanup
    return Promise.resolve();
  }
}
