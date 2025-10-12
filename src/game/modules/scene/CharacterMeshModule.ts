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
  private isCollidingHorizontal = false;
  private isCollidingVertical = false;

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

    this.addColission(context);

    this.addToScene(context);

    // Emit loading complete event
    super.start(context);

  }
  addColission(context: I_ModuleContext) {
    // Collision layers (bit mask):
    // Layer 1 (0b0001 = 1): Scene objects (walls, obstacles) - default
    // Layer 1 (0b0001 = 1): Character body & feet - same layer as scene objects so they collide

    // Body collider: Horizontal collision (XZ axes) - blocks walls and obstacles
    context.services.collision
      .register(`character-body-${this.id}`, this.mesh)
      .withSphere()
      .dynamic()
      .withBoundsOffset(new Vector3(0, 0.2, 0)) // Centered on character torso
      .withBoundsScale(0.8) // Slightly smaller than visual mesh
      .withHorizontalCollision() // Only collides on X and Z axes
      .withLayer(1) // Same layer as scene objects
      .withCallbacks({
        onCollisionEnter: (other) => {
          // Only react to scene objects, not character's own colliders
          if (other.id.startsWith('character-')) return;
          console.log('🔴 Body collision ENTER:', other.id);
          this.isCollidingHorizontal = true;
        },
        onCollisionExit: (other) => {
          if (other.id.startsWith('character-')) return;
          console.log('🟢 Body collision EXIT:', other.id);
          this.isCollidingHorizontal = false;
        },
      })
      .withWireframe(0x00ff00) // Green wireframe
      .build();

    // Feet collider: Vertical collision (Y axis) - detects ground and platforms
    context.services.collision
      .register(`character-feet-${this.id}`, this.mesh)
      .withSphere()
      .dynamic()
      .withBoundsOffset(new Vector3(0, -0.5, 0)) // Positioned at character's feet
      .withBoundsScale(0.5) // Small sphere at feet
      .withVerticalCollision() // Only collides on Y axis
      .withLayer(1) // Same layer as scene objects
      .withCallbacks({
        onCollisionEnter: (other) => {
          // Only react to scene objects, not character's own colliders
          if (other.id.startsWith('character-')) return;
          console.log('Feet hit ground:', other.id);
          this.isCollidingVertical = true;
        },
        onCollisionExit: (other) => {
          if (other.id.startsWith('character-')) return;
          console.log('Feet left ground:', other.id);
          this.isCollidingVertical = false;
        },
      })
      .withWireframe(0xff0000) // Red wireframe
      .build();
  }

  public update(): void {
    // Store last valid position when not colliding horizontally
    if (!this.isCollidingHorizontal) {
      this.lastValidPosition.x = this.characterController.position.x.value;
      this.lastValidPosition.z = this.characterController.position.z.value;
    } else {
      // Lock horizontal movement during horizontal collision (walls)
      this.characterController.position.x.value = this.lastValidPosition.x;
      this.characterController.position.z.value = this.lastValidPosition.z;
    }

    // Store last valid Y position when not colliding vertically
    if (!this.isCollidingVertical) {
      this.lastValidPosition.y = this.characterController.position.y.value;
    } else {
      // Lock vertical movement during vertical collision (ground/platforms)
      this.characterController.position.y.value = this.lastValidPosition.y;
    }

    // Sync mesh with controller state
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
