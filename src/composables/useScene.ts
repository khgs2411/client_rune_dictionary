import { onMounted, onUnmounted } from 'vue';
import { useLoop, useTres, dispose } from '@tresjs/core';

export interface SceneOptions {
  onCleanup: () => void;
  onBeforeRender?: (delta: number, elapsed: number) => void;
  autoRefreshOnHMR?: boolean;
}

export interface Scene {
  init: () => void;
  cleanup: () => void;
  reload: () => void;
}

export function useScene(options: SceneOptions): Scene {
  const { onCleanup, onBeforeRender: onBeforeRenderCallback, autoRefreshOnHMR = false } = options;

  // Get TresJS context for scene disposal
  const { scene } = useTres();

  // Setup animation loop if onBeforeRender callback provided
  if (onBeforeRenderCallback) {
    const { onBeforeRender } = useLoop();
    onBeforeRender(({ delta, elapsed }) => {
      onBeforeRenderCallback(delta, elapsed);
    });
  }

  // Initialize scene (called on mount)
  function init() {
    console.log('🚀 Scene initialized');
  }

  // Cleanup scene (called on unmount)
  function cleanup() {
    console.log('🧹 Scene cleanup called');

    // Dispose Three.js scene resources (geometries, materials, textures)
    if (scene.value) {
      console.log('🗑️ Disposing Three.js scene resources');
      dispose(scene.value);
    }
    // Cleanup composables (event listeners, etc.)
    onCleanup();
  }

  // HMR dispose (called from scene file's import.meta.hot.dispose)
  function reload() {
    console.log('🔥 HMR dispose called');

    // Cleanup scene
    cleanup();

    if (autoRefreshOnHMR) {
      console.log('🔄 Auto-refresh enabled, reloading page...');
      window.location.reload();
    } else {
      console.log('🔄 HMR without page refresh');
    }
  }

  // Setup lifecycle hooks
  onMounted(() => {
    console.log('🟢 onMounted');
    init();
  });

  // Don't cleanup in onUnmounted during HMR - it fires too late and breaks the new instance
  // Only cleanup when actually unmounting (page navigation, etc)
  onUnmounted(() => {
    if (!import.meta.hot) {
      console.log('🧹 onUnmounted called - cleaning up');
      cleanup();
    }
  });



  return {
    init,
    cleanup,
    reload,
  };
}
