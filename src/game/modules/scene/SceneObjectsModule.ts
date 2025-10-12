import { Vec3 } from '@/common/types';
import { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneObjectConfig, SceneObjectGeometryConfig } from '@/data/sceneObjectConfig.dto';
import SceneModule from '@/game/SceneModule';
import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import { GameConfig, useGameConfigStore } from '@/stores/gameConfig.store';
import { useSceneStore } from '@/stores/scene.store';
import { ApplicationSettings, useSettingsStore } from '@/stores/settings.store';
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
  PlaneGeometry,
  SphereGeometry,
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
  private settings: ApplicationSettings;

  constructor(objectConfigs: I_SceneObjectConfig[], moduleName?: string) {
    super(moduleName);
    this.objectConfigs = objectConfigs;
    this.settings = useSettingsStore();
  }

  protected async init(context: I_ModuleContext): Promise<void> {
    const gameConfig = useGameConfigStore();

    this.objectConfigs.forEach((config, index) => {
      // Check if this object has a saved position FIRST (before creating mesh)
      const objectId = `scene-object-${this.id}-${index}`;

      console.log(`🔍 [SceneObjectsModule] Init object ${index}:`, {
        objectId,
        originalPosition: config.position,
        contextSceneExists: !!context.scene,
        sceneName: context.sceneName,
      });

      const savedPosition = context.scene ? this.loadSavedPosition(context, objectId) : null;

      if (savedPosition) {
        // Override config position with saved position
        const oldPosition = [...config.position];
        config.position = [savedPosition.x, savedPosition.y, savedPosition.z];
        console.log(`📍 [SceneObjectsModule] Overriding position for ${objectId}:`, {
          oldPosition,
          newPosition: config.position,
          savedPosition,
        });
      } else {
        console.log(`⚠️ [SceneObjectsModule] No saved position found for ${objectId}, using default:`, config.position);
      }

      // Create geometry and material
      const geometry = this.createGeometry(config.geometry);
      const material = this.createMaterial(config, context);

      // Track themed materials for onThemeChange
      if (config.material.useTheme) {
        this.themedMaterials.push(material);
      }

      // Create individual mesh
      const mesh = this.createMesh(geometry, material, index, config);

      // Set transform (uses saved position if available)
      this.setTransform(mesh, config);

      // Register with interaction service if interactive (using fluent API!)
      this.addInteractable(config, context, index, mesh, gameConfig);

      // Register with collision service if collidable
      this.addColission(config, context, index, mesh);

      // Add to scene and lifecycle
      this.addToScene(context, mesh);

      this.meshes.push(mesh);
    });

    console.log(`📦 [SceneObjectsModule] Created ${this.meshes.length} objects`);

  }

  /**
   * Load saved position from store if available
   */
  private loadSavedPosition(context: I_ModuleContext, objectId: string) {
    const sceneStore = useSceneStore();
    const sceneName = context.sceneName;

    const sceneData = sceneStore.getScene(sceneName);
    console.log(`🔍 [SceneObjectsModule] Loading position for:`, {
      objectId,
      sceneName,
      hasScene: sceneStore.hasScene(sceneName),
      savedObjectIds: sceneData?.objects.map(o => o.objectId) || [],
      sceneData,
    });

    const position = sceneStore.getObjectPosition(sceneName, objectId);
    console.log(`🔍 [SceneObjectsModule] Retrieved position:`, position);

    return position;
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
    if (config.interactive && config.interaction) {
      const builder = context.services.interaction.register(
        `scene-object-${this.id}-${index}`,
        mesh,
      );

      // HOVER BEHAVIORS
      const hover = config.interaction.hover;
      if (hover) {
        // Hover glow with REACTIVE intensity! ✨
        if (hover.glow) {
          builder.withHoverGlow(
            hover.glow.color || 0xff8c00,
            hover.glow.intensity || (() => gameConfig.interaction.hoverGlowIntensity),
          );
        }

        // Tooltip
        if (hover.tooltip) {
          builder.withTooltip(hover.tooltip.title, hover.tooltip.description);
        }

        // Custom hover callbacks
        if (hover.customCallbacks) {
          builder.withHoverCallbacks(hover.customCallbacks);
        }
      }

      // CLICK BEHAVIORS
      const click = config.interaction.click;
      if (click) {
        // Click VFX
        if (click.vfx) {
          builder.withClickVFX(click.vfx.text, click.vfx.color);
        }

        // Camera shake with REACTIVE values! ✨
        if (click.shake) {
          builder.withCameraShake(
            click.shake.intensity || (() => gameConfig.interaction.cameraShakeIntensity),
            click.shake.duration || 0.3,
          );
        }

        // Particle effect with REACTIVE count! ✨
        if (click.particles) {
          builder.withParticles(
            click.particles.count || (() => gameConfig.interaction.particleCount),
            click.particles.color,
            click.particles.speed,
          );
        }

        // Custom click callbacks
        if (click.customCallbacks) {
          builder.withClickCallbacks(click.customCallbacks);
        }
      }

      // DRAG BEHAVIOR (NEW!)
      const drag = config.interaction.drag;
      if (drag?.enabled) {
        builder.withDrag({
          lockAxis: drag.lockAxis,
          snapToGrid: drag.snapToGrid,
          onStart: drag.customCallbacks?.onStart,
          onMove: drag.customCallbacks?.onMove,
          onEnd: drag.customCallbacks?.onEnd,
        });
      }
    }
  }

  public addToScene(context: I_ModuleContext, mesh: Mesh) {
    context.scene.add(mesh);
    context.lifecycle.register(mesh);
  }

  private setTransform(mesh: Mesh, config: I_SceneObjectConfig) {
    console.log(`🔧 [SceneObjectsModule] setTransform for ${mesh.name}:`, {
      configPosition: config.position,
      meshPositionBefore: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
    });

    mesh.position.set(...config.position);

    console.log(`✅ [SceneObjectsModule] setTransform complete for ${mesh.name}:`, {
      meshPositionAfter: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
    });

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
  private createGeometry(geometryConfig: Partial<SceneObjectGeometryConfig>): BufferGeometry {
    const { type, params } = geometryConfig;

    switch (type) {
      case 'plane':
        return new PlaneGeometry(...(params as [number, number]));
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
