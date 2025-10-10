import * as THREE from 'three';
import { useSettingsStore } from '@/stores/settings.store';
import { useCharacterControls } from '@/composables/useCharacterController';
import { useCameraControls } from '@/composables/useCameraController';
import { GameScene, ThreeContext } from '@/common/types';

export class PlaygroundScene implements GameScene {
  name = 'PlaygroundScene';

  private context!: ThreeContext;
  private settings = useSettingsStore();

  // Use existing composables
  private camera$!: ReturnType<typeof useCameraControls>;
  private character$!: ReturnType<typeof useCharacterControls>;

  // Three.js objects
  private character!: THREE.Group;
  private ground!: THREE.Mesh;
  private obstacles: THREE.Mesh[] = [];

  init(context: ThreeContext): void {
    console.log('🎬 [PlaygroundScene] Initializing...');
    this.context = context;

    // Initialize composables
    this.camera$ = useCameraControls();
    this.character$ = useCharacterControls({
      cameraAngleH: this.camera$.angle.horizontal,
    });

    this.setupLighting();
    this.createGround();
    this.createCharacter();
    this.createObstacles();

    console.log('✅ [PlaygroundScene] Initialized');
  }

  private setupLighting(): void {
    const { scene } = this.context;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

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
    scene.add(directionalLight);
  }

  private createGround(): void {
    const { scene } = this.context;

    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({
      color: this.rgbToHex(this.settings.theme.muted),
    });

    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    scene.add(this.ground);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(50, 50);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
  }

  private createCharacter(): void {
    const { scene } = this.context;

    this.character = new THREE.Group();

    // Body (capsule)
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.rgbToHex(this.settings.theme.primary),
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    this.character.add(body);

    // Forward indicator (cone)
    const coneGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: this.rgbToHex(this.settings.theme.accent),
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(0, 0, 0.7);
    cone.rotation.x = Math.PI / 2;
    cone.castShadow = true;
    this.character.add(cone);

    scene.add(this.character);
  }

  private createObstacles(): void {
    const { scene } = this.context;

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

      this.obstacles.push(obstacle);
      scene.add(obstacle);
    });
  }

  private rgbToHex(rgb: [number, number, number]): number {
    return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
  }

  update(delta: number): void {
    // Update character controller
    this.character$.update(delta);

    // Update camera target to follow character
    this.camera$.target.x.value = this.character$.position.x.value;
    this.camera$.target.z.value = this.character$.position.z.value;

    // Sync Three.js character with composable state
    this.character.position.set(
      this.character$.position.x.value,
      this.character$.position.y.value + 1, // Offset for capsule center
      this.character$.position.z.value
    );
    this.character.rotation.y = this.character$.rotation.value;

    // Sync Three.js camera with composable state
    const { camera } = this.context;
    const [camX, camY, camZ] = this.camera$.position.value;
    camera.position.set(camX, camY, camZ);
    camera.lookAt(
      new THREE.Vector3(
        this.camera$.target.x.value,
        1, // Fixed height for lookAt
        this.camera$.target.z.value
      )
    );
  }

  cleanup(): void {
    console.log('🧹 [PlaygroundScene] Cleaning up...');

    // Cleanup composables
    this.character$.cleanup();
    this.camera$.cleanup();

    // Remove objects from scene
    const { scene } = this.context;
    scene.remove(this.character);
    scene.remove(this.ground);
    this.obstacles.forEach((obstacle) => scene.remove(obstacle));

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
    (this.ground.material as THREE.Material).dispose();

    this.obstacles.forEach((obstacle) => {
      obstacle.geometry.dispose();
      (obstacle.material as THREE.Material).dispose();
    });

    console.log('✅ [PlaygroundScene] Cleanup complete');
  }
}
