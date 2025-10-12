import { I_GameCamera } from './composables.types';
import { useGameConfigStore } from '@/stores/gameConfig.store';
import { useEventListener } from '@vueuse/core';
import { watchEffect } from 'vue';
import { useCameraController } from './useCameraController';
import { PerspectiveCamera, Vector3 } from 'three';

/**
 * High-level camera entity composable
 * Manages Three.js camera instance and wraps controller logic
 */
export function useCamera(): I_GameCamera {
  const config = useGameConfigStore();

  

  // Initialize pure controller (state/input logic)
  const controller = useCameraController();

  // Create Three.js camera instance
  const instance = new PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect
    0.1, // Near
    1000, // Far
  );

  /**
   * Handle window resize - update camera aspect ratio
   */
  function handleResize() {
    instance.aspect = window.innerWidth / window.innerHeight;
    instance.updateProjectionMatrix();
  }

  /**
   * Initialize camera - set lookAt and update matrices
   */
  function start() {
    instance.lookAt(new Vector3(0, 1, 0));
    instance.updateMatrixWorld(true);

  }

  /**
   * Update camera target (what to look at)
   */
  function update(lookAtVector: Vector3) {
    controller.target.x = lookAtVector.x;
    controller.target.z = lookAtVector.z;
    instance.lookAt(lookAtVector);
  }

  /**
   * Reset camera to defaults
   */
  function reset() {
    controller.reset();
  }

  /**
   * Destroy camera and cleanup
   */
  function destroy() {
    controller.destroy();
  }

  // Auto-sync Three.js camera position with controller state
  watchEffect(() => {
    const offsetX =
      Math.sin(controller.angle.horizontal.value) *
      controller.distance.value *
      Math.cos(controller.angle.vertical.value);
    const offsetZ =
      Math.cos(controller.angle.horizontal.value) *
      controller.distance.value *
      Math.cos(controller.angle.vertical.value);
    const offsetY = Math.sin(controller.angle.vertical.value) * controller.distance.value;

    instance.position.set(
      controller.target.x + offsetX,
      offsetY + 1,
      controller.target.z + offsetZ,
    );
  });

  // Setup resize listener (VueUse auto-cleanup)
  useEventListener('resize', handleResize);

  return {
    // Three.js instance
    instance,

    // Delegated controller state
    controller,

    // Methods
    start,
    update,
    reset,
    destroy,
  };
}
