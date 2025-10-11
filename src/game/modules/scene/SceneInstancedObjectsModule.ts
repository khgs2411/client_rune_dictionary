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
  InstancedMesh,
  MeshStandardMaterial,
  Matrix4,
  Euler,
  Quaternion,
  Vector3,
  BufferGeometryEventMap,
  NormalBufferAttributes,
} from 'three';

/**
 * Scene Objects Module
 * Manages static scene objects (houses, trees, obstacles, etc.) using instanced rendering
 * Groups objects by geometry + material properties for optimal performance
 *
 * Uses EntityModules for features:
 * - InteractionEntityModule: Makes objects clickable/hoverable
 * - VisualFeedbackEntityModule: Provides visual feedback for interactions
 */
export class SceneInstancedObjectsModule extends SceneModule implements I_ThemedSceneModule, I_InteractableModule {
  private objectConfigs: I_SceneObjectConfig[];
  private instancedMeshes: Map<string, InstancedMesh> = new Map();
  private themedMaterials: MeshStandardMaterial[] = []; // Materials that respond to theme changes
  
  // Entity modules (pluggable features)
  public ownsInteraction: boolean = false; // Will be set to true after dependency injection
  public interaction!: InteractionEntityModule;
  public visualFeedback?: VisualFeedbackEntityModule;

  constructor(
    objectConfigs: I_SceneObjectConfig[],
    moduleName: string = 'instancedSceneObjects',

  ) {
    super(moduleName);
    this.objectConfigs = objectConfigs;
  }

  public async start(context: I_ModuleContext): Promise<void> {
    // Group objects by geometry + material properties
    const groups = this.groupObjects();

    groups.forEach((configs, groupKey) => {
      const instancedMeshConfig = configs[0];
      const geometry = this.createGeometry(instancedMeshConfig.geometry);
      const material = this.createMaterial(instancedMeshConfig, context);

      // Track themed materials for updateColors
      if (instancedMeshConfig.material.useTheme) {
        this.themedMaterials.push(material);
      }

      // Create instanced mesh
      const instancedMesh: InstancedMesh = this.createInstancedMesh(geometry, material, instancedMeshConfig, configs);

      // Add to scene and lifecycle
      this.addToScene(context, instancedMesh);

      this.instancedMeshes.set(groupKey, instancedMesh);

      // Register as interactable if config says so
      this.registerInteractables(instancedMeshConfig, instancedMesh, groupKey);

    });

    // Emit loading complete event
    this.initialized(context.sceneName);
  }

  public update(delta: number): void {
    // No need to update interaction modules - they're managed by the scene
  }

  public async destroy(): Promise<void> {
    // No need to destroy interaction modules - they're managed by the scene
    // Lifecycle handles cleanup
    this.themedMaterials = [];
    this.instancedMeshes.clear();
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


  private addToScene(context: I_ModuleContext, instancedMesh: InstancedMesh) {
    context.scene.add(instancedMesh);
    context.lifecycle.register(instancedMesh);
  }

  private registerInteractables(instancedMeshConfig: I_SceneObjectConfig, instancedMesh: InstancedMesh, groupKey: string) {
    if (instancedMeshConfig.interactive && this.interaction) {
      const interactionConfig = instancedMeshConfig.interaction || {
        hoverable: true,
        clickable: true,
        tooltip: {
          title: `${instancedMeshConfig.geometry.type} obstacle`,
          description: 'A scene object',
        },
      };

      this.interaction.register(`scene-object-${groupKey}`, instancedMesh, interactionConfig);
    }
  }

  private createInstancedMesh(geometry: BufferGeometry<NormalBufferAttributes, BufferGeometryEventMap>, material: MeshStandardMaterial, instancedMeshConfig: I_SceneObjectConfig, configs: I_SceneObjectConfig[]) {
    const instancedMesh = new InstancedMesh(geometry, material, configs.length);
    instancedMesh.count = 0;
    instancedMesh.castShadow = instancedMeshConfig.castShadow ?? true;
    instancedMesh.receiveShadow = instancedMeshConfig.receiveShadow ?? true;

    // Set transforms for each instance
    configs.forEach((config, index) => {
      const matrix = new Matrix4();
      const position = new Vector3(...config.position);
      const euler = new Euler(...(config.rotation || [0, 0, 0]));
      const quaternion = new Quaternion().setFromEuler(euler);
      const scale = new Vector3(...(config.scale || [1, 1, 1]));

      matrix.compose(position, quaternion, scale);
      instancedMesh.setMatrixAt(instancedMesh.count++, matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;

    // Compute bounding sphere for proper frustum culling
    instancedMesh.computeBoundingSphere();
    return instancedMesh
  }

  /**
   * Group objects by their geometry + material properties
   */
  private groupObjects(): Map<string, I_SceneObjectConfig[]> {
    const groups = new Map<string, I_SceneObjectConfig[]>();

    this.objectConfigs.forEach((config) => {
      const groupKey = this.generateGroupKey(config);
      const existing = groups.get(groupKey) || [];
      existing.push(config);
      groups.set(groupKey, existing);
    });

    return groups;
  }

  /**
   * Generate a unique key for grouping objects
   */
  private generateGroupKey(config: I_SceneObjectConfig): string {
    const { geometry, material } = config;
    return JSON.stringify({
      geometryType: geometry.type,
      geometryParams: geometry.params,
      useThemeColor: material.useTheme ?? false,
      staticColor: material.staticColor,
      roughness: material.roughness ?? 0.8,
      metalness: material.metalness ?? 0,
    });
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
