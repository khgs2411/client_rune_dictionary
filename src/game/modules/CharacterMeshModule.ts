import { type SettingsStore } from '@/stores/settings.store';
import { I_CharacterControls } from '@/composables/composables.types';
import { I_ModuleContext, I_ThemedSceneModule } from '@/scenes/scenes.types';
import { CapsuleGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import BaseModule from './BaseModule';

/**
 * Character Mesh Module
 * Handles the visual representation of the player character
 * Syncs with character controller state every frame
 */
export class CharacterMeshModule extends BaseModule implements I_ThemedSceneModule {
  private mesh!: Group;
  private bodyMaterial!: MeshStandardMaterial;
  private coneMaterial!: MeshStandardMaterial;
  private settings: SettingsStore;
  private characterController: I_CharacterControls;

  constructor(settings: SettingsStore, characterController: I_CharacterControls) {
    super(/* moduleName */ 'characterMesh');
    this.settings = settings;
    this.characterController = characterController;
  }

  async start(context: I_ModuleContext): Promise<void> {
    // Simulate async loading delay (for testing loading screen)
      this.mesh = new Group();

      // Body (capsule)
      const bodyGeometry = new CapsuleGeometry(0.5, 1, 8, 16);
      this.bodyMaterial = new MeshStandardMaterial({
        color: this.settings.theme.primary,
      });
      const body = new Mesh(bodyGeometry, this.bodyMaterial);
      body.castShadow = true;
      this.mesh.add(body);

      // Forward indicator (cone)
      const coneGeometry = new ConeGeometry(0.2, 0.4, 8);
      this.coneMaterial = new MeshStandardMaterial({
        color: this.settings.theme.accent,
      });
      const cone = new Mesh(coneGeometry, this.coneMaterial);
      cone.position.set(0, 0, 0.7);
      cone.rotation.x = Math.PI / 2;
      cone.castShadow = true;
      this.mesh.add(cone);

      // Initial position
      this.mesh.position.set(0, 1, 0);

      context.scene.add(this.mesh);
      context.lifecycle.register(this.mesh);

      // Emit loading complete event
      this.initialized(context.sceneName)

  }

  update(delta: number): void {
    // Sync mesh with controller state
    this.mesh.position.set(
      this.characterController.position.x.value,
      this.characterController.position.y.value + 1, // Offset for capsule center
      this.characterController.position.z.value,
    );
    this.mesh.rotation.y = this.characterController.rotation.value;
  }

  async destroy(): Promise<void> {
    // Lifecycle handles cleanup
  }

  // Public API for theme updates
  updateColors(bodyColor: number, coneColor: number): void {
    this.bodyMaterial.color.setHex(bodyColor);
    this.coneMaterial.color.setHex(coneColor);
  }
}
