import { ref, watchEffect } from 'vue';
import { useEventListener } from '@vueuse/core';
import * as THREE from 'three';
import { I_CameraControlsOptions, I_CameraControls } from '@/common/types';
import { useCameraRotation } from './useCameraRotation';
import { useCameraZoom } from './useCameraZoom';
import { useCameraMouseInput } from './useCameraMouseInput';
import { useCameraTouchInput } from './useCameraTouchInput';

/**
 * Main camera controls composable
 * Orchestrates rotation, zoom, mouse, and touch composables
 */
export function useCameraControls(options: I_CameraControlsOptions = {}): I_CameraControls {
  const target = options.target || {
    x: ref(0),
    z: ref(0),
  };

  // Create Three.js camera instance
  const instance = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect
    0.1, // Near
    1000 // Far
  );

  console.log('📷 [useCameraController] Camera created');

  // Camera state
  const cameraDistance = ref(10);
  const cameraAngleH = ref(0); // Horizontal rotation around player
  const cameraAngleV = ref(0.4); // Vertical angle (0 = level, PI/2 = top-down)

  // Compose smaller, focused composables
  const rotation = useCameraRotation(cameraAngleH, cameraAngleV);
  const zoom = useCameraZoom(cameraDistance);
  const mouse = useCameraMouseInput(rotation, zoom);
  useCameraTouchInput(rotation, zoom); // Side effects only

  // Auto-update camera position when angles/distance/target change
  watchEffect(() => {
    const offsetX =
      Math.sin(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetZ =
      Math.cos(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetY = Math.sin(cameraAngleV.value) * cameraDistance.value;

    instance.position.set(target.x.value + offsetX, offsetY + 1, target.z.value + offsetZ);
  });

  /**
   * Handle camera resize
   */
  function handleResize() {
    instance.aspect = window.innerWidth / window.innerHeight;
    instance.updateProjectionMatrix();
  }

  /**
   * Reset camera to defaults
   */
  function reset() {
    cameraDistance.value = 10;
    cameraAngleH.value = 0;
    cameraAngleV.value = 0.4;
  }

  /**
   * Cleanup (VueUse composables handle auto-cleanup)
   */
  function cleanup() {
    reset();
    mouse.isDragging.value = false;
  }

  // Setup resize listener (VueUse auto-cleanup)
  useEventListener('resize', handleResize);

  return {
    instance,
    angle: {
      horizontal: cameraAngleH,
      vertical: cameraAngleV,
    },
    distance: cameraDistance,
    isDragging: mouse.isDragging,
    target,
    reset,
    cleanup,
  };
}
