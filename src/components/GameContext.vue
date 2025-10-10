<template>
  <!-- Render child scenes -->
  <slot />
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from 'vue';

import { useCameraControls } from '@/composables/useCameraController';
import { useCharacterControls } from '@/composables/useCharacterController';
import { GameContextKey, type GameContext } from '@/composables/useGameContext';
import { useScene } from '@/composables/useScene';

console.log('🎮 [GameContext] Initializing game context...');

// Initialize camera (always available)
const camera$ = useCameraControls();

// Initialize character (always available for now, can make optional later)
const character$ = useCharacterControls({
  cameraAngleH: camera$.angle.horizontal,
});

// Link character position to camera target
camera$.target.x = character$.position.x;
camera$.target.z = character$.position.z;

// Store for custom scene update callbacks
const customUpdateCallbacks = ref<Array<(delta: number) => void>>([]);

// Standard update loop
const onUpdate = (delta: number) => {
  // Update character movement
  character$.update(delta);

  // Update camera to follow character
  camera$.lookAt(character$.position.x.value, character$.position.z.value);

  // Run any scene-specific custom updates
  customUpdateCallbacks.value.forEach((callback) => callback(delta));
};

// Standard cleanup
const onCleanup = () => {
  console.log('🧹 [GameContext] Cleaning up game context...');
  character$.cleanup();
  camera$.cleanup();
  customUpdateCallbacks.value = [];
};

// Setup scene with standard lifecycle
const scene$ = useScene({
  autoRefreshOnHMR: false,
  onUpdate,
  onCleanup,
  debug: import.meta.env.DEV,
});

// Function to register custom update logic from scenes
function registerCustomUpdate(callback: (delta: number) => void) {
  customUpdateCallbacks.value.push(callback);

  // Return cleanup function
  return () => {
    const index = customUpdateCallbacks.value.indexOf(callback);
    if (index > -1) {
      customUpdateCallbacks.value.splice(index, 1);
    }
  };
}

// Provide game context to all child scenes
const gameContext: GameContext = {
  camera$,
  character$,
  scene$,
  registerCustomUpdate,
};

provide(GameContextKey, gameContext);

onMounted(() => {
  console.log('✅ [GameContext] Game context initialized');
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    scene$.reload();
  });
}
</script>
