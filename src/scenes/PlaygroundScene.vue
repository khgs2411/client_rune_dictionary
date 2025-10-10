<template>
  <!-- Camera Setup -->
  <TresPerspectiveCamera :position="[0, 10, 15]" :look-at="[0, 0, 0]" />
  <OrbitControls :max-polar-angle="Math.PI / 2 - 0.1" :min-distance="5" :max-distance="50" :target="[0, 0, 0]" />

  <!-- Skybox -->
  <Sky :distance="450000" :turbidity="10" :rayleigh="2" :mie-coefficient="0.005" :mie-directional-g="0.8" />

  <!-- Ground Plane -->
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0, 0]" receive-shadow>
    <TresPlaneGeometry :args="[100, 100, 32, 32]" />
    <TresMeshStandardMaterial :color="settings.theme.muted" :roughness="0.8" :metalness="0.2" />
  </TresMesh>

  <!-- Player Character -->
  <TresGroup ref="playerRef" :position="[playerPos.x, 1, playerPos.z]">
    <!-- Body -->
    <TresMesh :position="[0, 0, 0]" cast-shadow>
      <TresCapsuleGeometry :args="[0.5, 1, 8, 16]" />
      <TresMeshStandardMaterial :color="settings.theme.primary" :roughness="0.3" :metalness="0.6" />
    </TresMesh>
    <!-- Head -->
    <TresMesh :position="[0, 1.2, 0]" cast-shadow>
      <TresSphereGeometry :args="[0.4, 16, 16]" />
      <TresMeshStandardMaterial :color="settings.theme.accent" :roughness="0.4" :metalness="0.5" />
    </TresMesh>
  </TresGroup>

  <!-- Lighting -->
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight
    :position="[10, 20, 10]"
    :intensity="1.5"
    cast-shadow
    :shadow-camera-left="-30"
    :shadow-camera-right="30"
    :shadow-camera-top="30"
    :shadow-camera-bottom="-30"
  />

  <!-- Visual Helpers -->
  <TresGridHelper :args="[50, 50]" :position="[0, 0.01, 0]" />
</template>

<script setup lang="ts">
import { useLoop } from '@tresjs/core'
import { OrbitControls, Sky } from '@tresjs/cientos'
import { useSettingsStore } from '@/stores/settings.store'
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const settings = useSettingsStore()
const playerRef = ref()
const playerPos = reactive({ x: 0, z: 0 })

// Movement controls
const keys = reactive({
  w: false,
  a: false,
  s: false,
  d: false,
})

const moveSpeed = 5 // units per second

function handleKeyDown(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (key in keys) {
    keys[key as keyof typeof keys] = true
  }
}

function handleKeyUp(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (key in keys) {
    keys[key as keyof typeof keys] = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

// Animation loop
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  // Update player position based on keys
  if (keys.w) playerPos.z -= moveSpeed * delta
  if (keys.s) playerPos.z += moveSpeed * delta
  if (keys.a) playerPos.x -= moveSpeed * delta
  if (keys.d) playerPos.x += moveSpeed * delta
})
</script>