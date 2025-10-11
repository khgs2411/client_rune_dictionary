<template>
  <div class="game-container">
    <!-- WebSocket Manager - auto-connects on mount, disconnects on unmount -->
    <WebSocketManager />

    <!-- Loading Screen -->
    <LoadingScreen />

    <!-- Game Canvas -->
    <canvas ref="canvasRef" class="three-canvas" />
  </div>
</template>

<script setup lang="ts">
import { Engine } from '@/game/Engine';
import { PlaygroundScene } from '@/scenes/PlaygroundScene';
import { I_GameScene, I_SceneConfig } from '@/scenes/scenes.types';
import LoadingScreen from '@/components/LoadingScreen.vue';
import WebSocketManager from '@/components/WebSocketManager.vue';
import { tryOnMounted, tryOnUnmounted, useRafFn, useWindowSize } from '@vueuse/core';
import { ref, watch } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let engine: Engine | null = null;
let currentScene: I_GameScene | null = null;

// VueUse: Auto-reactive window size
const { width, height } = useWindowSize();

function start() {
  if (!canvasRef.value) return;

  // Prevent double initialization
  if (engine || currentScene) {
    console.warn('⚠️ [Game] Already initialized, skipping...');
    return;
  }

  console.log('🎮 [Game] Initializing game...');

  // Create engine
  engine = new Engine(canvasRef.value);
  console.log('   ↳ Scene UUID:', engine.scene.uuid);

  // Create and load playground scene
  // LoadingScreen.vue (mounted first) listens to events emitted by the scene
  const config: I_SceneConfig = { engine };
  currentScene = new PlaygroundScene(config);

  // Start render loop
  resumeRenderLoop();

  console.log('✅ [Game] Game initialization complete');
}

function destroy() {
  console.log('');
  console.log('🧹 [Game] Starting cleanup...');

  // Pause render loop
  console.log('   ↳ Pausing render loop...');
  pauseRenderLoop();

  // Cleanup playground scene
  if (currentScene) {
    console.log('   ↳ Destroying scene...');
    currentScene.destroy();
    currentScene = null;
  }

  // Cleanup engine
  if (engine) {
    console.log('   ↳ Cleaning up engine...');
    engine.cleanup();
    engine = null;
  }

  console.log('✅ [Game] Cleanup complete');
}

function tryOnReload(cb: Function) {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      console.log('🔥 [Game] Hot Module Replacement detected');
      cb();
    });
  }
}

function render() {
  if (!engine || !currentScene) return;

  const delta = engine.clock.getDelta();

  // Update scene
  currentScene.update(delta);

  // Render
  engine.render(currentScene.camera.instance);
}

// VueUse: Animation frame loop
const { pause: pauseRenderLoop, resume: resumeRenderLoop } = useRafFn(render, {
  // Don't start immediately
  immediate: false,
  fpsLimit: undefined,
});

// Watch window size changes and resize engine
watch([width, height], () => {
  if (engine) {
    engine.resize();
  }
});

// VueUse: Safe lifecycle hooks
tryOnMounted(start);
tryOnUnmounted(destroy);

// Handle hot module replacement (HMR) cleanup
tryOnReload(destroy);
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
}
</style>
