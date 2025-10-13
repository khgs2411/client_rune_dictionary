import { useSettingsStore, type ApplicationSettings } from '@/stores/settings.store';
import { I_CharacterControls } from '@/composables/composables.types';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { CapsuleGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import SceneModule from '@/game/SceneModule';
import { I_ThemeColors } from '@/composables/useTheme';
import { GameConfig, useGameConfigStore } from '@/stores/gameConfig.store';

/**
 * Character Mesh Module
 * Handles the visual representation of the player character
 * Syncs with character controller state every frame
 */
export class CharacterModule extends SceneModule implements I_SceneModule {
  private mesh!: Group;
  private bodyMesh!: Mesh; // Reference to capsule body mesh
  private bodyMaterial!: MeshStandardMaterial;
  private coneMaterial!: MeshStandardMaterial;
  private settings: ApplicationSettings;
  private config: GameConfig;
  private characterController: I_CharacterControls;

  // Physics state
  private readonly characterPhysicsId = 'player-character';
  private verticalVelocity: number = 0;

  constructor(
    characterController: I_CharacterControls,
    moduleName: string = 'characterMesh',
  ) {
    super(moduleName);
    this.settings = useSettingsStore();
    this.config = useGameConfigStore();
    this.characterController = characterController;
  }

  protected async init(context: I_ModuleContext): Promise<void> {
    if (!context.services.physics.isReady()) {
      console.error('[CharacterModule] Physics service not ready!');
      return;
    }

    // Create visual mesh
    this.mesh = new Group();
    this.buildBody();
    this.buildForwardIndicator();

    // Initial position (matches physics body center)
    this.mesh.position.set(0, 5, 0);

    // Register character physics using simple API
    this.addPhysics(context);

    this.addToScene(context);

    console.log('✅ [CharacterModule] Initialized with physics');

  }

  private addPhysics(context: I_ModuleContext) {
    // Register kinematic character from body mesh (geometry) + initial position
    context.services.physics.registerKinematicFromMesh(
      this.characterPhysicsId,
      this.bodyMesh,
      [0, 1, 0], // Center at Y=1, bottom touches Y=0
      {
        enableAutostep: true,
        enableSnapToGround: true,
        maxStepHeight: 0.5,
        minStepWidth: 0.2,
        snapToGroundDistance: 0.5,
      }
    );
  }

  public update(delta: number): void {
    this.updateMovement(delta);
  }

  private updateMovement(delta: number) {
    const currentPos = this.context.services.physics.getPosition(this.characterPhysicsId);
    if (!currentPos) return;

    // Handle vertical velocity (gravity + jumping)
    this.handleJumping(delta);

    // Calculate desired horizontal movement (from character controller)
    const desiredMovement = {
      x: this.characterController.position.x.value - currentPos.x,
      y: this.verticalVelocity * delta,
      z: this.characterController.position.z.value - currentPos.z,
    };

    // Let PhysicsService compute collision-corrected movement
    const result = this.context.services.physics.moveKinematic(this.characterPhysicsId, desiredMovement);

    // Update visual mesh
    this.mesh.position.set(result.x, result.y, result.z);
    this.mesh.rotation.y = this.characterController.rotation.value;

    // Sync physics position back to character controller
    this.characterController.position.x.value = result.x;
    this.characterController.position.z.value = result.z;
    this.characterController.position.y.value = result.y;

    // Handle grounded state
    if (result.isGrounded) {
      // Reset vertical velocity when grounded
      this.verticalVelocity = 0;

      // Update ground level for jump system
      this.config.character.groundLevel = result.y;

      // Reset jump flag when landed
      if (this.characterController.isJumping.value) {
        this.characterController.isJumping.value = false;
      }
    }
  }

  private handleJumping(delta: number) {
    if (this.characterController.isJumping.value && this.verticalVelocity === 0) {
      // Use jump force from config
      this.verticalVelocity = this.config.character.jumpInitialVelocity;
    }

    // Apply gravity from config (negative because downward)
    this.verticalVelocity -= this.config.character.jumpGravity * delta;
  }

  public addToScene(context: I_ModuleContext) {
    context.scene.add(this.mesh);
    context.cleanupRegistry.register(this.mesh);
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
    this.bodyMesh = new Mesh(bodyGeometry, this.bodyMaterial);
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);
  }

  async destroy(context: I_ModuleContext): Promise<void> {
    // Remove physics body using simple API
    context.services.physics.remove(this.characterPhysicsId);

    // Lifecycle handles Three.js mesh cleanup
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
