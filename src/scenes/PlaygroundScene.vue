<template>
  <!-- Camera Setup -->
  <TresPerspectiveCamera ref="cameraRef" :position="cameraPos" :look-at="[playerPos.x, 1, playerPos.z]" />
  <OrbitControls
    ref="controlsRef"
    :target="[playerPos.x, 1, playerPos.z]"
    :max-polar-angle="Math.PI / 2.5"
    :min-polar-angle="Math.PI / 6"
    :min-distance="5"
    :max-distance="20"
    :enable-pan="false"
    :enable-damping="true"
    :damping-factor="0.1"
  />

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
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import * as THREE from 'three'

const settings = useSettingsStore()
const playerRef = ref()
const cameraRef = ref()
const controlsRef = ref()
const playerPos = reactive({ x: 0, z: 0 })
const cameraOffset = reactive({ distance: 10, height: 6 })

// Movement controls
const keys = reactive({
  w: false,
  a: false,
  s: false,
  d: false,
})

const moveSpeed = 5 // units per second

// Camera position that follows player
const cameraPos = computed<[number, number, number]>(() => {
  if (!controlsRef.value?.object) return [0, cameraOffset.height, cameraOffset.distance]

  // Get camera's current spherical position relative to target
  const controls = controlsRef.value
  const offset = new THREE.Vector3()
  offset.copy(controls.object.position).sub(new THREE.Vector3(playerPos.x, 1, playerPos.z))

  return [
    playerPos.x + offset.x,
    1 + offset.y,
    playerPos.z + offset.z
  ]
})

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
  // Check if any movement keys are pressed
  const hasMovement = keys.w || keys.s || keys.a || keys.d
  if (!hasMovement) return

  // TresJS ref.value IS the Three.js object directly
  const camera = cameraRef.value
  if (!camera || typeof camera.getWorldDirection !== 'function') return

  // Get camera forward direction (projected onto XZ plane)
  const forward = new THREE.Vector3()
  camera.getWorldDirection(forward)
  forward.y = 0
  forward.normalize()

  const right = new THREE.Vector3()
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

  // Movement relative to camera direction
  const movement = new THREE.Vector3()

  if (keys.w) movement.add(forward)
  if (keys.s) movement.sub(forward)
  if (keys.d) movement.add(right)
  if (keys.a) movement.sub(right)

  if (movement.length() > 0) {
    movement.normalize()
    playerPos.x += movement.x * moveSpeed * delta
    playerPos.z += movement.z * moveSpeed * delta
  }
})
</script>