<template>
  <!-- Camera -->
  <TresPerspectiveCamera ref="cameraRef" :position="cameraPosition" />

  <!-- Blue Sky -->
  <Sky :distance="450000" :turbidity="8" :rayleigh="3" :mie-coefficient="0.005" :mie-directional-g="0.7" />

  <!-- Ground Plane -->
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
    <TresPlaneGeometry :args="[100, 100]" />
    <TresMeshStandardMaterial color="#4a7c4a" />
  </TresMesh>

  <!-- Simple Character (Capsule) -->
  <TresMesh :position="[playerX, 1, playerZ]" cast-shadow>
    <TresCapsuleGeometry :args="[0.5, 1, 8, 16]" />
    <TresMeshStandardMaterial :color="settings.theme.primary" />
  </TresMesh>

  <!-- Lighting -->
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[10, 10, 5]" :intensity="1" cast-shadow />

  <!-- Grid Helper -->
  <TresGridHelper :args="[50, 50]" :position="[0, 0.01, 0]" />
</template>

<script setup lang="ts">
import { useLoop } from '@tresjs/core'
import { Sky } from '@tresjs/cientos'
import { useSettingsStore } from '@/stores/settings.store'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const settings = useSettingsStore()

// Player position
const playerX = ref(0)
const playerZ = ref(0)

// Camera ref
const cameraRef = ref()

// Camera position (always behind player)
const cameraPosition = computed<[number, number, number]>(() => [
  playerX.value,
  5,
  playerZ.value + 10,
])

// Keyboard state
const keys = {
  w: false,
  s: false,
  a: false,
  d: false,
}

// Movement speed
const moveSpeed = 5

// Keyboard handlers
function onKeyDown(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (key in keys) keys[key as keyof typeof keys] = true
}

function onKeyUp(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (key in keys) keys[key as keyof typeof keys] = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

// Animation loop
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  const camera = cameraRef.value
  if (!camera) return

  // Calculate movement
  let moveX = 0
  let moveZ = 0

  if (keys.w) moveZ -= 1
  if (keys.s) moveZ += 1
  if (keys.a) moveX -= 1
  if (keys.d) moveX += 1

  // Normalize diagonal movement
  if (moveX !== 0 || moveZ !== 0) {
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
    moveX /= length
    moveZ /= length

    // Update player position
    playerX.value += moveX * moveSpeed * delta
    playerZ.value += moveZ * moveSpeed * delta
  }

  // Make camera look at player
  camera.lookAt(playerX.value, 1, playerZ.value)
})
</script>
