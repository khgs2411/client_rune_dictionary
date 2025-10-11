import { ref, type Ref } from 'vue';
import { useEventListener, usePointerLock } from '@vueuse/core';
import { useConfigStore } from '@/stores/config.store';
import type { CameraRotation } from './useCameraRotation';
import type { CameraZoom } from './useCameraZoom';

export interface CameraMouseInput {
  isDragging: Ref<boolean>;
}

/**
 * Camera mouse input composable
 * Handles mouse-based camera controls (rotation, zoom, pointer lock)
 */
export function useCameraMouseInput(
  rotation: CameraRotation,
  zoom: CameraZoom
): CameraMouseInput {
  const config = useConfigStore();
  const isDragging = ref(false);

  // Create a ref for document.body to use with usePointerLock
  const targetElement = ref(document.body);

  // VueUse: Pointer lock for MMO-style camera (hide cursor on drag)
  const { isSupported, lock, unlock } = usePointerLock(targetElement);

  /**
   * Handle mouse down - start camera rotation on right-click
   */
  function onMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Only right mouse button
    if (e.button === 2) {
      isDragging.value = true;

      // Request pointer lock for MMO-style camera (hides cursor)
      if (isSupported.value) {
        if (config.debug.enableConsoleLog) {
          console.log('🔒 [CameraMouseInput] Requesting pointer lock...');
        }
        lock(e);
      } else if (config.debug.enableConsoleLog) {
        console.warn('⚠️ [CameraMouseInput] Pointer lock not supported');
      }
    }
  }

  /**
   * Handle mouse move - update camera rotation
   */
  function onMouseMove(e: MouseEvent) {
    if (!isDragging.value) return;

    // Use movementX/Y for pointer lock (relative mouse movement)
    rotation.update(e.movementX, e.movementY);
  }

  /**
   * Handle mouse up - stop camera rotation
   */
  function onMouseUp(e: MouseEvent) {
    if (e.button === 2) {
      isDragging.value = false;

      // Exit pointer lock (show cursor)
      if (config.debug.enableConsoleLog) {
        console.log('🔓 [CameraMouseInput] Releasing pointer lock...');
      }
      unlock();
    }
  }

  /**
   * Prevent context menu on right-click
   */
  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
  }

  /**
   * Handle mouse wheel - zoom camera
   */
  function onWheel(e: WheelEvent) {
    zoom.update(e.deltaY * 0.01);
    e.preventDefault();
  }

  // Setup event listeners (VueUse auto-cleanup)
  useEventListener('mousedown', onMouseDown);
  useEventListener('mousemove', onMouseMove);
  useEventListener('mouseup', onMouseUp);
  useEventListener('contextmenu', onContextMenu);
  useEventListener('wheel', onWheel, { passive: false });

  return {
    isDragging,
  };
}
