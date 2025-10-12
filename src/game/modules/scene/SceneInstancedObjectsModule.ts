import { RGBColor } from '@/common/types';
import { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneObjectConfig } from '@/data/sceneObjectConfig.dto';
import SceneModule from '@/game/SceneModule';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { ApplicationSettings, useSettingsStore } from '@/stores/settings.store';
import {
  BoxGeometry,
  BufferGeometry,
  BufferGeometryEventMap,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  GridHelper,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  NormalBufferAttributes,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three';

/**
 * Scene Objects Module
 * Manages static scene objects (houses, trees, obstacles, etc.) using instanced rendering
 * Groups objects by geometry + material properties for optimal performance
 *
 * Refactored to:
 * - Use onThemeChange() optional hook instead of I_ThemedModule interface
 * - Simplified lifecycle
 */
export class SceneInstancedObjectsModule extends SceneModule implements I_SceneModule {
  private objectConfigs: I_SceneObjectConfig[];
  private instancedMeshes: Map<string, InstancedMesh> = new Map();
  private themedMaterials: MeshStandardMaterial[] = []; // Materials that respond to theme changes
  private physicsIds: Map<string, string[]> = new Map(); // Track physics IDs for cleanup
  private settings: ApplicationSettings;

  constructor(objectConfigs: I_SceneObjectConfig[], moduleName?: string) {
    super(moduleName);
    this.objectConfigs = objectConfigs;
    this.settings = useSettingsStore();
  }

  protected async init(context: I_ModuleContext): Promise<void> {
    // Group objects by geometry + material properties
    const groups = this.groupObjects();

    groups.forEach((configs, groupKey) => {
      const instancedMeshConfig = configs[0];
      const geometry = this.createGeometry(instancedMeshConfig.geometry);
      const material = this.createMaterial(instancedMeshConfig);

      // Track themed materials for updateColors
      if (instancedMeshConfig.material.useTheme) {
        this.themedMaterials.push(material);
      }

      // Create instanced mesh
      const instancedMesh: InstancedMesh = this.createInstancedMesh(
        geometry,
        material,
        instancedMeshConfig,
        configs,
      );

      this.addCollisions(context, groupKey, instancedMesh);

      // Add to scene and lifecycle
      this.addToScene(context, instancedMesh);

      // Optionally add grid helper for plane geometries (e.g. ground)
      if (instancedMeshConfig.geometry.type === 'plane') {
        this.addGridHelper(context, instancedMeshConfig);
      }

      this.instancedMeshes.set(groupKey, instancedMesh);
    });

  }

  private addCollisions(context: I_ModuleContext, groupKey: string, instancedMesh: InstancedMesh) {
    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[SceneInstancedObjectsModule] Physics not ready, skipping collision for group ${groupKey}`,
      );
      return;
    }

    // Register physics for all instances in this instanced mesh
    const physicsIdPrefix = `scene-instanced-${this.id}-${groupKey}`;
    const instanceIds = context.services.physics.registerInstancedStatic(
      physicsIdPrefix,
      instancedMesh
    );

    // Track for cleanup
    this.physicsIds.set(groupKey, instanceIds);

    console.log(
      `✅ [SceneInstancedObjectsModule] Registered ${instanceIds.length} physics bodies for group ${groupKey}`,
    );
  }

  public async destroy(context?: I_ModuleContext): Promise<void> {
    // Remove all physics bodies
    if (context?.services.physics) {
      this.physicsIds.forEach((instanceIds) => {
        instanceIds.forEach((id) => context.services.physics.remove(id));
      });
    }

    // Lifecycle handles Three.js cleanup
    this.themedMaterials = [];
    this.instancedMeshes.clear();
    this.physicsIds.clear();
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

  public addToScene(context: I_ModuleContext, instancedMesh: InstancedMesh) {
    context.scene.add(instancedMesh);
    context.lifecycle.register(instancedMesh);
  }

  private addGridHelper(context: I_ModuleContext, instancedMeshConfig: I_SceneObjectConfig) {
    const gridHelper = new GridHelper(instancedMeshConfig.geometry?.params?.[0] || 50, instancedMeshConfig.geometry?.params?.[1] || 50);
    gridHelper.position.y = 0.01;
    context.scene.add(gridHelper);
    context.lifecycle.register(gridHelper);
  }

  private createInstancedMesh(
    geometry: BufferGeometry<NormalBufferAttributes, BufferGeometryEventMap>,
    material: MeshStandardMaterial,
    instancedMeshConfig: I_SceneObjectConfig,
    configs: I_SceneObjectConfig[],
  ) {
    const instancedMesh = new InstancedMesh(geometry, material, configs.length);
    instancedMesh.count = 0;
    instancedMesh.castShadow = instancedMeshConfig.castShadow ?? true;
    instancedMesh.receiveShadow = instancedMeshConfig.receiveShadow ?? true;

    if (instancedMeshConfig.geometry.type === 'plane') {
      instancedMesh.rotation.x = -Math.PI / 2;
    }

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
    return instancedMesh;
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
    console.log(params);
    switch (type) {
      case 'plane':
        return new PlaneGeometry((params as [number, number])[0], (params as [number, number])[1]);
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
