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
  <TresGroup :position="[playerX, 1, playerZ]" :rotation="[0, playerRotation, 0]">
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
import { useLoop } from '@tresjs/core'
import { Sky } from '@tresjs/cientos'
import { useSettingsStore } from '@/stores/settings.store'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const settings = useSettingsStore()

// Player position and rotation
const playerX = ref(0)
const playerZ = ref(0)
const playerRotation = ref(0) // Y-axis rotation (facing direction)

// Camera ref
const cameraRef = ref()

// Camera controls
const cameraDistance = ref(10)
const cameraAngleH = ref(0) // Horizontal rotation around player
const cameraAngleV = ref(0.4) // Vertical angle (0 = level, PI/2 = top-down)

// Mouse state for camera rotation
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

// Camera position (calculated from angles and distance)
const cameraPosition = computed<[number, number, number]>(() => {
  const offsetX = Math.sin(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value)
  const offsetZ = Math.cos(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value)
  const offsetY = Math.sin(cameraAngleV.value) * cameraDistance.value

  return [playerX.value + offsetX, offsetY + 1, playerZ.value + offsetZ]
})

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

// Mouse handlers for camera rotation
function onMouseDown(e: MouseEvent) {
  // Only right mouse button
  if (e.button === 2) {
    isDragging.value = true
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
    e.preventDefault()
  }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = e.clientX - lastMouseX.value
  const deltaY = e.clientY - lastMouseY.value

  // Update camera angles (invert Y for natural camera feel)
  cameraAngleH.value -= deltaX * 0.005
  cameraAngleV.value = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraAngleV.value + deltaY * 0.005))

  lastMouseX.value = e.clientX
  lastMouseY.value = e.clientY
}

function onMouseUp(e: MouseEvent) {
  if (e.button === 2) {
    isDragging.value = false
  }
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault() // Prevent right-click context menu
}

function onWheel(e: WheelEvent) {
  // Zoom in/out
  cameraDistance.value = Math.max(5, Math.min(20, cameraDistance.value + e.deltaY * 0.01))
  e.preventDefault()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('contextmenu', onContextMenu)
  window.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('contextmenu', onContextMenu)
  window.removeEventListener('wheel', onWheel)
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

    // Update player rotation to face movement direction
    playerRotation.value = Math.atan2(moveX, moveZ)
  }

  // Make camera look at player
  camera.lookAt(playerX.value, 1, playerZ.value)
})
</script>
