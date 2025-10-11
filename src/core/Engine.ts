import { Scene, Clock, WebGLRenderer, Color, PCFSoftShadowMap, Camera } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Lib } from 'topsyde-utils';

/**
 * Core game engine that encapsulates js scene, renderer, and clock.
 * Does not own the camera - each scene creates its own camera via composables.
 */
export class Engine {
  scene: Scene;
  renderer: WebGLRenderer;
  clock: Clock;
  stats:Stats;

  constructor(canvas: HTMLCanvasElement) {
    console.log('   ↳ Initializing Three.js engine...');

    // Create clock for delta time
    this.clock = new Clock();
    this.stats = new Stats();
    canvas.parentElement?.appendChild(this.stats.dom);
    
    // Create scene
    this.scene = new Scene();
    this.scene.background = new Color(0x87ceeb); // Sky blue for visibility

    // Create renderer
    this.renderer = this.createRenderer(canvas);
    console.log('   ↳ Engine initialized (Scene UUID:', this.scene.uuid + ')');
  }

  private createRenderer(canvas: HTMLCanvasElement) {
    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    return renderer
  }

  /**
   * Render the scene with the provided camera
   */
  render(camera: Camera): void {
    this.stats.update();
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
    console.log('      ↳ Disposing WebGL renderer...');
    this.renderer.dispose();
    console.log('      ↳ Engine cleanup complete');
  }
}
