<template>
  <!-- Blue Sky -->
  <Sky
    :distance="450000"
    :turbidity="8"
    :rayleigh="3"
    :mie-coefficient="0.005"
    :mie-directional-g="0.7" />

  <!-- Ground Plane -->
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
    <TresPlaneGeometry :args="[100, 100]" />
    <TresMeshStandardMaterial :color="settings.theme.muted" />
  </TresMesh>

  <!-- Simple Character (Capsule) -->
  <TresGroup
    :position="[character$.position.x.value, character$.position.y.value + 1, character$.position.z.value]"
    :rotation="[0, character$.rotation.value, 0]">
    <!-- Body -->
    <TresMesh cast-shadow>
      <TresCapsuleGeometry :args="[0.5, 1, 8, 16]" />
      <TresMeshStandardMaterial :color="settings.theme.primary" />
    </TresMesh>

    <!-- Forward indicator (small cone pointing forward) -->
    <TresMesh :position="[0, 0, 0.7]" :rotation="[Math.PI / 2, 0, 0]" cast-shadow>
      <TresConeGeometry :args="[0.2, 0.4, 8]" />
      <TresMeshStandardMaterial :color="settings.theme.accent" />
    </TresMesh>
  </TresGroup>

  <!-- Obstacles -->
  <!-- Stone Wall 1 -->
  <TresMesh :position="[5, 1, 0]" cast-shadow receive-shadow>
    <TresBoxGeometry :args="[2, 2, 2]" />
    <TresMeshStandardMaterial color="#6b7280" :roughness="0.8" />
  </TresMesh>

  <!-- Stone Wall 2 -->
  <TresMesh :position="[-8, 1.5, 5]" cast-shadow receive-shadow>
    <TresBoxGeometry :args="[3, 3, 2]" />
    <TresMeshStandardMaterial color="#6b7280" :roughness="0.8" />
  </TresMesh>

  <!-- Stone Wall 3 -->
  <TresMesh :position="[0, 0.75, -10]" cast-shadow receive-shadow>
    <TresBoxGeometry :args="[4, 1.5, 1.5]" />
    <TresMeshStandardMaterial color="#6b7280" :roughness="0.8" />
  </TresMesh>

  <!-- Lighting -->
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[10, 10, 5]" :intensity="1" cast-shadow />

  <!-- Grid Helper -->
  <TresGridHelper :args="[50, 50]" :position="[0, 0.01, 0]" />
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings.store';
import { Sky } from '@tresjs/cientos';
import { onMounted } from 'vue';

// Composables
import { useGameContext } from '@/composables/useGameContext';

const settings = useSettingsStore();

// Inject game context from Game.vue
const { character$ } = useGameContext();

// Character is always provided in Game.vue (for now)
if (!character$) {
  throw new Error('PlaygroundScene requires character controls');
}

// Define obstacles for collision detection
// Each obstacle is {x, z, width, depth} representing a box on the ground
const obstacles = [
  { x: 5, z: 0, width: 2, depth: 2 },    // Stone Wall 1
  { x: -8, z: 5, width: 3, depth: 2 },   // Stone Wall 2
  { x: 0, z: -10, width: 4, depth: 1.5 }, // Stone Wall 3
];

// Pass obstacles to character controller when mounted
onMounted(() => {
  if (character$.setObstacles) {
    character$.setObstacles(obstacles);
  }
});
</script>
