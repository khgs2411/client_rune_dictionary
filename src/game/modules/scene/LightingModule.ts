import { I_SceneContext, I_SceneModule } from '@/game/common/scenes.types';
import SceneModule from '@/game/modules/SceneModule';
import { DirectionalLight, HemisphereLight, Light } from 'three';

/**
 * Lighting Module
 * Handles ambient and directional lights with shadow configuration
 */
export class LightingModule extends SceneModule implements I_SceneModule {
  private lights: Light[] = [];

  protected async init(context: I_SceneContext): Promise<void> {
    // Cinematic Lighting Setup (Genshin/Fantasy Style)

    // Hemisphere Light: Simulates sky/ground ambient lighting
    // Sky: Light Blue (0xb1e1ff), Ground: Grass Green (0xb97a20 - warm earth tone)
    const hemisphereLight = new HemisphereLight(0xb1e1ff, 0xb97a20, 0.6);
    context.scene.add(hemisphereLight);
    context.cleanupRegistry.registerObject(hemisphereLight);
    this.lights.push(hemisphereLight);

    // Directional Light: Warm Sunlight
    const directionalLight = new DirectionalLight(0xffdfba, 1.2); // Warm golden sunlight
    directionalLight.position.set(10, 20, 10); // Higher angle for better shadows
    directionalLight.castShadow = true;

    // High quality shadows
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100; // Extended range
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;

    // Soften shadows for low-poly look
    directionalLight.shadow.bias = -0.0005;
    directionalLight.shadow.normalBias = 0.02;
    directionalLight.shadow.radius = 2; // Soft edges

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
