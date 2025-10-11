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


interface SceneModule {
  init(context: ModuleContext): void
  update(delta: number): void
  destroy(): void
}

// Context = everything a module might need
interface ModuleContext {
  engine: Engine
  scene: Scene
  lifecycle: SceneLifecycle
  // Can expand as needed
}

export class SceneLifecycle {
  private watchers: WatchStopHandle[] = [];
  private disposables: Object3D[] = [];

  watch(watcher: WatchStopHandle): this {
    this.watchers.push(watcher);
    return this;
  }

  register(...objects: Object3D[]): this {
    this.disposables.push(...objects);
    return this;
  }

  cleanup(engine: Engine): void {
    this.watchers.forEach(stop => stop());
    this.disposables.forEach(obj => {
      engine.scene.remove(obj);
      this.dispose(obj);
    });
    this.watchers = [];
    this.disposables = [];
  }

  private dispose(obj: Object3D): void {
    obj.traverse(child => {
      if (child instanceof Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }
}

export abstract class GameScene {
  protected modules: SceneModule[] = [];
  protected lifecycle: SceneLifecycle = new SceneLifecycle();


  abstract start(): void;
  abstract update(...args: any): void;
  abstract destroy(): void;

}

export class PlaygroundScene extends GameScene implements I_GameScene {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;

  private settings!: ReturnType<typeof useSettingsStore>;

  // High-level entity composables
  public camera!: ReturnType<typeof useCamera>;
  private character!: ReturnType<typeof useCharacter>;

  // js objects
  private characterMesh!: Group;
  private characterBodyMaterial!: MeshStandardMaterial;
  private characterConeMaterial!: MeshStandardMaterial;
  private ground!: Mesh;
  private groundMaterial!: MeshStandardMaterial;

  // Scene state
  private objects: Mesh[] = [];
  private watchers: WatchStopHandle[] = [];

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

    // Stop all Vue watchers
    this.watchers.forEach((stop) => stop());
    this.watchers = [];

    // Cleanup composables
    this.character.destroy();
    this.camera.destroy();

    // Remove objects from scene
    this.engine.scene.remove(this.characterMesh);
    this.engine.scene.remove(this.ground);
    this.objects.forEach((obstacle) => this.engine.scene.remove(obstacle));

    // Dispose geometries and materials
    this.characterMesh.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        if (child.material instanceof Material) {
          child.material.dispose();
        }
      }
    });

    this.ground.geometry.dispose();
    this.groundMaterial.dispose();

    this.objects.forEach((obstacle) => {
      obstacle.geometry.dispose();
      (obstacle.material as Material).dispose();
    });

    console.log('✅ [PlaygroundScene] Cleanup complete');
  }

  private setupThemeWatchers(): void {
    // Watch for theme changes (color theme: neutral, rose, blue, etc.)
    this.watchers.push(
      watch(
        () => this.settings.currentTheme,
        () => {
          console.log('🎨 [PlaygroundScene] Theme changed, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );

    // Watch for dark mode changes
    this.watchers.push(
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

    console.log('💡 [PlaygroundScene] Lighting setup complete');
  }

  private createGround(): void {
    const geometry = new PlaneGeometry(100, 100);
    this.groundMaterial = new MeshStandardMaterial({
      color: rgbToHex(this.settings.theme.muted),
    });

    this.ground = new Mesh(geometry, this.groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.engine.scene.add(this.ground);

    // Add grid helper
    const gridHelper = new GridHelper(50, 50);
    gridHelper.position.y = 0.01;
    this.engine.scene.add(gridHelper);

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

      this.objects.push(obstacle);
      this.engine.scene.add(obstacle);
    });

    console.log('🧱 [PlaygroundScene] Created', this.objects.length, 'obstacles');
  }

  private createDebugCube(): void {
    // Bright red cube at origin for debugging camera view
    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshBasicMaterial({ color: 0xff0000 }); // Bright red, unlit
    const cube = new Mesh(geometry, material);
    cube.position.set(5, 1, 0); // At origin, y=1
    this.engine.scene.add(cube);
  }
}
