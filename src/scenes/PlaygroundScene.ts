import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import { rgbToHex } from '@/composables/useTheme';
import type { Engine } from '@/core/Engine';
import type { I_GameScene, SettingsStore } from '@/common/types';
import { useSettingsStore } from '@/stores/settings.store';
import { watch } from 'vue';
import { I_SceneConfig } from '@/common/types';
import {
  Group,
  MeshStandardMaterial,
  Mesh,
  Vector3,
  AmbientLight,
  DirectionalLight,
  PlaneGeometry,
  GridHelper,
  CapsuleGeometry,
  ConeGeometry,
  BoxGeometry,
  MeshBasicMaterial,
  Light,
} from 'three';
import { GameScene } from '../core/GameScene';
import { I_ModuleContext, SceneModule } from '@/common/types';

// ============================================================================
// MODULES
// ============================================================================

/**
 * Lighting Module
 * Handles ambient and directional lights with shadow configuration
 */
class LightingModule implements SceneModule {
  private lights: Light[] = [];

  init(context: I_ModuleContext): void {
    // Ambient light
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    context.scene.add(ambientLight);
    context.lifecycle.register(ambientLight);
    this.lights.push(ambientLight);

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
    context.scene.add(directionalLight);
    context.lifecycle.register(directionalLight);
    this.lights.push(directionalLight);
  }

  update(delta: number): void {
    // Optional: animate lights if needed
  }

  destroy(): void {
    // Lifecycle handles cleanup
    this.lights = [];
  }
}

/**
 * Ground Module
 * Handles ground plane and grid helper
 */
class GroundModule implements SceneModule {
  private groundMaterial!: MeshStandardMaterial;
  private settings: SettingsStore;

  constructor(settings: SettingsStore) {
    this.settings = settings;
  }

  init(context: I_ModuleContext): void {
    // Create ground plane
    const geometry = new PlaneGeometry(100, 100);
    this.groundMaterial = new MeshStandardMaterial({
      color: rgbToHex(this.settings.theme.muted),
    });

    const ground = new Mesh(geometry, this.groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    context.scene.add(ground);
    context.lifecycle.register(ground);

    // Add grid helper
    const gridHelper = new GridHelper(50, 50);
    gridHelper.position.y = 0.01;
    context.scene.add(gridHelper);
    context.lifecycle.register(gridHelper);
  }

  update(delta: number): void {
    // Static ground, nothing to update
  }

  destroy(): void {
    // Lifecycle handles cleanup
  }

  // Public API for theme updates
  updateColor(color: number): void {
    this.groundMaterial.color.setHex(color);
  }
}

// ============================================================================
// SCENE
// ============================================================================

export class PlaygroundScene extends GameScene implements I_GameScene {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;

  private settings!: SettingsStore;

  // High-level entity composables
  public camera!: ReturnType<typeof useCamera>;
  private character!: ReturnType<typeof useCharacter>;

  // Module references (for cross-module communication)
  private groundModule!: GroundModule;

  // Three.js objects (for material updates)
  private characterMesh!: Group;
  private characterBodyMaterial!: MeshStandardMaterial;
  private characterConeMaterial!: MeshStandardMaterial;

  constructor(config: I_SceneConfig) {
    super();
    this.engine = config.engine;
    this.start();
  }

  public start(): void {
    console.log('🎬 [PlaygroundScene] Initializing scene...');

    this.settings = useSettingsStore();

    this.camera = useCamera();

    this.character = useCharacter({
      cameraAngleH: this.camera.controller.angle.horizontal,
    });

    // Build module context
    const context: I_ModuleContext = {
      engine: this.engine,
      scene: this.engine.scene,
      lifecycle: this.lifecycle,
    };


    // Initialize modules
    this.modules.push(new LightingModule());

    this.groundModule = new GroundModule(this.settings);
    this.modules.push(this.groundModule);

    // Init all modules
    this.modules.forEach((m) => m.init(context));

    this.createCharacterMesh();
    this.createObstacles();
    this.createDebugCube(); // Temporary debug helper

    this.setLifecycleWatchers();

    this.camera.start();

    console.log('✅ [PlaygroundScene] Scene initialization complete');
  }

  update(delta: number): void {
    // Update Vue composables
    this.character.update(delta);

    // Update camera lookAt target

    this.camera.update(new Vector3(
      this.character.controller.position.x.value,
      1, // Fixed height for lookAt
      this.character.controller.position.z.value,
    ));

    // Update modules
    this.modules.forEach((m) => m.update(delta));

    // Sync js character mesh with composable state
    this.characterMesh.position.set(
      this.character.controller.position.x.value,
      this.character.controller.position.y.value + 1, // Offset for capsule center
      this.character.controller.position.z.value,
    );

    this.characterMesh.rotation.y = this.character.controller.rotation.value;
  }

  destroy(): void {
    console.log('🧹 [PlaygroundScene] Starting scene cleanup...');

    this.character.destroy();

    this.camera.destroy();

    this.modules.forEach((m) => m.destroy());

    this.lifecycle.cleanup(this.engine.scene);

    console.log('✅ [PlaygroundScene] Scene cleanup complete');
  }

  private setLifecycleWatchers(): void {
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

    // Update ground color via module
    this.groundModule.updateColor(rgbToHex(this.settings.theme.muted));
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
