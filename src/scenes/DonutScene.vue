<template>
  <!-- Camera Setup -->
  <TresPerspectiveCamera :position="[7, 7, 7]" :look-at="[0, 0, 0]" />
  <OrbitControls />

  <!-- The Donut -->
  <TresMesh ref="donutRef" :position="[0, 2, 0]">
    <TresTorusGeometry :args="[1, 0.4, 16, 32]" />
    <TresMeshBasicMaterial :color="settings.theme.primary" />
  </TresMesh>

  <!-- Visual Helpers -->
  <TresAxesHelper />
  <TresGridHelper />

  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
</template>

<script setup lang="ts">
import { useLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useSettingsStore } from '@/stores/settings.store'
import { ref } from 'vue'

const settings = useSettingsStore()
const donutRef = ref()

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  if (donutRef.value) {
    donutRef.value.rotation.x = elapsed * 0.5
    donutRef.value.rotation.y = elapsed * 0.3
  }
})
</script>
