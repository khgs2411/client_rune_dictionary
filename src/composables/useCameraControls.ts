import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { usePointerLock } from '@vueuse/core';
import type { Camera } from 'three';

export interface CameraControlsOptions {
  target: {
    x: Ref<number>;
    z: Ref<number>;
  };
}

export interface CameraControls {
  angle: {
    horizontal: Ref<number>;
    vertical: Ref<number>;
  };
  distance: Ref<number>;
  position: ComputedRef<[number, number, number]>;
  isDragging: Ref<boolean>;

  updateLookAt: (camera: Camera, targetX: number, targetZ: number) => void;
  reset: () => void;
  cleanup: () => void;
}

export function useCameraControls(options: CameraControlsOptions): CameraControls {
  const { target } = options;

  // Camera controls
  const cameraDistance = ref(10);
  const cameraAngleH = ref(0); // Horizontal rotation around player
  const cameraAngleV = ref(0.4); // Vertical angle (0 = level, PI/2 = top-down)

  // Mouse state for camera rotation
  const isDragging = ref(false);

  // Pointer lock for MMO-style camera (hides cursor, locks in place)
  const canvasTarget = ref<HTMLElement>();
  const { isSupported: isPointerLockSupported } = usePointerLock(canvasTarget);

  // Camera position (calculated from angles and distance)
  const cameraPosition = computed<[number, number, number]>(() => {
    const offsetX =
      Math.sin(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetZ =
      Math.cos(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetY = Math.sin(cameraAngleV.value) * cameraDistance.value;

    return [target.x.value + offsetX, offsetY + 1, target.z.value + offsetZ];
  });

  // Mouse handlers for camera rotation
  function onMouseDown(e: MouseEvent) {
    // Only right mouse button
    if (e.button === 2) {
      isDragging.value = true;

      // Request pointer lock for MMO-style camera
      if (isPointerLockSupported && document.body) {
        document.body.requestPointerLock();
      }

      e.preventDefault();
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging.value) return;

    // Use movementX/Y for pointer lock (relative mouse movement)
    const deltaX = e.movementX;
    const deltaY = e.movementY;

    // Update camera angles (invert Y for natural camera feel)
    cameraAngleH.value -= deltaX * 0.005;
    cameraAngleV.value = Math.max(
      0.1,
      Math.min(Math.PI / 2 - 0.1, cameraAngleV.value + deltaY * 0.005),
    );
  }

  function onMouseUp(e: MouseEvent) {
    if (e.button === 2) {
      isDragging.value = false;

      // Exit pointer lock
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  }

  function onContextMenu(e: MouseEvent) {
    e.preventDefault(); // Prevent right-click context menu
  }

  function onWheel(e: WheelEvent) {
    // Zoom in/out
    cameraDistance.value = Math.max(5, Math.min(20, cameraDistance.value + e.deltaY * 0.01));
    e.preventDefault();
  }

  // Make camera look at target
  function updateLookAt(camera: Camera, targetX: number, targetZ: number) {
    camera.lookAt(targetX, 1, targetZ);
  }

  // Reset camera to defaults
  function reset() {
    cameraDistance.value = 10;
    cameraAngleH.value = 0;
    cameraAngleV.value = 0.4;
  }

  // Cleanup event listeners
  function cleanup() {
    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('contextmenu', onContextMenu);
    window.removeEventListener('wheel', onWheel);

    isDragging.value = false;

    // Exit pointer lock if active
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  // Initialize event listeners
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('wheel', onWheel, { passive: false });

  return {
    angle: {
      horizontal: cameraAngleH,
      vertical: cameraAngleV,
    },
    distance: cameraDistance,
    position: cameraPosition,
    isDragging,

    updateLookAt,
    reset,
    cleanup,
  };
}
