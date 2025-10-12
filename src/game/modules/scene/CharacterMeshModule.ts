import { type SettingsStore } from '@/stores/settings.store';
import { I_CharacterControls } from '@/composables/composables.types';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { CapsuleGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import SceneModule from '@/game/SceneModule';
import { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneObjectConfig } from '@/data/sceneObjectConfig.dto';
import type * as RAPIER_TYPE from '@dimforge/rapier3d';

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

  // Rapier physics components
  private rigidBody!: RAPIER_TYPE.RigidBody;
  private collider!: RAPIER_TYPE.Collider;
  private characterControllerRapier!: RAPIER_TYPE.KinematicCharacterController;
  private world!: RAPIER_TYPE.World;
  private RAPIER!: typeof RAPIER_TYPE;

  constructor(
    settings: SettingsStore,
    characterController: I_CharacterControls,
    moduleName: string = 'characterMesh',
  ) {
    super(moduleName);
    this.settings = settings;
    this.characterController = characterController;
  }

  async start(context: I_ModuleContext): Promise<void> {
    // Get physics world and RAPIER module from service
    if (!context.services.physics.isReady()) {
      console.error('[CharacterMeshModule] Physics service not ready!');
      return;
    }
    this.world = context.services.physics.getWorld();
    this.RAPIER = context.services.physics.getRapier();

    // Create visual mesh
    this.mesh = new Group();
    this.buildBody();
    this.buildForwardIndicator();

    // Initial position
    this.mesh.position.set(0, 1, 0);

    // Create Rapier physics components
    this.createPhysicsBody();

    this.addToScene(context);

    // Emit loading complete event
    super.start(context);
  }
  /**
   * Create Rapier physics body and character controller
   */
  private createPhysicsBody(): void {
    // Create kinematic rigid body (controlled by character controller, not physics forces)
    const rigidBodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased();
    rigidBodyDesc.setTranslation(0, 1, 0);
    this.rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Create capsule collider (matches visual capsule)
    const colliderDesc = this.RAPIER.ColliderDesc.capsule(0.5, 0.5); // Half-height 0.5, radius 0.5
    this.collider = this.world.createCollider(colliderDesc, this.rigidBody);

    // Create Rapier character controller
    this.characterControllerRapier = this.world.createCharacterController(0.01);

    // Configure character controller properties
    this.characterControllerRapier.enableAutostep(0.5, 0.2, true); // Max step height, min width, include dynamic bodies
    this.characterControllerRapier.enableSnapToGround(0.5); // Snap distance
    this.characterControllerRapier.setApplyImpulsesToDynamicBodies(true);

    console.log('✅ [CharacterMeshModule] Rapier physics initialized');
  }

  public update(): void {
    // Get desired movement from character controller
    const currentPos = this.rigidBody.translation();
    const desiredMovement = new this.RAPIER.Vector3(
      this.characterController.position.x.value - currentPos.x,
      this.characterController.position.y.value - currentPos.y,
      this.characterController.position.z.value - currentPos.z,
    );

    // Compute collision-corrected movement using Rapier
    this.characterControllerRapier.computeColliderMovement(this.collider, desiredMovement);

    // Get the corrected movement (Rapier blocks collisions automatically)
    const correctedMovement = this.characterControllerRapier.computedMovement();

    // Apply corrected movement to rigid body
    const newPos = {
      x: currentPos.x + correctedMovement.x,
      y: currentPos.y + correctedMovement.y,
      z: currentPos.z + correctedMovement.z,
    };
    this.rigidBody.setNextKinematicTranslation(newPos);

    // Update visual mesh to match physics body
    this.mesh.position.set(newPos.x, newPos.y, newPos.z);
    this.mesh.rotation.y = this.characterController.rotation.value;

    // Optionally: Update character controller to match corrected position
    // (This ensures controller and physics stay in sync)
    this.characterController.position.x.value = newPos.x;
    this.characterController.position.y.value = newPos.y;
    this.characterController.position.z.value = newPos.z;
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
    // Remove Rapier physics components
    if (this.world && this.rigidBody) {
      this.world.removeRigidBody(this.rigidBody);
    }

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
