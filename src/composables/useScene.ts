import { dispose, useLoop, useTres } from '@tresjs/core';
import { onMounted, onUnmounted } from 'vue';

export interface SceneOptions {
  onCleanup: () => void;
  onBeforeRender?: (delta: number, elapsed: number) => void;
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
    onBeforeRender: onBeforeRenderCallback,
    autoRefreshOnHMR = false,
    debug = import.meta.env.DEV,
  } = options;

  // Get TresJS context for scene disposal
  const { scene } = useTres();

  // Setup animation loop if onBeforeRender callback provided
  let offBeforeRender: (() => void) | undefined;
  if (onBeforeRenderCallback) {
    const { onBeforeRender } = useLoop();
    const { off } = onBeforeRender(({ delta, elapsed }) => {
      onBeforeRenderCallback(delta, elapsed);
    });
    offBeforeRender = off;
  }

  // Initialize scene (called on mount)
  function init() {
    if (debug) console.log('🚀 Scene initialized');
  }

  // Cleanup scene (called on unmount)
  function cleanup() {
    if (debug) console.log('🧹 Scene cleanup called');

    // Unregister animation loop callback first
    if (offBeforeRender) {
      if (debug) console.log('🔄 Unregistering animation loop');
      offBeforeRender();
    }

    // Dispose Three.js scene resources (geometries, materials, textures)
    if (scene.value) {
      if (debug) console.log('🗑️ Disposing Three.js scene resources');
      dispose(scene.value);
    }
    // Cleanup composables (event listeners, etc.)
    onCleanup();
  }

  // HMR dispose (called from scene file's import.meta.hot.dispose)
  function reload() {
    if (debug) console.log('🔥 HMR dispose called');

    // Cleanup scene
    cleanup();

    if (autoRefreshOnHMR) {
      if (debug) console.log('🔄 Auto-refresh enabled, reloading page...');
      window.location.reload();
    } else {
      if (debug) console.log('🔄 HMR without page refresh');
    }
  }

  // Setup lifecycle hooks
  onMounted(() => {
    if (debug) console.log('🟢 onMounted');
    init();
  });

  // Don't cleanup in onUnmounted during HMR - it fires too late and breaks the new instance
  // Only cleanup when actually unmounting (page navigation, etc)
  onUnmounted(() => {
    if (!import.meta.hot) {
      if (debug) console.log('🧹 onUnmounted called - cleaning up');
      cleanup();
    }
  });

  return {
    init,
    cleanup,
    reload,
  };
}


export function onHotReload(currentScene: Scene) {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      currentScene.reload();
    });
  }
}