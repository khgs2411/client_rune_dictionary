import { dispose, useLoop, useTres } from '@tresjs/core';
import { onMounted, onUnmounted } from 'vue';

export interface SceneOptions {
  onCleanup: () => void;
  onUpdate?: (delta: number, elapsed: number) => void;
  autoRefreshOnHMR?: boolean;
  debug?: boolean;
}

export interface Scene {
  init: () => void;
  cleanup: () => void;
  reload: () => void;
}

export function useScene(options: SceneOptions): Scene {
  const {
    onCleanup,
    onUpdate: onUpdateCallback,
    autoRefreshOnHMR = false,
    debug = import.meta.env.DEV,
  } = options;

  // Get TresJS context for scene disposal
  const { scene } = useTres();

  // Setup animation loop if onBeforeRender callback provided
  let offBeforeRender: (() => void) | undefined;
  if (onUpdateCallback) {
    const { onBeforeRender } = useLoop();
    const { off } = onBeforeRender(({ delta, elapsed }) => {
      onUpdateCallback(delta, elapsed);
    });
    offBeforeRender = off;
  }

  // Initialize scene (called on mount)
  function init() {
    if (debug) console.log('📦 [Scene] Initialized');
  }

  // Cleanup scene (called on unmount)
  function cleanup() {
    if (debug) console.log('🧹 [Scene] Starting cleanup...');

    // Unregister animation loop callback first
    if (offBeforeRender) {
      if (debug) console.log('  ↳ Stopping animation loop');
      offBeforeRender();
    }

    // Cleanup composables (event listeners, etc.)
    if (debug) console.log('  ↳ Cleaning up composables');
    onCleanup();

    // Dispose Three.js scene resources (geometries, materials, textures)
    if (scene.value) {
      if (debug) console.log('  ↳ Disposing Three.js resources');
      dispose(scene.value);
    }

    if (debug) console.log('✅ [Scene] Cleanup complete');
  }

  // HMR dispose (called from scene file's import.meta.hot.dispose)
  function reload() {
    if (debug) console.log('🔥 [HMR] Hot reload triggered');

    // Cleanup scene
    cleanup();

    if (autoRefreshOnHMR) {
      if (debug) console.log('🔄 [HMR] Reloading page...');
      window.location.reload();
    } else {
      if (debug) console.log('🔄 [HMR] Waiting for remount...');
    }
  }

  // Setup lifecycle hooks
  onMounted(() => {
    if (debug) console.log('🎬 [Scene] Mounted');
    init();
  });

  // Don't cleanup in onUnmounted during HMR - it fires too late and breaks the new instance
  // Only cleanup when actually unmounting (page navigation, etc)
  onUnmounted(() => {
    if (!import.meta.hot) {
      if (debug) console.log('👋 [Scene] Unmounted (not HMR)');
      cleanup();
    }
  });

  return {
    init,
    cleanup,
    reload,
  };
}

