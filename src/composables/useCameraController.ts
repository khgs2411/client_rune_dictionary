import { reactive, ref, watchEffect } from 'vue';
import { useEventListener } from '@vueuse/core';
import * as THREE from 'three';
import { useConfigStore } from '@/stores/config.store';
import { useCameraRotation } from './useCameraRotation';
import { useCameraZoom } from './useCameraZoom';
import { useCameraMouseInput } from './useCameraMouseInput';
import { useCameraTouchInput } from './useCameraTouchInput';
import { I_CameraControls, I_CameraControlsOptions } from './composables.types';

/**
 * Main camera controls composable
 * Orchestrates rotation, zoom, mouse, and touch composables
 */
export function useCameraController(): I_CameraControls {
  const config = useConfigStore();

  const target = reactive({ x: 0, z: 0, y: 0 })

  // Create Three.js camera instance
  const instance = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect
    0.1, // Near
    1000 // Far
  );

  if (config.debug.enableConsoleLog) {
    console.log('📷 [useCameraController] Camera created');
  }

  // Camera state from config
  const cameraDistance = ref(config.camera.initialDistance);
  const cameraAngleH = ref(config.camera.initialAngleH);
  const cameraAngleV = ref(config.camera.initialAngleV);

  // Compose smaller, focused composables (pass config sensitivity/limits)
  const rotation = useCameraRotation(
    cameraAngleH,
    cameraAngleV,
    { h: config.camera.mouseSensitivityH, v: config.camera.mouseSensitivityV }
  );
  const zoom = useCameraZoom(
    cameraDistance,
    { min: config.camera.zoomMin, max: config.camera.zoomMax }
  );
  const mouse = useCameraMouseInput(rotation, zoom);
  useCameraTouchInput(rotation, zoom); // Side effects only

  // Auto-update camera position when angles/distance/target change
  watchEffect(() => {
    const offsetX =
      Math.sin(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetZ =
      Math.cos(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetY = Math.sin(cameraAngleV.value) * cameraDistance.value;

    instance.position.set(target.x + offsetX, offsetY + 1, target.z + offsetZ);
  });

  /**
   * Handle camera resize
   */
  function handleResize() {
    instance.aspect = window.innerWidth / window.innerHeight;
    instance.updateProjectionMatrix();
  }

  /**
   * Start camera controls
   */
  function start() {
    instance.lookAt(new THREE.Vector3(0, 1, 0));
    instance.updateMatrixWorld(true);
  }

  /**
   * Reset camera to defaults
   */
  function reset() {
    cameraDistance.value = config.camera.initialDistance;
    cameraAngleH.value = config.camera.initialAngleH;
    cameraAngleV.value = config.camera.initialAngleV;
  }

  /**
   * destroy (VueUse composables handle auto-destroy)
   */
  function destroy() {
    reset();
    mouse.isDragging.value = false;
  }

  function update(lookAtVector: THREE.Vector3) {

    target.x = lookAtVector.x;
    target.z = lookAtVector.z;
    instance.lookAt(lookAtVector);
  }

  // Setup resize listener (VueUse auto-destroy)
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
    start,
    update,
    reset,
    destroy,
  };
}
