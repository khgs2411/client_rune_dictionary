<template>
  <!-- Camera -->
  <TresPerspectiveCamera ref="cameraRef" :position="camera$.position.value" />

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
    :position="[character$.position.x.value, 1, character$.position.z.value]"
    :rotation="[0, character$.rotation.value, 0]">
    <!-- Body -->
    <TresMesh cast-shadow>
      <TresCapsuleGeometry :args="[0.5, 1, 8, 16]" />
      <TresMeshStandardMaterial :color="settings.theme.primary" />
    </TresMesh>

    <!-- Forward indicator (small cone pointing forward) -->
    <TresMesh :position="[0, 0, 0.7]" :rotation="[-Math.PI / 2, 0, 0]" cast-shadow>
      <TresConeGeometry :args="[0.2, 0.4, 8]" />
      <TresMeshStandardMaterial :color="settings.theme.accent" />
    </TresMesh>
  </TresGroup>

  <!-- Lighting -->
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[10, 10, 5]" :intensity="1" cast-shadow />

  <!-- Grid Helper -->
  <TresGridHelper :args="[50, 50]" :position="[0, 0.01, 0]" />
</template>

<script setup lang="ts">
import { Sky } from '@tresjs/cientos';
import { useSettingsStore } from '@/stores/settings.store';
import { ref } from 'vue';

// Composables
import { useCharacterControls } from '@/composables/useCharacterController';
import { useCameraControls } from '@/composables/useCameraController';
import { useScene } from '@/composables/useScene';

const settings = useSettingsStore();

// Camera reference for lookAt updates
const cameraRef = ref();

// Character controls (VueUse $ convention)
const character$ = useCharacterControls();

// Camera controls (depends on character position)
const camera$ = useCameraControls({
  target: {
    x: character$.position.x,
    z: character$.position.z,
  },
});

// Scene lifecycle + animation loop
const scene$ = useScene({
  autoRefreshOnHMR: true,
  onBeforeRender: (delta) => {
    if (!cameraRef.value) return;
    character$.update(delta, camera$.angle.horizontal.value);
    camera$.updateLookAt(cameraRef.value, character$.position.x.value, character$.position.z.value);
  },
  onCleanup: () => {
    character$.cleanup();
    camera$.cleanup();
  },
});

function onHotReload() {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      scene$.reload();
    });
  }
}
// HMR handling (must be in scene file to fire on scene changes)
onHotReload();
</script>
