import { Scene, Clock, WebGLRenderer, Color, PCFSoftShadowMap, Camera } from 'three';
import { Lib } from 'topsyde-utils';

/**
 * Core game engine that encapsulates js scene, renderer, and clock.
 * Does not own the camera - each scene creates its own camera via composables.
 */
export class Engine {
  scene: Scene;
  renderer: WebGLRenderer;
  clock: Clock;

  constructor(canvas: HTMLCanvasElement) {
    // Create scene
    this.scene = new Scene();
    this.scene.background = new Color(0x87ceeb); // Sky blue for visibility

    // Create renderer
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    // Create clock for delta time
    this.clock = new Clock();

    Lib.Log('🎮 [Engine] Initialized - Scene UUID:', this.scene.uuid);
  }

  /**
   * Render the scene with the provided camera
   */
  render(camera: Camera): void {
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
