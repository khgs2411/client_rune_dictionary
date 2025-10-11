import { ref, watchEffect, type Ref } from 'vue';
import { useEventListener, usePointerLock } from '@vueuse/core';
import * as THREE from 'three';

export type TargetPosition = {
  x: Ref<number>;
  z: Ref<number>;
};

export interface CameraControlsOptions {
  target?: TargetPosition;
}

export interface CameraControls {
  instance: THREE.PerspectiveCamera;
  angle: {
    horizontal: Ref<number>;
    vertical: Ref<number>;
  };
  distance: Ref<number>;
  isDragging: Ref<boolean>;
  target: TargetPosition;

  reset: () => void;
  cleanup: () => void;
}

export function useCameraControls(options: CameraControlsOptions = {}): CameraControls {
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

  console.log('📷 [useCameraController] Camera created with aspect:', instance.aspect);

  // Camera controls
  const cameraDistance = ref(10);
  const cameraAngleH = ref(0); // Horizontal rotation around player
  const cameraAngleV = ref(0.4); // Vertical angle (0 = level, PI/2 = top-down)

  // Mouse/Touch state for camera rotation
  const isDragging = ref(false);

  // VueUse: Pointer lock for MMO-style camera (lock on document.body)
  const { isSupported: isPointerLockSupported, lock, unlock, element: lockedElement } = usePointerLock(document.body);

  // Touch state for mobile controls
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const lastTouchDistance = ref(0);

  // Auto-update camera position when angles/distance/target change
  watchEffect(() => {
    const offsetX =
      Math.sin(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetZ =
      Math.cos(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetY = Math.sin(cameraAngleV.value) * cameraDistance.value;

    instance.position.set(target.x.value + offsetX, offsetY + 1, target.z.value + offsetZ);
  });

  // Handle camera resize
  function handleResize() {
    instance.aspect = window.innerWidth / window.innerHeight;
    instance.updateProjectionMatrix();
  }

  // Cleanup (VueUse handles most cleanup automatically)
  function cleanup() {
    reset();
    isDragging.value = false;
    lastTouchDistance.value = 0;

    // Exit pointer lock if active
    if (lockedElement.value) {
      unlock();
    }
  }

  // Reset camera to defaults
  function reset() {
    cameraDistance.value = 10;
    cameraAngleH.value = 0;
    cameraAngleV.value = 0.4;
  }

  // Mouse handlers for camera rotation (desktop)
  function onMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Only right mouse button
    if (e.button === 2) {
      isDragging.value = true;

      // Request pointer lock for MMO-style camera (VueUse)
      if (isPointerLockSupported) {
        lock(e); // VueUse locks on document.body by default
      }
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

      // Exit pointer lock (VueUse)
      if (lockedElement.value) {
        unlock();
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

  // Touch handlers for mobile camera rotation
  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      // Single finger - camera rotation
      isDragging.value = true;
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      // Two fingers - pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.value = Math.sqrt(dx * dx + dy * dy);
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 1 && isDragging.value) {
      // Single finger - rotate camera
      const deltaX = e.touches[0].clientX - touchStartX.value;
      const deltaY = e.touches[0].clientY - touchStartY.value;

      // Update camera angles
      cameraAngleH.value -= deltaX * 0.01;
      cameraAngleV.value = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.1, cameraAngleV.value + deltaY * 0.01),
      );

      // Update touch start position for next frame
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;

      e.preventDefault();
    } else if (e.touches.length === 2) {
      // Two fingers - pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastTouchDistance.value > 0) {
        const delta = distance - lastTouchDistance.value;
        cameraDistance.value = Math.max(5, Math.min(20, cameraDistance.value - delta * 0.05));
      }

      lastTouchDistance.value = distance;
      e.preventDefault();
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      isDragging.value = false;
      lastTouchDistance.value = 0;
    } else if (e.touches.length === 1) {
      // Reset to single touch
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;
      lastTouchDistance.value = 0;
    }
  }

  // Setup event listeners using VueUse (auto-cleanup on component unmount)
  useEventListener('mousedown', onMouseDown);
  useEventListener('mousemove', onMouseMove);
  useEventListener('mouseup', onMouseUp);
  useEventListener('contextmenu', onContextMenu);
  useEventListener('wheel', onWheel, { passive: false });
  useEventListener('touchstart', onTouchStart, { passive: false });
  useEventListener('touchmove', onTouchMove, { passive: false });
  useEventListener('touchend', onTouchEnd, { passive: false });
  useEventListener('resize', handleResize);

  return {
    instance,
    angle: {
      horizontal: cameraAngleH,
      vertical: cameraAngleV,
    },
    distance: cameraDistance,
    isDragging,
    target,
    reset,
    cleanup,
  };
}
