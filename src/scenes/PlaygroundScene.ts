import { useCameraControls } from '@/composables/useCameraController';
import { useCharacterControls } from '@/composables/useCharacterController';
import { rgbToHex } from '@/composables/useTheme';
import type { Engine, I_GameScene } from '@/core/Engine';
import { useSettingsStore } from '@/stores/settings.store';
import * as THREE from 'three';
import { watch, type WatchStopHandle } from 'vue';
import { I_SceneConfig } from '@/common/types';


export class PlaygroundScene implements I_GameScene {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;

  private settings!: ReturnType<typeof useSettingsStore>;

  // Use existing composables
  private camera$!: ReturnType<typeof useCameraControls>;
  private character$!: ReturnType<typeof useCharacterControls>;

  // Three.js objects
  private character!: THREE.Group;
  private characterBodyMaterial!: THREE.MeshStandardMaterial;
  private characterConeMaterial!: THREE.MeshStandardMaterial;
  private ground!: THREE.Mesh;
  private groundMaterial!: THREE.MeshStandardMaterial;

  // Scene state
  private objects: THREE.Mesh[] = [];
  private watchers: WatchStopHandle[] = [];

  public camera!: THREE.Camera;


  constructor(config: I_SceneConfig) {
    this.engine = config.engine;
    this.start();
  }

  public start(): void {
    console.log('🎬 [PlaygroundScene] Initializing...');

    // Initialize settings store (must be done after Vue app is mounted)
    this.settings = useSettingsStore();

    // Initialize camera composable and expose instance
    this.camera$ = useCameraControls();
    this.camera = this.camera$.instance;

    // Initialize character with camera angle
    this.character$ = useCharacterControls({
      cameraAngleH: this.camera$.angle.horizontal,
    });

    this.setupLighting();
    this.createGround();
    this.createCharacter();
    this.createObstacles();
    this.createDebugCube(); // Temporary debug helper
    this.setupThemeWatchers();

    // Set initial camera lookAt and update matrices
    this.camera$.start?.();

    console.log('✅ [PlaygroundScene] Initialized');
  }


  update(delta: number): void {
    // Update character controller
    this.character$.update(delta);

    // Update camera target to follow character
    this.camera$.target.x.value = this.character$.position.x.value;
    this.camera$.target.z.value = this.character$.position.z.value;

    // Camera position is auto-updated by composable!
    // Just update lookAt target
    const lookAtTarget = new THREE.Vector3(
      this.character$.position.x.value,
      1, // Fixed height for lookAt
      this.character$.position.z.value
    );

    this.camera$.update(lookAtTarget);

    // Sync Three.js character mesh with composable state
    this.character.position.set(
      this.character$.position.x.value,
      this.character$.position.y.value + 1, // Offset for capsule center
      this.character$.position.z.value
    );
    this.character.rotation.y = this.character$.rotation.value;
  }

  destroy(): void {
    console.log('🧹 [PlaygroundScene] Cleaning up...');

    // Stop all Vue watchers
    this.watchers.forEach((stop) => stop());
    this.watchers = [];

    // Cleanup composables
    this.character$.destroy();
    this.camera$.destroy();

    // Remove objects from scene
    this.engine.scene.remove(this.character);
    this.engine.scene.remove(this.ground);
    this.objects.forEach((obstacle) => this.engine.scene.remove(obstacle));

    // Dispose geometries and materials
    this.character.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });

    this.ground.geometry.dispose();
    this.groundMaterial.dispose();

    this.objects.forEach((obstacle) => {
      obstacle.geometry.dispose();
      (obstacle.material as THREE.Material).dispose();
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
        }
      )
    );

    // Watch for dark mode changes
    this.watchers.push(
      watch(
        () => this.settings.colorMode,
        () => {
          console.log('🌓 [PlaygroundScene] Dark mode toggled, updating colors...');
          this.updateMaterialColors();
        }
      )
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.engine.scene.add(ambientLight);

    // Directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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
    const geometry = new THREE.PlaneGeometry(100, 100);
    this.groundMaterial = new THREE.MeshStandardMaterial({
      color: rgbToHex(this.settings.theme.muted),
    });

    this.ground = new THREE.Mesh(geometry, this.groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.engine.scene.add(this.ground);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(50, 50);
    gridHelper.position.y = 0.01;
    this.engine.scene.add(gridHelper);

    console.log('🌍 [PlaygroundScene] Ground created at y=0');
    console.log('   ↳ Grid helper at y=0.01');
  }

  private createCharacter(): void {
    this.character = new THREE.Group();

    // Body (capsule)
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
    this.characterBodyMaterial = new THREE.MeshStandardMaterial({
      color: rgbToHex(this.settings.theme.primary),
    });
    const body = new THREE.Mesh(bodyGeometry, this.characterBodyMaterial);
    body.castShadow = true;
    this.character.add(body);

    // Forward indicator (cone)
    const coneGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
    this.characterConeMaterial = new THREE.MeshStandardMaterial({
      color: rgbToHex(this.settings.theme.accent),
    });
    const cone = new THREE.Mesh(coneGeometry, this.characterConeMaterial);
    cone.position.set(0, 0, 0.7);
    cone.rotation.x = Math.PI / 2;
    cone.castShadow = true;
    this.character.add(cone);

    // Set initial position
    this.character.position.set(0, 1, 0);

    this.engine.scene.add(this.character);
    console.log('🧍 [PlaygroundScene] Character created at (0,1,0)');
  }

  private createObstacles(): void {
    const obstacleData = [
      { position: [5, 1, 0], size: [2, 2, 2] },
      { position: [-8, 1.5, 5], size: [3, 3, 2] },
      { position: [0, 0.75, -10], size: [4, 1.5, 1.5] },
    ];

    obstacleData.forEach((data) => {
      const geometry = new THREE.BoxGeometry(...(data.size as [number, number, number]));
      const material = new THREE.MeshStandardMaterial({
        color: 0x6b7280,
        roughness: 0.8,
      });
      const obstacle = new THREE.Mesh(geometry, material);
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
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Bright red, unlit
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(5, 1, 0); // At origin, y=1
    this.engine.scene.add(cube);
  }

}
