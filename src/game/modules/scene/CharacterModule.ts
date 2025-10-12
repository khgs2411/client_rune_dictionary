import { useSettingsStore, type ApplicationSettings } from '@/stores/settings.store';
import { I_CharacterControls } from '@/composables/composables.types';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { CapsuleGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import SceneModule from '@/game/SceneModule';
import { I_ThemeColors } from '@/composables/useTheme';
import type * as RAPIER_TYPE from '@dimforge/rapier3d';
import { GameConfig, useGameConfigStore } from '@/stores/gameConfig.store';

/**
 * Character Mesh Module
 * Handles the visual representation of the player character
 * Syncs with character controller state every frame
 */
export class CharacterModule extends SceneModule implements I_SceneModule {
  private mesh!: Group;
  private bodyMaterial!: MeshStandardMaterial;
  private coneMaterial!: MeshStandardMaterial;
  private settings: ApplicationSettings;
  private config: GameConfig;
  private characterController: I_CharacterControls;

  // Rapier physics components
  private rigidBody!: RAPIER_TYPE.RigidBody;
  private collider!: RAPIER_TYPE.Collider;
  private physicsController!: RAPIER_TYPE.KinematicCharacterController;
  private context!: I_ModuleContext;
  private rapier!: typeof RAPIER_TYPE;



  // Vertical velocity for gravity (Rapier handles this)
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

  async start(context: I_ModuleContext): Promise<void> {

    this.context = context;
    this.rapier = this.context.services.physics.getRapier()

    if (!context.services.physics.isReady()) {
      console.error('[CharacterModule] Physics service not ready!');
      return;
    }


    // Create visual mesh
    this.mesh = new Group();
    this.buildBody();
    this.buildForwardIndicator();

    // Initial position (matches physics body center)
    this.mesh.position.set(0, 1, 0);

    // Create Rapier physics components
    this.createPhysicsBody(context);

    this.addGridHelper(context);

    // Emit loading complete event
    super.start(context);
  }
  /**
   * Create Rapier physics body and character controller
   */
  private createPhysicsBody(context: I_ModuleContext): void {
    // Visual capsule: CapsuleGeometry(radius=0.5, cylinderHeight=1)
    // Total visual height = cylinderHeight + 2*radius = 1 + 2*0.5 = 2 units
    // Center at geometric center, extends from -1 to +1 on local Y axis

    // Rapier capsule: capsule(halfHeight, radius)
    // halfHeight is half of the cylinder part (not including hemispheres)
    // Total physics height = 2*halfHeight + 2*radius = 2*0.5 + 2*0.5 = 2 units
    // Center at geometric center, extends from -1 to +1 on local Y axis

    // Position at Y=1 so center is at Y=1, meaning bottom is at Y=0 (ground level)

    const world = context.services.physics.getWorld();
    const RAPIER = context.services.physics.getRapier();
    const rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
    rigidBodyDesc.setTranslation(0, 1, 0);
    this.rigidBody = world.createRigidBody(rigidBodyDesc);

    // Create capsule collider matching visual geometry
    const colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.5); // halfHeight=0.5, radius=0.5
    this.collider = world.createCollider(colliderDesc, this.rigidBody);

    // Create Rapier character controller
    this.physicsController = world.createCharacterController(0.01);

    // Configure character controller properties
    this.physicsController.enableAutostep(0.5, 0.2, true); // Max step height, min width, include dynamic bodies
    this.physicsController.enableSnapToGround(0.5); // Snap distance
    this.physicsController.setApplyImpulsesToDynamicBodies(true);

    console.log('✅ [CharacterModule] Rapier physics initialized');
  }

  public update(delta: number): void {
    this.updateMovement(delta);
  }

  private updateMovement(delta: number) {
    const currentPos = this.rigidBody.translation();

    // Handle vertical velocity (gravity + jumping)
    // Check if character wants to jump
    this.handleJumping(delta);

    // Calculate desired position change
    const desiredMovement = new this.rapier.Vector3(
      this.characterController.position.x.value - currentPos.x,
      this.verticalVelocity * delta,
      this.characterController.position.z.value - currentPos.z
    );

    // Let Rapier compute collision-corrected movement
    this.physicsController.computeColliderMovement(this.collider, desiredMovement);
    const correctedMovement = this.physicsController.computedMovement();

    // Apply physics-corrected position
    const newPos = {
      x: currentPos.x + correctedMovement.x,
      y: currentPos.y + correctedMovement.y,
      z: currentPos.z + correctedMovement.z,
    };

    this.rigidBody.setNextKinematicTranslation(newPos);

    // Check if grounded
    const isGrounded = this.physicsController.computedGrounded();

    // Update visual mesh
    this.mesh.position.set(newPos.x, newPos.y, newPos.z);
    this.mesh.rotation.y = this.characterController.rotation.value;

    // Sync physics position back to character controller
    this.characterController.position.x.value = newPos.x;
    this.characterController.position.z.value = newPos.z;
    this.characterController.position.y.value = newPos.y;

    // Handle grounded state
    if (isGrounded) {
      // Reset vertical velocity when grounded
      this.verticalVelocity = 0;

      // Update ground level for jump system
      this.config.character.groundLevel = newPos.y;

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

  public addGridHelper(context: I_ModuleContext) {
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
    if (this.context.services.physics.getWorld() && this.rigidBody) {
      this.context.services.physics.getWorld().removeRigidBody(this.rigidBody);
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
