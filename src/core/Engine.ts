import * as THREE from 'three';

export interface GameScene {
  readonly name: string;
  readonly camera: THREE.Camera;
  readonly engine: Engine;

  /**
   * Initialize the scene (lights, objects, etc.)
   */
  init(): void;

  /**
   * Called every frame with delta time.
   */
  update(delta: number): void;

  /**
   * Clean up resources, remove event listeners, etc.
   */
  cleanup(): void;
}

/**
 * Core game engine that encapsulates Three.js scene, renderer, and clock.
 * Does not own the camera - each scene creates its own camera via composables.
 */
export class Engine {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;

  constructor(canvas: HTMLCanvasElement) {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue for visibility

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create clock for delta time
    this.clock = new THREE.Clock();

    console.log('🎮 [Engine] Initialized - Scene UUID:', this.scene.uuid);
    console.trace('Stack trace for Engine creation:');
  }

  /**
   * Render the scene with the provided camera
   */
  render(camera: THREE.Camera): void {
    // Debug first few renders
    if (!this.renderCount) this.renderCount = 0;
    if (this.renderCount < 2) {
      console.log('🎨 [Engine] Render #' + this.renderCount, {
        sceneChildren: this.scene.children.length,
        cameraPosition: camera.position.toArray(),
        sceneUUID: this.scene.uuid
      });
      this.renderCount++;
    }

    this.renderer.render(this.scene, camera);
  }

  private renderCount?: number;

  /**
   * Handle window resize
   */
  resize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.renderer.dispose();
    console.log('🧹 [Engine] Cleaned up');
  }
}
