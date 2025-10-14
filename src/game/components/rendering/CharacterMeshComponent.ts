import { GameComponent, ComponentPriority } from '@/game/GameComponent';
import type { I_GameContext } from '@/game/common/gameobject.types';
import { CapsuleGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { useSettingsStore } from '@/stores/settings.store';
import type { I_ThemeColors } from '@/composables/useTheme';

export interface I_CharacterMeshConfig {
  bodyRadius?: number; // Default: 0.5
  bodyHeight?: number; // Default: 1
  coneRadius?: number; // Default: 0.2
  coneHeight?: number; // Default: 0.4
  coneOffset?: number; // Default: 0.7 (Z position)
  initialPosition?: [number, number, number]; // Starting position (optional)
}

/**
 * CharacterMeshComponent - Creates two-part character mesh (body + forward indicator)
 *
 * This component creates a Group containing:
 * - Body: Capsule mesh with primary theme color
 * - Forward indicator: Cone mesh with accent theme color
 *
 * The component responds to theme changes via onThemeChange() lifecycle hook.
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
 * Priority: RENDERING (100) - Creates visual representation
 */
export class CharacterMeshComponent extends GameComponent {
  public readonly priority = ComponentPriority.RENDERING;

  public group!: Group; // Container for body + cone
  public bodyMesh!: Mesh; // Reference for physics registration
  private bodyMaterial!: MeshStandardMaterial;
  private coneMaterial!: MeshStandardMaterial;
  private config: I_CharacterMeshConfig;
  private settings = useSettingsStore();

  constructor(config: I_CharacterMeshConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    // Create group container
    this.group = new Group();

    // Set initial position if provided
    if (this.config.initialPosition) {
      this.group.position.set(
        this.config.initialPosition[0],
        this.config.initialPosition[1],
        this.config.initialPosition[2],
      );
    }

    // Build body (capsule)
    this.buildBody();

    // Build forward indicator (cone)
    this.buildForwardIndicator();

    // Add to scene
    context.scene.add(this.group);

    // Register for cleanup
    context.cleanupRegistry.registerObject(this.group);
  }

  private buildBody(): void {
    const bodyRadius = this.config.bodyRadius ?? 0.5;
    const bodyHeight = this.config.bodyHeight ?? 1;

    const bodyGeometry = new CapsuleGeometry(bodyRadius, bodyHeight, 8, 16);
    this.bodyMaterial = new MeshStandardMaterial({
      color: this.settings.theme.primary,
    });

    this.bodyMesh = new Mesh(bodyGeometry, this.bodyMaterial);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;

    this.group.add(this.bodyMesh);
  }

  private buildForwardIndicator(): void {
    const coneRadius = this.config.coneRadius ?? 0.2;
    const coneHeight = this.config.coneHeight ?? 0.4;
    const coneOffset = this.config.coneOffset ?? 0.7;

    const coneGeometry = new ConeGeometry(coneRadius, coneHeight, 8);
    this.coneMaterial = new MeshStandardMaterial({
      color: this.settings.theme.accent,
    });

    const cone = new Mesh(coneGeometry, this.coneMaterial);
    cone.position.set(0, 0, coneOffset);
    cone.rotation.x = Math.PI / 2; // Point forward
    cone.castShadow = true;

    this.group.add(cone);
  }

  /**
   * Update mesh position/rotation
   * Called by MovementComponent after physics updates
   */
  public updateTransform(x: number, y: number, z: number, rotationY: number): void {
    this.group.position.set(x, y, z);
    this.group.rotation.y = rotationY;
  }

  /**
   * Get current position (useful for other components)
   */
  public getPosition() {
    return this.group.position.clone();
  }

  /**
   * Theme change lifecycle hook
   * Updates body and cone materials to match new theme
   */
  public onThemeChange(theme: I_ThemeColors): void {
    this.bodyMaterial.color.setHex(theme.primary);
    this.coneMaterial.color.setHex(theme.accent);
  }

  destroy(): void {
    // Cleanup handled by cleanupRegistry
  }
}
