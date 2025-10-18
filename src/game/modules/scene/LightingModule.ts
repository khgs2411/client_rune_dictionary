import SceneModule from '@/game/modules/SceneModule';
import { I_SceneContext } from '@/game/common/scenes.types';
import { I_SceneModule } from '@/game/common/scenes.types';
import { Light, AmbientLight, DirectionalLight } from 'three';

/**
 * Lighting Module
 * Handles ambient and directional lights with shadow configuration
 */
export class LightingModule extends SceneModule implements I_SceneModule {
  private lights: Light[] = [];


  protected async init(context: I_SceneContext): Promise<void> {
    // Simulate async loading delay (for testing loading screen)
    // Ambient light
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    context.scene.add(ambientLight);
    context.cleanupRegistry.registerObject(ambientLight);
    this.lights.push(ambientLight);

    // Directional light with shadows
    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;

    // Fix shadow acne/artifacting
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.normalBias = 0.02;

    this.addToScene(context, directionalLight);
    this.lights.push(directionalLight);

  }

  public addToScene(context: I_SceneContext, directionalLight: DirectionalLight): void {
    context.scene.add(directionalLight);
    context.cleanupRegistry.registerObject(directionalLight);
  }

  async destroy(): Promise<void> {
    // Lifecycle handles cleanup
    this.lights = [];
  }
}
