import { Vec3 } from '@/common/types';
import { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneObjectConfig } from '@/data/sceneObjectConfig.dto';
import SceneModule from '@/game/SceneModule';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { GameConfig, useGameConfigStore } from '@/stores/gameConfig.store';
import {
  BoxGeometry,
  BufferGeometry,
  BufferGeometryEventMap,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Mesh,
  MeshStandardMaterial,
  NormalBufferAttributes,
  Object3DEventMap,
  SphereGeometry,
} from 'three';
import { Guards } from 'topsyde-utils';
import { ReactiveValue } from '../entity/interaction.types';
import { ApplicationSettings, useSettingsStore } from '@/stores/settings.store';

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
  private settings: ApplicationSettings;

  constructor(objectConfigs: I_SceneObjectConfig[], moduleName?: string) {
    super(moduleName);
    this.objectConfigs = objectConfigs;
    this.settings = useSettingsStore();
  }

  protected async init(context: I_ModuleContext): Promise<void> {
    const gameConfig = useGameConfigStore();

    this.objectConfigs.forEach((config, index) => {
      // Create geometry and material
      const geometry = this.createGeometry(config.geometry);
      const material = this.createMaterial(config, context);

      // Track themed materials for onThemeChange
      if (config.material.useTheme) {
        this.themedMaterials.push(material);
      }

      // Create individual mesh
      const mesh = this.createMesh(geometry, material, index, config);

      // Set transform
      this.setTransform(mesh, config);

      // Register with interaction service if interactive (using fluent API!)
      this.addInteractable(config, context, index, mesh, gameConfig);

      // Register with collision service if collidable
      this.addColission(config, context, index, mesh);

      // Add to scene and lifecycle
      this.addGridHelper(context, mesh);

      this.meshes.push(mesh);
    });

    console.log(`📦 [SceneObjectsModule] Created ${this.meshes.length} objects`);

  }

  addColission(
    config: I_SceneObjectConfig,
    context: I_ModuleContext,
    index: number,
    mesh: Mesh<
      BufferGeometry<NormalBufferAttributes, BufferGeometryEventMap>,
      MeshStandardMaterial,
      Object3DEventMap
    >,
  ) {
    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[SceneObjectsModule] Physics not ready, skipping collision for object ${index}`,
      );
      return;
    }

    const objectId = `scene-object-${this.id}-${index}`;

    // Register physics directly from Three.js mesh (auto-extracts geometry, position, rotation, scale)
    context.services.physics.registerStaticFromMesh(objectId, mesh);

    console.log(
      `✅ [SceneObjectsModule] Registered physics for ${config.geometry.type} object ${index}`,
    );
  }

  private addInteractable(
    config: I_SceneObjectConfig,
    context: I_ModuleContext,
    index: number,
    mesh: Mesh,
    gameConfig: GameConfig,
  ) {
    if (config.interactive) {
      const tooltipConfig = config.interaction?.tooltip || {
        title: `${config.geometry.type} object`,
        description: 'A scene object',
      };

      const builder = context.services.interaction.register(
        `scene-object-${this.id}-${index}`,
        mesh,
      );

      // Apply hover glow with REACTIVE intensity! ✨
      if (config.interaction?.hoverGlow) {
        const hoverGlow: { color?: number; intensity?: ReactiveValue<number> } = {
          color: undefined,
          intensity: undefined,
        };
        if (Guards.IsObject(config.interaction.hoverGlow)) {
          hoverGlow.color = config.interaction.hoverGlow.color;
          hoverGlow.intensity = config.interaction.hoverGlow.intensity;
        }
        builder.withHoverGlow(
          hoverGlow.color || 0xff8c00,
          hoverGlow.intensity || (() => gameConfig.interaction.hoverGlowIntensity),
        );
      }

      // Apply click VFX
      if (config.interaction?.clickVFX) {
        const vfx: { text: string | undefined; color: string | undefined } = {
          text: undefined,
          color: undefined,
        };
        if (Guards.IsObject(config.interaction.clickVFX)) {
          vfx.text = config.interaction.clickVFX.text;
          vfx.color = config.interaction.clickVFX.color;
        }
        builder.withClickVFX(vfx.text, vfx.color);
      }

      // Apply camera shake with REACTIVE values! ✨
      // Always register (behavior checks intensity at runtime)
      if (config.interaction?.cameraShake) {
        builder.withCameraShake(
          () => gameConfig.interaction.cameraShakeIntensity,
          0.3, // Duration can be static
        );
      }

      // Apply particle effect with REACTIVE count! ✨
      // Always register (behavior checks count at runtime)
      if (config.interaction?.particleEffect)
        builder.withParticleEffect(() => gameConfig.interaction.particleCount);

      // Apply tooltip
      if (config.interaction?.tooltip)
        builder.withTooltip(tooltipConfig.title, tooltipConfig.description);
    }
  }

  public addGridHelper(context: I_ModuleContext, mesh: Mesh) {
    context.scene.add(mesh);
    context.lifecycle.register(mesh);
  }

  private setTransform(mesh: Mesh, config: I_SceneObjectConfig) {
    mesh.position.set(...config.position);
    if (config.rotation) {
      const euler = new Euler(...config.rotation);
      mesh.rotation.copy(euler);
    }
    if (config.scale) {
      mesh.scale.set(...config.scale);
    }
  }

  private createMesh(
    geometry: BufferGeometry,
    material: MeshStandardMaterial,
    index: number,
    config: I_SceneObjectConfig,
  ) {
    const mesh = new Mesh(geometry, material);
    mesh.name = `scene-object-${index}`;
    mesh.castShadow = config.castShadow ?? true;
    mesh.receiveShadow = config.receiveShadow ?? true;
    return mesh;
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
        return new BoxGeometry(...(params as Vec3));

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
    context: I_ModuleContext,
  ): MeshStandardMaterial {
    const { material } = config;

    let color: number;
    if (material.useTheme) {
      color = this.settings.theme.primaryForeground;
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
