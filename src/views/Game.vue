<template>
  <div class="game-container">
    <canvas ref="canvasRef" class="three-canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { tryOnMounted, tryOnUnmounted, useRafFn, useWindowSize } from '@vueuse/core';
import { Engine, GameScene } from '@/core/Engine';
import { PlaygroundScene } from '@/scenes/PlaygroundScene';
import { I_SceneConfig } from '@/common/types';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let engine: Engine | null = null;
let currentScene: GameScene | null = null;

// VueUse: Auto-reactive window size
const { width, height } = useWindowSize();

function start() {
  if (!canvasRef.value) return;

  // Prevent double initialization
  if (engine || currentScene) {
    console.warn('⚠️ [Game] Already initialized, skipping...');
    return;
  }

  console.log('🎮 [Game] Initializing...');
  console.log('Canvas size:', canvasRef.value.width, 'x', canvasRef.value.height);
  console.log('Window size:', window.innerWidth, 'x', window.innerHeight);

  // Create engine
  engine = new Engine(canvasRef.value);

  // Create and load playground scene
  const config: I_SceneConfig = { engine };
  currentScene = new PlaygroundScene(config);
  currentScene.init();

  // Start render loop
  resumeRenderLoop();

  console.log('✅ [Game] Initialized');
  console.log('Engine scene UUID:', engine.scene.uuid);
}

function destroy() {
  console.log('🧹 [Game] Cleaning up...');

  // Pause render loop
  pauseRenderLoop();

  // Cleanup playground scene
  if (currentScene) {
    currentScene.cleanup();
    currentScene = null;
  }

  // Cleanup engine
  if (engine) {
    engine.cleanup();
    engine = null;
  }

  console.log('✅ [Game] Cleanup complete');
}

function tryOnReload(cb: Function) {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
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
  engine.render(currentScene.camera);
}

// VueUse: Animation frame loop
const { pause: pauseRenderLoop, resume: resumeRenderLoop } = useRafFn(render, { immediate: false }); // Don't start immediately

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
