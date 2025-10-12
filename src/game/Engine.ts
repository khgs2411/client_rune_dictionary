import {
  Camera,
  Clock,
  Color,
  LoadingManager,
  PCFSoftShadowMap,
  Scene,
  WebGLRenderer,
} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { useRxjs } from 'topsyde-utils';
import { watch } from 'vue';
import { useGameConfigStore } from '@/stores/gameConfig.store';

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
  size: {
    width: number;
    height: number;
  };

  constructor(canvas: HTMLCanvasElement) {
    console.log('   ↳ Initializing Three.js engine...');

    const config = useGameConfigStore();

    // Create clock for delta time
    this.clock = new Clock();
    this.stats = new Stats();
    canvas.parentElement?.appendChild(this.stats.dom);

    // Watch stats visibility setting
    watch(
      () => config.debug.showStats,
      (showStats) => {
        this.stats.dom.style.display = showStats ? 'block' : 'none';
      },
      { immediate: true },
    );

    // Create scene
    this.scene = new Scene();
    this.scene.background = new Color(0x87ceeb); // Sky blue for visibility

    // Setup loading system
    this.loadingManager = this.createLoadingManager();

    // Create renderer
    this.stats.begin();
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.renderer = this.createRenderer(canvas);
    console.log('   ↳ Engine initialized (Scene UUID:', this.scene.uuid + ')');
  }

  /**
   * Render the scene with the provided camera
   */
  public render(camera: Camera): void {
    this.stats.update();
    this.renderer.render(this.scene, camera);
  }

  /**
   * Handle window resize
   */
  public resize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    console.log('      ↳ Disposing WebGL renderer...');
    this.renderer.dispose();
    this.stats.end();
    console.log('      ↳ Engine cleanup complete');
  }

  public isInBounds(x: number, y: number, z: number): boolean {
    return (
      x >= 0 &&
      x < this.size.width &&
      z >= 0 &&
      z < this.size.width &&
      y >= 0 &&
      y < this.size.height
    );
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
      const rxjs$ = useRxjs('scene:loading');
      rxjs$.$next('fail', { sceneName: 'Engine', error: 'Failed to load: ' + url, url });
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
    return renderer;
  }
}
