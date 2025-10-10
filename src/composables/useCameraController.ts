import { useTresContext } from '@tresjs/core';
import type { Camera } from 'three';
import { PerspectiveCamera } from 'three';
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue';

export type TargetPosition = {
  x: Ref<number>;
  z: Ref<number>;
};

export interface CameraControlsOptions {
  target?: TargetPosition;
}

export interface CameraControls {
  angle: {
    horizontal: Ref<number>;
    vertical: Ref<number>;
  };
  distance: Ref<number>;
  position: ComputedRef<[number, number, number]>;
  isDragging: Ref<boolean>;
  cameraRef: Ref<PerspectiveCamera | undefined>;
  target: TargetPosition;

  lookAt: (targetX: number, targetZ: number) => void;
  reset: () => void;
  cleanup: () => void;
}

export function useCameraControls(options: CameraControlsOptions = {}): CameraControls {
  const target = options.target || {
    x: ref(0),
    z: ref(0),
  };

  // Get TresJS camera manager
  const { camera: cm } = useTresContext();

  // Camera reference
  const cameraRef = ref<PerspectiveCamera>();

  // Camera controls
  const cameraDistance = ref(10);
  const cameraAngleH = ref(0); // Horizontal rotation around player
  const cameraAngleV = ref(0.4); // Vertical angle (0 = level, PI/2 = top-down)

  // Mouse/Touch state for camera rotation
  const isDragging = ref(false);
  const isPointerLockActive = ref(false);

  // Touch state for mobile controls
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const lastTouchDistance = ref(0);

  // Camera position (calculated from angles and distance)
  const cameraPosition = computed<[number, number, number]>(() => {
    const offsetX =
      Math.sin(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetZ =
      Math.cos(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
    const offsetY = Math.sin(cameraAngleV.value) * cameraDistance.value;

    return [target.x.value + offsetX, offsetY + 1, target.z.value + offsetZ];
  });


  // Update camera position and make it look at target
  function lookAt(targetX: number, targetZ: number) {
    if (!cameraRef.value) return;

    // Update position from computed value
    const [x, y, z] = cameraPosition.value;
    cameraRef.value.position.set(x, y, z);

    // Update look at
    cameraRef.value.lookAt(targetX, 1, targetZ);
  }

  function startCamera() {
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('wheel', onWheel, { passive: false });

    // Initialize touch event listeners for mobile
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });

    const cam = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const [x, y, z] = cameraPosition.value;
    cam.position.set(x, y, z);

    // Register with TresJS as active camera
    cm.registerCamera(cam, true);

    cameraRef.value = cam;
  }

  // Cleanup event listeners
  function cleanup() {
    // Deregister camera from TresJS
    console.log('📷 Deregistering camera from TresJS');
    if (cameraRef.value) {
      cm.deregisterCamera(cameraRef.value);
    }

    reset();

    // Remove mouse event listeners
    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('contextmenu', onContextMenu);
    window.removeEventListener('wheel', onWheel);

    // Remove touch event listeners
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);

    isDragging.value = false;
    isPointerLockActive.value = false;
    lastTouchDistance.value = 0;

    // Exit pointer lock if active
    if (document.pointerLockElement) {
      document.exitPointerLock();
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
    // Only right mouse button
    if (e.button === 2) {
      isDragging.value = true;

      // Request pointer lock for MMO-style camera
      if (document.body && 'requestPointerLock' in document.body) {
        document.body.requestPointerLock();
        isPointerLockActive.value = true;
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
        isPointerLockActive.value = false;
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



  // Create and register camera on mount
  onMounted(() => {
    // Initialize event listeners
    startCamera();
  });

  return {
    angle: {
      horizontal: cameraAngleH,
      vertical: cameraAngleV,
    },
    distance: cameraDistance,
    position: cameraPosition,
    isDragging,
    cameraRef,
    target,
    reset,
    lookAt,
    cleanup,
  };

}
