import { useCamera } from '@/composables/useCamera';
import { useCameraController } from '@/composables/useCameraController';
import * as THREE from 'three';
import { Lib } from 'topsyde-utils';

export interface I_GameScene {
  readonly name: string;
  readonly camera: ReturnType<typeof useCamera>
  readonly engine: Engine;

  /**
   * Initialize the scene (lights, objects, etc.)
   */
  start(): void;

  /**
   * Called every frame with delta time.
   */
  update(delta: number): void;

  /**
   * Clean up resources, remove event listeners, etc.
   */
  destroy(): void;
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

    Lib.Log('🎮 [Engine] Initialized - Scene UUID:', this.scene.uuid);
  }

  /**
   * Render the scene with the provided camera
   */
  render(camera: THREE.Camera): void {
    this.renderer.render(this.scene, camera);
  }


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
    Lib.Log('🧹 [Engine] Cleaned up');
  }
}
