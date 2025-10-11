import { RGBColor } from '@/common/types';
import { I_SceneObjectConfig } from '@/data/sceneObjectConfig.dto';
import SceneModule from '@/game/SceneModule';
import { I_InteractableModule, I_ModuleContext, I_ThemedSceneModule } from '@/scenes/scenes.types';
import { InteractionEntityModule } from '../entity/InteractionEntityModule';
import { VisualFeedbackEntityModule } from '../entity/VisualFeedbackEntityModule';
import {
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  BufferGeometry,
  Mesh,
  MeshStandardMaterial,
  Euler,
  Quaternion,
  Vector3,
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
 * Uses EntityModules for features:
 * - InteractionEntityModule: Makes objects clickable/hoverable
 * - VisualFeedbackEntityModule: Provides visual feedback for interactions
 */
export class SceneObjectsModule extends SceneModule implements I_ThemedSceneModule, I_InteractableModule {
  private objectConfigs: I_SceneObjectConfig[];
  private meshes: Mesh[] = [];
  private themedMaterials: MeshStandardMaterial[] = []; // Materials that respond to theme changes

  // Entity modules (pluggable features)
  public ownsInteraction: boolean = false; // Will be set to true after dependency injection
  public interaction!: InteractionEntityModule;
  public visualFeedback?: VisualFeedbackEntityModule;

  constructor(
    objectConfigs: I_SceneObjectConfig[],
    moduleName: string = 'sceneObjectsModule',
  ) {
    super(moduleName);
    this.objectConfigs = objectConfigs;
  }

  async start(context: I_ModuleContext): Promise<void> {
    this.objectConfigs.forEach((config, index) => {
      // Create geometry and material
      const geometry = this.createGeometry(config.geometry);
      const material = this.createMaterial(config, context);

      // Track themed materials for updateColors
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

      this.meshes.push(mesh);

      // Register as interactable if config says so
      if (config.interactive && this.interaction) {
        const interactionConfig = config.interaction || {
          hoverable: true,
          clickable: true,
          tooltip: {
            title: `${config.geometry.type} object`,
            description: 'A scene object',
          },
        };

        this.interaction.register(`scene-object-${index}`, mesh, interactionConfig);
      }
    });

    console.log(`📦 [SceneObjectsModule] Created ${this.meshes.length} objects`);

    // Emit loading complete event
    this.initialized(context.sceneName);
  }

  public update(): void {
    // No need to update interaction modules - they're managed by the scene
  }

  async destroy(): Promise<void> {
    // No need to destroy interaction modules - they're managed by the scene
    // Lifecycle handles cleanup
    this.themedMaterials = [];
    this.meshes = [];
  }

  public updateColors(hex: number): void {
    // Update all themed materials
    this.themedMaterials.forEach((material) => {
      material.color.setHex(hex);
    });
  }

  public setInteractionEntityModule(interaction: InteractionEntityModule, feedback?: VisualFeedbackEntityModule): void {
    this.interaction = interaction;
    this.visualFeedback = feedback;
    this.ownsInteraction = true; // Mark as ready
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
