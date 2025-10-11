import { type SettingsStore } from '@/stores/settings.store';
import { I_ModuleContext } from '@/scenes/scenes.types';
import { I_SceneModule } from '@/scenes/scenes.types';
import { GridHelper, InstancedMesh, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import GameModule from '../GameModule';

/**
 * Ground Module
 * Handles ground plane and grid helper
 */
export class GroundModule extends GameModule implements I_SceneModule {
  private groundMaterial!: MeshStandardMaterial;
  private settings: SettingsStore;

  constructor(settings: SettingsStore) {
    super('ground');
    this.settings = settings;
  }

  async start(context: I_ModuleContext): Promise<void> {
    // Simulate async loading delay (for testing loading screen)
      // Create ground plane
      const geometry = new PlaneGeometry(100, 100);
      this.groundMaterial = new MeshStandardMaterial({
        color: this.settings.theme.background,
      });

      const ground = new InstancedMesh(geometry, this.groundMaterial, 1);
      ground.count = 1;
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      context.scene.add(ground);
      context.lifecycle.register(ground);

      // Add grid helper
      const gridHelper = new GridHelper(50, 50);
      gridHelper.position.y = 0.01;
      context.scene.add(gridHelper);
      context.lifecycle.register(gridHelper);

      // Emit loading complete event
      this.initialized(context.sceneName)

  }

  update(delta: number): void {
    // Static ground, nothing to update
  }

  async destroy(): Promise<void> {
    // Lifecycle handles cleanup
  }

  // Public API for theme updates
  updateColors(color: number): void {
    this.groundMaterial.color.setHex(color);
  }
}
