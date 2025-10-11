import { I_ModuleContext, I_ThemedSceneModule } from '@/scenes/scenes.types';
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
} from 'three';

/**
 * Scene Object Configuration DTO
 */
export interface SceneObjectConfig {
  position: [number, number, number];
  rotation?: [number, number, number]; // Euler angles in radians
  scale?: [number, number, number]; // Default [1, 1, 1]
  geometry: {
    type: 'box' | 'sphere' | 'cylinder' | 'cone';
    params: number[]; // Geometry-specific parameters
  };
  material: {
    useTheme?: boolean; // If true, uses theme color and updates on theme change
    staticColor?: number; // If set, uses this fixed color
    roughness?: number;
    metalness?: number;
  };
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * Internal grouping key for instanced meshes
 */
interface InstanceGroup {
  geometryType: string;
  geometryParams: string;
  useThemeColor: boolean;
  staticColor?: number;
  roughness: number;
  metalness: number;
}

/**
 * Scene Objects Module
 * Manages static scene objects (houses, trees, obstacles, etc.) using instanced rendering
 * Groups objects by geometry + material properties for optimal performance
 */
export class SceneObjectsModule implements I_ThemedSceneModule {
  private objectConfigs: SceneObjectConfig[];
  private instancedMeshes: Map<string, InstancedMesh> = new Map();
  private themedMaterials: MeshStandardMaterial[] = []; // Materials that respond to theme changes

  constructor(objectConfigs: SceneObjectConfig[]) {
    this.objectConfigs = objectConfigs;
  }

  start(context: I_ModuleContext): void {
    // Group objects by geometry + material properties
    const groups = this.groupObjects();

    groups.forEach((configs, groupKey) => {
      const sampleConfig = configs[0];
      const geometry = this.createGeometry(sampleConfig.geometry);
      const material = this.createMaterial(sampleConfig, context);

      // Track themed materials for updateColors
      if (sampleConfig.material.useTheme) {
        this.themedMaterials.push(material);
      }

      // Create instanced mesh
      const instancedMesh = new InstancedMesh(geometry, material, configs.length);
      instancedMesh.castShadow = sampleConfig.castShadow ?? true;
      instancedMesh.receiveShadow = sampleConfig.receiveShadow ?? true;

      // Set transforms for each instance
      configs.forEach((config, index) => {
        const matrix = new Matrix4();
        const position = new Vector3(...config.position);
        const euler = new Euler(...(config.rotation || [0, 0, 0]));
        const quaternion = new Quaternion().setFromEuler(euler);
        const scale = new Vector3(...(config.scale || [1, 1, 1]));

        matrix.compose(position, quaternion, scale);
        instancedMesh.setMatrixAt(index, matrix);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;

      // Compute bounding sphere for proper frustum culling
      instancedMesh.computeBoundingSphere();

      // Add to scene and lifecycle
      context.scene.add(instancedMesh);
      context.lifecycle.register(instancedMesh);

      this.instancedMeshes.set(groupKey, instancedMesh);
    });
  }

  update(delta: number): void {
    // Static objects, nothing to update
  }

  destroy(): void {
    // Lifecycle handles cleanup
    this.themedMaterials = [];
    this.instancedMeshes.clear();
  }

  updateColors(hex: number): void {
    // Update all themed materials
    this.themedMaterials.forEach((material) => {
      material.color.setHex(hex);
    });
  }

  /**
   * Group objects by their geometry + material properties
   */
  private groupObjects(): Map<string, SceneObjectConfig[]> {
    const groups = new Map<string, SceneObjectConfig[]>();

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
  private generateGroupKey(config: SceneObjectConfig): string {
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
  private createGeometry(geometryConfig: SceneObjectConfig['geometry']): BufferGeometry {
    const { type, params } = geometryConfig;

    switch (type) {
      case 'box':
        // params: [width, height, depth]
        return new BoxGeometry(...(params as [number, number, number]));

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
    config: SceneObjectConfig,
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
