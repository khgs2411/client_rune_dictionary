<template>
  <div class="game-container">
    <canvas ref="canvasRef" class="three-canvas" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import { PlaygroundScene } from '@/scenes/PlaygroundScene';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationFrameId: number;
let clock: THREE.Clock;
let playgroundScene: PlaygroundScene | null = null;

function init() {
  if (!canvasRef.value) return;

  console.log('🎮 [GameThree] Initializing Three.js...');

  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: false,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create clock for delta time
  clock = new THREE.Clock();

  // Create and load playground scene
  playgroundScene = new PlaygroundScene();
  playgroundScene.init({
    scene,
    camera,
    renderer,
    canvas: canvasRef.value,
  });

  // Start render loop
  animate();

  console.log('✅ [GameThree] Three.js initialized');
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update playground scene
  if (playgroundScene) {
    playgroundScene.update(delta);
  }

  // Render
  renderer.render(scene, camera);
}

function handleResize() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function cleanup() {
  console.log('🧹 [GameThree] Cleaning up...');

  // Cancel animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // Cleanup playground scene
  if (playgroundScene) {
    playgroundScene.cleanup();
    playgroundScene = null;
  }

  // Dispose renderer
  if (renderer) {
    renderer.dispose();
  }

  // Remove resize listener
  window.removeEventListener('resize', handleResize);

  console.log('✅ [GameThree] Cleanup complete');
}

/**
 * Handle hot module replacement (HMR) cleanup for the game scene.
 */
function onHotReload() {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      cleanup();
    });
  }
}

onMounted(() => {
  init();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  cleanup();
});

onHotReload();
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
