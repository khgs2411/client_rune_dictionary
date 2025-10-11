import { I_ModuleContext } from '@/scenes/scenes.types';
import { I_SceneModule } from '@/scenes/scenes.types';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

/**
 * Debug Module
 * Temporary debug visualization (red cube)
 */
export class DebugModule implements I_SceneModule {
  start(context: I_ModuleContext): void {
    // Bright red cube for debugging camera view
    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    const cube = new Mesh(geometry, material);
    cube.position.set(10, 1, 0); // Moved to avoid z-fighting with scene objects
    context.scene.add(cube);
    context.lifecycle.register(cube);
  }

  update(delta: number): void {
    // Static debug cube, nothing to update
  }

  destroy(): void {
    // Lifecycle handles cleanup
  }
}
