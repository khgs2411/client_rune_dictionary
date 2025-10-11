import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import { rgbToHex } from '@/composables/useTheme';
import type { Engine } from '@/core/Engine';
import type { I_GameScene } from '@/common/types';
import { useSettingsStore } from '@/stores/settings.store';
import { watch, type WatchStopHandle } from 'vue';
import { I_SceneConfig } from '@/common/types';
import {
  Group,
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Material,
  AmbientLight,
  DirectionalLight,
  PlaneGeometry,
  GridHelper,
  CapsuleGeometry,
  ConeGeometry,
  BoxGeometry,
  MeshBasicMaterial,
  Scene,
  Object3D,
} from 'three';
import { GameScene } from '../core/GameScene';

export interface SceneModule {
  init(context: ModuleContext): void;
  update(delta: number): void;
  destroy(): void;
}

// Context = everything a module might need
interface ModuleContext {
  engine: Engine;
  scene: Scene;
  lifecycle: SceneLifecycle;
  // Can expand as needed
}

/**
 * Manages lifecycle of Three.js objects and Vue watchers
 * Handles automatic cleanup and disposal to prevent memory leaks
 */
export class SceneLifecycle {
  private watchers: WatchStopHandle[] = [];
  private disposables: Object3D[] = [];

  /**
   * Register Vue watcher for automatic cleanup
   * @returns this for fluent chaining
   */
  watch(watcher: WatchStopHandle): this {
    this.watchers.push(watcher);
    return this;
  }

  /**
   * Register Three.js objects for automatic cleanup
   * @returns this for fluent chaining
   */
  register(...objects: Object3D[]): this {
    this.disposables.push(...objects);
    return this;
  }

  /**
   * Cleanup all registered resources
   * Stops watchers, removes objects from scene, and disposes geometries/materials
   */
  cleanup(scene: Scene): void {
    // Stop all Vue watchers
    this.watchers.forEach((stop) => stop());

    // Remove and dispose all registered objects
    this.disposables.forEach((obj) => {
      try {
        scene.remove(obj);
        this.dispose(obj);
      } catch (e) {
        console.warn('[SceneLifecycle] Failed to dispose object:', e);
      }
    });

    // Clear arrays
    this.watchers = [];
    this.disposables = [];
  }

  /**
   * Recursively dispose geometries and materials
   * Handles Mesh objects (covers 90% of use cases)
   */
  private dispose(obj: Object3D): void {
    obj.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }
}

export class PlaygroundScene extends GameScene implements I_GameScene {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;

  private settings!: ReturnType<typeof useSettingsStore>;

  // High-level entity composables
  public camera!: ReturnType<typeof useCamera>;
  private character!: ReturnType<typeof useCharacter>;

  // Three.js objects (for material updates)
  private characterMesh!: Group;
  private characterBodyMaterial!: MeshStandardMaterial;
  private characterConeMaterial!: MeshStandardMaterial;
  private groundMaterial!: MeshStandardMaterial;

  constructor(config: I_SceneConfig) {
    super();
    this.engine = config.engine;
    this.start();
  }

  public start(): void {
    console.log('🎬 [PlaygroundScene] Initializing...');

    // Initialize settings store (must be done after Vue app is mounted)
    this.settings = useSettingsStore();

    // Initialize high-level entity composables
    this.camera = useCamera();
    this.character = useCharacter({
      cameraAngleH: this.camera.controller.angle.horizontal,
    });

    this.setupLighting();
    this.createGround();
    this.createCharacterMesh();
    this.createObstacles();
    this.createDebugCube(); // Temporary debug helper
    this.setupThemeWatchers();

    // Set initial camera lookAt and update matrices
    this.camera.start();

    console.log('✅ [PlaygroundScene] Initialized');
  }

  update(delta: number): void {
    // Update character controller
    this.character.update(delta);

    // Just update lookAt target
    const lookAtTarget = new Vector3(
      this.character.controller.position.x.value,
      1, // Fixed height for lookAt
      this.character.controller.position.z.value,
    );

    this.camera.update(lookAtTarget);

    // Sync js character mesh with composable state
    this.characterMesh.position.set(
      this.character.controller.position.x.value,
      this.character.controller.position.y.value + 1, // Offset for capsule center
      this.character.controller.position.z.value,
    );
    this.characterMesh.rotation.y = this.character.controller.rotation.value;
  }

  destroy(): void {
    console.log('🧹 [PlaygroundScene] Cleaning up...');

    // Cleanup Vue composables
    this.character.destroy();
    this.camera.destroy();

    // Lifecycle handles all Three.js cleanup (objects, watchers, disposal)
    this.lifecycle.cleanup(this.engine.scene);

    console.log('✅ [PlaygroundScene] Cleanup complete');
  }

  private setupThemeWatchers(): void {
    // Watch for theme changes (color theme: neutral, rose, blue, etc.)
    this.lifecycle.watch(
      watch(
        () => this.settings.currentTheme,
        () => {
          console.log('🎨 [PlaygroundScene] Theme changed, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );

    // Watch for dark mode changes
    this.lifecycle.watch(
      watch(
        () => this.settings.colorMode,
        () => {
          console.log('🌓 [PlaygroundScene] Dark mode toggled, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );
  }

  private updateMaterialColors(): void {
    // Update character body color
    this.characterBodyMaterial.color.setHex(rgbToHex(this.settings.theme.primary));

    // Update character cone color
    this.characterConeMaterial.color.setHex(rgbToHex(this.settings.theme.accent));

    // Update ground color
    this.groundMaterial.color.setHex(rgbToHex(this.settings.theme.muted));
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.engine.scene.add(ambientLight);
    this.lifecycle.register(ambientLight);

    // Directional light with shadows
    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    this.engine.scene.add(directionalLight);
    this.lifecycle.register(directionalLight);

    console.log('💡 [PlaygroundScene] Lighting setup complete');
  }

  private createGround(): void {
    const geometry = new PlaneGeometry(100, 100);
    this.groundMaterial = new MeshStandardMaterial({
      color: rgbToHex(this.settings.theme.muted),
    });

    const ground = new Mesh(geometry, this.groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.engine.scene.add(ground);
    this.lifecycle.register(ground);

    // Add grid helper
    const gridHelper = new GridHelper(50, 50);
    gridHelper.position.y = 0.01;
    this.engine.scene.add(gridHelper);
    this.lifecycle.register(gridHelper);

    console.log('🌍 [PlaygroundScene] Ground created at y=0');
    console.log('   ↳ Grid helper at y=0.01');
  }

  private createCharacterMesh(): void {
    this.characterMesh = new Group();

    // Body (capsule)
    const bodyGeometry = new CapsuleGeometry(0.5, 1, 8, 16);
    this.characterBodyMaterial = new MeshStandardMaterial({
      color: rgbToHex(this.settings.theme.primary),
    });
    const body = new Mesh(bodyGeometry, this.characterBodyMaterial);
    body.castShadow = true;
    this.characterMesh.add(body);

    // Forward indicator (cone)
    const coneGeometry = new ConeGeometry(0.2, 0.4, 8);
    this.characterConeMaterial = new MeshStandardMaterial({
      color: rgbToHex(this.settings.theme.accent),
    });
    const cone = new Mesh(coneGeometry, this.characterConeMaterial);
    cone.position.set(0, 0, 0.7);
    cone.rotation.x = Math.PI / 2;
    cone.castShadow = true;
    this.characterMesh.add(cone);

    // Set initial position
    this.characterMesh.position.set(0, 1, 0);

    this.engine.scene.add(this.characterMesh);
    this.lifecycle.register(this.characterMesh);
    console.log('🧍 [PlaygroundScene] Character mesh created at (0,1,0)');
  }

  private createObstacles(): void {
    const obstacleData = [
      { position: [5, 1, 0], size: [2, 2, 2] },
      { position: [-8, 1.5, 5], size: [3, 3, 2] },
      { position: [0, 0.75, -10], size: [4, 1.5, 1.5] },
    ];

    obstacleData.forEach((data) => {
      const geometry = new BoxGeometry(...(data.size as [number, number, number]));
      const material = new MeshStandardMaterial({
        color: 0x6b7280,
        roughness: 0.8,
      });
      const obstacle = new Mesh(geometry, material);
      obstacle.position.set(...(data.position as [number, number, number]));
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;

      this.engine.scene.add(obstacle);
      this.lifecycle.register(obstacle);
    });

    console.log('🧱 [PlaygroundScene] Created', obstacleData.length, 'obstacles');
  }

  private createDebugCube(): void {
    // Bright red cube at origin for debugging camera view
    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshBasicMaterial({ color: 0xff0000 }); // Bright red, unlit
    const cube = new Mesh(geometry, material);
    cube.position.set(5, 1, 0); // At origin, y=1
    this.engine.scene.add(cube);
    this.lifecycle.register(cube);
  }
}
