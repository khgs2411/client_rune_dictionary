import { I_ModuleContext } from '@/scenes/scenes.types';
import { I_SceneModule } from '@/scenes/scenes.types';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import BaseModule from './BaseModule';

/**
 * Debug Module
 * Temporary debug visualization (red cube)
 */
export class DebugModule extends BaseModule implements I_SceneModule {

  constructor() {
    super('debug');
  }
  async start(context: I_ModuleContext): Promise<void> {
    // Simulate async loading delay (for testing loading screen)
    // Bright red cube for debugging camera view
    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    const cube = new Mesh(geometry, material);
    cube.position.set(10, 1, 0); // Moved to avoid z-fighting with scene objects
    context.scene.add(cube);
    context.lifecycle.register(cube);

    // Emit loading complete event
    this.initialized(context.sceneName)

  }

  update(delta: number): void {
    // Static debug cube, nothing to update
  }

  destroy(): Promise<void> {
    // Lifecycle handles cleanup
    return Promise.resolve();
  }
}
