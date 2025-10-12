import { type SettingsStore } from '@/stores/settings.store';
import { I_CharacterControls } from '@/composables/composables.types';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { CapsuleGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
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
  private lastValidPosition: Vector3 = new Vector3(0, 0, 0);
  private previousYPosition = 0; // Track Y position from previous frame for velocity calculation
  private isCollidingHorizontal = false;
  private isCollidingVertical = false;
  private collisionCount = 0; // Track how many frames we've been stuck

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

    // Initialize lastValidPosition to current controller position
    this.lastValidPosition.set(
      this.characterController.position.x.value,
      this.characterController.position.y.value,
      this.characterController.position.z.value
    );
    this.previousYPosition = this.characterController.position.y.value;

    this.addColission(context);

    this.addToScene(context);

    // Emit loading complete event
    super.start(context);

  }
  addColission(context: I_ModuleContext) {
  }

  public update(): void {
    // Calculate Y velocity using previous frame's position
    const currentY = this.characterController.position.y.value;
    const yVelocity = currentY - this.previousYPosition;

    // Handle collision response BEFORE updating mesh
    if (this.isCollidingHorizontal) {
      // Full position lock - no sinking
      this.characterController.position.x.value = this.lastValidPosition.x;
      this.characterController.position.z.value = this.lastValidPosition.z;
      this.collisionCount++;
    } else {
      // Store valid position when not colliding
      this.lastValidPosition.x = this.characterController.position.x.value;
      this.lastValidPosition.z = this.characterController.position.z.value;
      this.collisionCount = 0;
    }

    // Vertical collision: Only block downward movement (falling through floor)
    // Allow upward movement (jumping) even when standing on ground
    if (this.isCollidingVertical && yVelocity <= 0) {
      // Only lock Y position when moving down or stationary (prevents falling through)
      this.characterController.position.y.value = this.lastValidPosition.y;
    } else {
      // Update last valid position when moving up or not colliding
      this.lastValidPosition.y = this.characterController.position.y.value;
    }

    // Store current Y position for next frame's velocity calculation
    this.previousYPosition = this.characterController.position.y.value;

    // Sync mesh with controller state AFTER collision response
    this.mesh.position.set(
      this.characterController.position.x.value,
      this.characterController.position.y.value + 1, // Offset for capsule center
      this.characterController.position.z.value,
    );
    this.mesh.rotation.y = this.characterController.rotation.value;
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
