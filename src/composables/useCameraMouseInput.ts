import { ref, onUnmounted, type Ref } from 'vue';
import { Mouse, type I_MouseEvent, type I_MouseScrollEvent } from '@/game/utils/Mouse';
import { useGameConfigStore } from '@/stores/config.store';
import type { CameraRotation } from './useCameraRotation';
import type { CameraZoom } from './useCameraZoom';

export interface CameraMouseInput {
  isDragging: Ref<boolean>;
  mouse: Mouse;
}

/**
 * Camera mouse input composable
 * Handles mouse-based camera controls (rotation, zoom, pointer lock)
 */
export function useCameraMouseInput(rotation: CameraRotation, zoom: CameraZoom): CameraMouseInput {
  const config = useGameConfigStore();
  const isDragging = ref(false);

  // Create mouse utility with pointer lock support
  const mouse = new Mouse({
    target: document.body,
    preventContextMenu: true,
    trackScroll: true,
    scrollSensitivity: 0.005, // Smooth zoom (rawDelta per scroll tick)
    autoResetScroll: true, // Reset scroll delta each frame
    supportPointerLock: true,
  });

  // Handle right-click down - request pointer lock and start dragging
  mouse.on('down', (event: I_MouseEvent) => {
    if (event.button === 2) {
      isDragging.value = true;

      // Request pointer lock for MMO-style camera (hides cursor)
      if (config.debug.enableConsoleLog) {
        console.log('🔒 [CameraMouseInput] Requesting pointer lock...');
      }
      mouse.requestPointerLock();
    }
  });

  // Handle mouse move - update camera rotation when dragging
  mouse.on('move', (event: I_MouseEvent) => {
    if (!isDragging.value) return;

    // Use delta from mouse utility (works with pointer lock)
    rotation.update(event.delta.x, event.delta.y);
  });

  // Handle right-click up - exit pointer lock and stop dragging
  mouse.on('up', (event: I_MouseEvent) => {
    if (event.button === 2) {
      isDragging.value = false;

      // Exit pointer lock (show cursor)
      if (config.debug.enableConsoleLog) {
        console.log('🔓 [CameraMouseInput] Releasing pointer lock...');
      }
      mouse.exitPointerLock();
    }
  });

  // Handle scroll - zoom camera (use rawDelta for smooth incremental zoom)
  mouse.on('scroll', (event: I_MouseScrollEvent) => {
    zoom.update(event.rawDelta);
  });

  // Handle pointer lock change
  mouse.on('pointerlockchange', () => {
    if (!mouse.isPointerLocked && isDragging.value) {
      // Pointer lock was exited externally (e.g., user pressed ESC)
      isDragging.value = false;
      if (config.debug.enableConsoleLog) {
        console.log('🔓 [CameraMouseInput] Pointer lock released externally');
      }
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    mouse.destroy();
  });

  return {
    isDragging,
    mouse,
  };
}
