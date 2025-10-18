import { MeshComponent } from './MeshComponent';
import { CapsuleGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { TransformComponent } from './TransformComponent';
import { useSettingsStore } from '@/stores/settings.store';
import type { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneContext } from '@/game/common/scenes.types';

export interface I_CharacterMeshConfig {
  bodyRadius?: number; // Default: 0.5
  bodyHeight?: number; // Default: 1
  coneRadius?: number; // Default: 0.2
  coneHeight?: number; // Default: 0.4
  coneOffset?: number; // Default: 0.7 (Z position)
  initialPosition?: [number, number, number]; // Starting position (optional)
  bodyColor?: number; // Body color (hex). If not provided, uses theme primary
  coneColor?: number; // Cone color (hex). If not provided, uses theme accent
}

/**
 * CharacterMeshComponent - Creates two-part character mesh (body + forward indicator)
 *
 * Extends MeshComponent to provide character-specific visual representation:
 * - Body: Capsule mesh with primary theme color
 * - Forward indicator: Cone mesh with accent theme color
 * - Overrides getMesh() to return bodyMesh for physics registration
 *
 * The component reads from TransformComponent each frame to update visual position/rotation.
 * This ensures TransformComponent is the single source of truth for transforms.
 *
 * Dependencies:
 * - Requires TransformComponent (reads position/rotation from it)
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new CharacterMeshComponent({
 *   bodyRadius: 0.5,
 *   bodyHeight: 1,
 *   coneRadius: 0.2,
 *   coneHeight: 0.4,
 * }));
 * ```
 *
 * Priority: RENDERING (100) - Creates visual representation, reads from transform
 */
export class CharacterMeshComponent extends MeshComponent {

  public group!: Group; // Container for body + cone
  public bodyMesh!: Mesh; // Reference for physics registration
  private bodyMaterial!: MeshStandardMaterial;
  private coneMaterial!: MeshStandardMaterial;
  private characterConfig: I_CharacterMeshConfig;
  private settings = useSettingsStore();

  constructor(config: I_CharacterMeshConfig = {}) {
    super({}); // No MeshComponent config needed
    this.characterConfig = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    // Require TransformComponent (we read from it)
    const transform = this.requireComponent(TransformComponent);

    // Create group container
    this.group = new Group();

    // Set initial position from TransformComponent
    this.group.position.copy(transform.position);
    this.group.rotation.copy(transform.rotation);

    // Build body (capsule)
    this.buildBody();

    // Build forward indicator (cone)
    this.buildForwardIndicator();

    // Add to scene
    context.scene.add(this.group);

    // Register for automatic cleanup (handles scene removal + disposal)
    this.cleanup.registerObject(this.group);
  }

  update(delta: number): void {
    // Read from TransformComponent and apply to visual mesh
    const transform = this.getComponent(TransformComponent);
    if (transform) {
      this.group.position.copy(transform.position);
      this.group.rotation.copy(transform.rotation);
    }
  }

  private buildBody(): void {
    const bodyRadius = this.characterConfig.bodyRadius ?? 0.5;
    const bodyHeight = this.characterConfig.bodyHeight ?? 1;

    const bodyGeometry = new CapsuleGeometry(bodyRadius, bodyHeight, 8, 16);

    // Use provided color or fall back to theme primary
    const bodyColor = this.characterConfig.bodyColor ?? this.settings.theme.primary;
    this.bodyMaterial = new MeshStandardMaterial({
      color: bodyColor,
    });

    this.bodyMesh = new Mesh(bodyGeometry, this.bodyMaterial);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;

    this.group.add(this.bodyMesh);
  }

  private buildForwardIndicator(): void {
    const coneRadius = this.characterConfig.coneRadius ?? 0.2;
    const coneHeight = this.characterConfig.coneHeight ?? 0.4;
    const coneOffset = this.characterConfig.coneOffset ?? 0.7;

    const coneGeometry = new ConeGeometry(coneRadius, coneHeight, 8);

    // Use provided color or fall back to theme accent
    const coneColor = this.characterConfig.coneColor ?? this.settings.theme.accent;
    this.coneMaterial = new MeshStandardMaterial({
      color: coneColor,
    });

    const cone = new Mesh(coneGeometry, this.coneMaterial);
    cone.position.set(0, 0, coneOffset);
    cone.rotation.x = Math.PI / 2; // Point forward
    cone.castShadow = true;

    this.group.add(cone);
  }


  /**
   * Theme change lifecycle hook
   * Updates body and cone materials to match new theme
   */
  public onThemeChange(theme: I_ThemeColors): void {
    if (!this.characterConfig.bodyColor) this.bodyMaterial.color.setHex(theme.primary);
    if (!this.characterConfig.coneColor) this.coneMaterial.color.setHex(theme.accent);
  }

  /**
   * Override to return bodyMesh for physics registration
   */
  public getMesh(): Mesh {
    return this.bodyMesh;
  }

  // No destroy() needed! CleanupRegistry handles it automatically
  // The base GameComponent.destroy() will call this.cleanup.cleanup(scene)
  // which removes from scene and recursively disposes all geometries/materials
}
