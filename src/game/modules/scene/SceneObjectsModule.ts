import { RGBColor } from '@/common/types';
import { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneObjectConfig } from '@/data/sceneObjectConfig.dto';
import SceneModule from '@/game/SceneModule';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { useGameConfig } from '@/stores/gameConfig.store';
import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry
} from 'three';

/**
 * Scene Objects Module (Regular Meshes)
 * Manages scene objects as individual Mesh instances (NOT instanced rendering)
 *
 * Use this when:
 * - Each object is unique (different positions, scales, rotations)
 * - Objects need per-object interaction (some interactive, some not)
 * - Objects need individual updates/animations
 * - You have a small number of objects (< 100)
 *
 * For many identical objects, use SceneInstancedObjectsModule instead.
 *
 * Refactored to:
 * - Remove I_InteractableModule interface (no more boilerplate!)
 * - Use ctx.services.interaction directly
 * - Use onThemeChange() optional hook instead of I_ThemedModule interface
 */
export class SceneObjectsModule extends SceneModule implements I_SceneModule {
  private objectConfigs: I_SceneObjectConfig[];
  private meshes: Mesh[] = [];
  private themedMaterials: MeshStandardMaterial[] = []; // Materials that respond to theme changes

  constructor(
    objectConfigs: I_SceneObjectConfig[],
    moduleName?: string,
  ) {
    super(moduleName);
    this.objectConfigs = objectConfigs;
  }

  async start(context: I_ModuleContext): Promise<void> {
    const gameConfig = useGameConfig();

    this.objectConfigs.forEach((config, index) => {
      // Create geometry and material
      const geometry = this.createGeometry(config.geometry);
      const material = this.createMaterial(config, context);

      // Track themed materials for onThemeChange
      if (config.material.useTheme) {
        this.themedMaterials.push(material);
      }

      // Create individual mesh
      const mesh = new Mesh(geometry, material);
      mesh.name = `scene-object-${index}`;
      mesh.castShadow = config.castShadow ?? true;
      mesh.receiveShadow = config.receiveShadow ?? true;

      // Set transform
      mesh.position.set(...config.position);
      if (config.rotation) {
        const euler = new Euler(...config.rotation);
        mesh.rotation.copy(euler);
      }
      if (config.scale) {
        mesh.scale.set(...config.scale);
      }

      // Add to scene and lifecycle
      context.scene.add(mesh);
      context.lifecycle.register(mesh);

      // Register with interaction service if interactive (using fluent API!)
      if (config.interactive) {
        const tooltipConfig = config.interaction?.tooltip || {
          title: `${config.geometry.type} object`,
          description: 'A scene object',
        };

        const builder = context.services.interaction.register(`scene-object-${index}`, mesh);

        // Apply hover glow with REACTIVE intensity! ✨
        builder.withHoverGlow(0xff8c00, () => gameConfig.interaction.hoverGlowIntensity);

        // Apply click VFX
        builder.withClickVFX();

        // Apply camera shake with REACTIVE values! ✨
        // Always register (behavior checks intensity at runtime)
        builder.withCameraShake(
          () => gameConfig.interaction.cameraShakeIntensity,
          0.3 // Duration can be static
        );

        // Apply particle effect with REACTIVE count! ✨
        // Always register (behavior checks count at runtime)
        builder.withParticleEffect(() => gameConfig.interaction.particleCount);

        // Apply tooltip
        builder.withTooltip(tooltipConfig.title, tooltipConfig.description);
      }

      this.meshes.push(mesh);
    });

    console.log(`📦 [SceneObjectsModule] Created ${this.meshes.length} objects`);

    // Emit loading complete event
    this.initialized(context.sceneName);
  }

  async destroy(): Promise<void> {
    // Lifecycle handles mesh cleanup
    this.themedMaterials = [];
    this.meshes = [];
  }

  /**
   * Optional lifecycle hook: React to theme changes
   */
  public onThemeChange(theme: I_ThemeColors): void {
    // Update all themed materials
    this.themedMaterials.forEach((material) => {
      material.color.setHex(theme.primaryForeground);
    });
  }

  /**
   * Get all meshes (useful for custom logic)
   */
  getMeshes(): Mesh[] {
    return this.meshes;
  }

  /**
   * Get mesh by index
   */
  getMesh(index: number): Mesh | undefined {
    return this.meshes[index];
  }

  /**
   * Create Three.js geometry based on config
   */
  private createGeometry(geometryConfig: I_SceneObjectConfig['geometry']): BufferGeometry {
    const { type, params } = geometryConfig;

    switch (type) {
      case 'box':
        // params: [width, height, depth]
        return new BoxGeometry(...(params as RGBColor));

      case 'sphere':
        // params: [radius, widthSegments?, heightSegments?]
        return new SphereGeometry(...(params as [number, number?, number?]));

      case 'cylinder':
        // params: [radiusTop, radiusBottom, height, radialSegments?]
        return new CylinderGeometry(...(params as [number, number, number, number?]));

      case 'cone':
        // params: [radius, height, radialSegments?]
        return new ConeGeometry(...(params as [number, number, number?]));

      default:
        console.warn(`Unknown geometry type: ${type}, defaulting to box`);
        return new BoxGeometry(1, 1, 1);
    }
  }

  /**
   * Create Three.js material based on config
   */
  private createMaterial(
    config: I_SceneObjectConfig,
    context: I_ModuleContext
  ): MeshStandardMaterial {
    const { material } = config;

    let color: number;
    if (material.useTheme) {
      color = context.settings.theme.primaryForeground;
    } else if (material.staticColor !== undefined) {
      color = material.staticColor;
    } else {
      color = 0x808080; // Default gray
    }

    return new MeshStandardMaterial({
      color,
      roughness: material.roughness ?? 0.8,
      metalness: material.metalness ?? 0,
    });
  }
}
