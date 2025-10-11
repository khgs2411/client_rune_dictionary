import { I_ModuleContext } from '@/scenes/scenes.types';
import { I_SceneModule } from '@/scenes/scenes.types';
import { Light, AmbientLight, DirectionalLight } from 'three';
import GameModule from '../GameModule';

// ============================================================================
// MODULES
// ============================================================================
/**
 * Lighting Module
 * Handles ambient and directional lights with shadow configuration
 */
export class LightingModule extends GameModule implements I_SceneModule {
  private lights: Light[] = [];

  constructor(){
    super('lighting');
  }


  async start(context: I_ModuleContext): Promise<void> {
    // Simulate async loading delay (for testing loading screen)
      // Ambient light
      const ambientLight = new AmbientLight(0xffffff, 0.5);
      context.scene.add(ambientLight);
      context.lifecycle.register(ambientLight);
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

      context.scene.add(directionalLight);
      context.lifecycle.register(directionalLight);
      this.lights.push(directionalLight);

      // Emit loading complete event
      this.initialized(context.sceneName)

  }

  update(delta: number): void {
    // Optional: animate lights if needed
  }

  async destroy(): Promise<void> {
    // Lifecycle handles cleanup
    this.lights = [];
  }
}
