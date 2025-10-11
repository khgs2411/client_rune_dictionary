import { Camera, Clock, Color, LoadingManager, PCFSoftShadowMap, Scene, WebGLRenderer } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { useSceneLoader } from '@/composables/useSceneLoader';

/**
 * Core game engine that encapsulates js scene, renderer, and clock.
 * Does not own the camera - each scene creates its own camera via composables.
 */
export class Engine {
  scene: Scene;
  renderer: WebGLRenderer;
  clock: Clock;
  stats: Stats;
  loadingManager: LoadingManager;
  private sceneLoader: ReturnType<typeof useSceneLoader>;

  constructor(canvas: HTMLCanvasElement) {
    console.log('   ↳ Initializing Three.js engine...');

    // Create clock for delta time
    this.clock = new Clock();
    this.stats = new Stats();
    canvas.parentElement?.appendChild(this.stats.dom);

    // Create scene
    this.scene = new Scene();
    this.scene.background = new Color(0x87ceeb); // Sky blue for visibility

    // Setup loading system
    this.sceneLoader = useSceneLoader();
    this.loadingManager = this.createLoadingManager();

    // Create renderer
    this.stats.begin();
    this.renderer = this.createRenderer(canvas);
    console.log('   ↳ Engine initialized (Scene UUID:', this.scene.uuid + ')');
  }

  private createLoadingManager(): LoadingManager {
    const manager = new LoadingManager();

    manager.onStart = (url, itemsLoaded, itemsTotal) => {
      // Initial loading event will be emitted by scene
      console.log(`📦 [LoadingManager] Started loading: ${itemsLoaded}/${itemsTotal}`);
    };

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      // Progress events emitted automatically for loaded assets
      console.log(`📦 [LoadingManager] Progress: ${itemsLoaded}/${itemsTotal} - ${url}`);
    };

    manager.onLoad = () => {
      // Complete event will be emitted by scene
      console.log('📦 [LoadingManager] All assets loaded');
    };

    manager.onError = (url) => {
      this.sceneLoader.emitLoadingError('Unknown', `Failed to load: ${url}`, url);
      console.error('📦 [LoadingManager] Error loading:', url);
    };

    return manager;
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
    this.stats.end();
    console.log('      ↳ Engine cleanup complete');
  }
}
