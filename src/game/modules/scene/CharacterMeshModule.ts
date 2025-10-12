import { type SettingsStore } from '@/stores/settings.store';
import { I_CharacterControls } from '@/composables/composables.types';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { CapsuleGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import SceneModule from '@/game/SceneModule';
import { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneObjectConfig } from '@/data/sceneObjectConfig.dto';

/**
 * Character Mesh Module
 * Handles the visual representation of the player character
 * Syncs with character controller state every frame
 */
export class CharacterMeshModule extends SceneModule implements I_SceneModule {
  private mesh!: Group;
  private bodyMaterial!: MeshStandardMaterial;
  private coneMaterial!: MeshStandardMaterial;
  private settings: SettingsStore;
  private characterController: I_CharacterControls;

  constructor(settings: SettingsStore, characterController: I_CharacterControls, moduleName: string = 'characterMesh') {
    super(moduleName);
    this.settings = settings;
    this.characterController = characterController;
  }

  async start(context: I_ModuleContext): Promise<void> {
    // Simulate async loading delay (for testing loading screen)
    this.mesh = new Group();

    // Body (capsule)
    this.buildBody();

    // Forward indicator (cone)
    this.buildForwardIndicator();

    // Initial position
    this.mesh.position.set(0, 1, 0);

    this.addColission(context);

    this.addToScene(context);

    // Emit loading complete event
    super.start(context);

  }
  addColission(context: I_ModuleContext) {
    const builder = context.services.collision.register(`character-mesh-${this.id}`, this.mesh);
    builder
      .withSphere()
      .dynamic()
      .withCallbacks({
        onCollisionEnter: (other) => console.log('Hit:', other.id),
        onCollisionExit: (other) => console.log('No longer hitting:', other.id),
        onCollisionStay: (other) => { /* Optional: Handle continuous collision */ },
      })
      .withWireframe()
      .build();
  }

  public addToScene(context: I_ModuleContext) {
    context.scene.add(this.mesh);
    context.lifecycle.register(this.mesh);
  }


  private buildForwardIndicator() {
    const coneGeometry = new ConeGeometry(0.2, 0.4, 8);
    this.coneMaterial = new MeshStandardMaterial({
      color: this.settings.theme.accent,
    });
    const cone = new Mesh(coneGeometry, this.coneMaterial);
    cone.position.set(0, 0, 0.7);
    cone.rotation.x = Math.PI / 2;
    cone.castShadow = true;
    this.mesh.add(cone);
  }

  private buildBody() {
    const bodyGeometry = new CapsuleGeometry(0.5, 1, 8, 16);
    this.bodyMaterial = new MeshStandardMaterial({
      color: this.settings.theme.primary,
    });
    const body = new Mesh(bodyGeometry, this.bodyMaterial);
    body.castShadow = true;
    this.mesh.add(body);
  }

  public update(delta: number): void {
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

  /**
   * Optional lifecycle hook: React to theme changes
   * Extracts primary (body) and accent (cone) colors from theme
   */
  onThemeChange(theme: I_ThemeColors): void {
    this.bodyMaterial.color.setHex(theme.primary);
    this.coneMaterial.color.setHex(theme.accent);
  }
}
