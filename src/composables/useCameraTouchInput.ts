import { ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { CameraRotation } from './useCameraRotation';
import type { CameraZoom } from './useCameraZoom';

/**
 * Camera touch input composable
 * Handles touch-based camera controls (rotation, pinch zoom)
 * Note: Returns empty object as it only produces side effects
 */
export function useCameraTouchInput(
  rotation: CameraRotation,
  zoom: CameraZoom
) {
  // Touch-specific state
  const isTouchDragging = ref(false);
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const lastTouchDistance = ref(0);

  /**
   * Handle touch start - begin rotation or pinch zoom
   */
  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      // Single finger - camera rotation
      isTouchDragging.value = true;
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      // Two fingers - pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.value = Math.sqrt(dx * dx + dy * dy);
    }
  }

  /**
   * Handle touch move - update rotation or zoom
   */
  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 1 && isTouchDragging.value) {
      // Single finger - rotate camera
      const deltaX = e.touches[0].clientX - touchStartX.value;
      const deltaY = e.touches[0].clientY - touchStartY.value;

      // Update rotation (2x multiplier for better touch sensitivity)
      rotation.update(deltaX * 2, deltaY * 2);

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
        zoom.update(-delta * 0.05);
      }

      lastTouchDistance.value = distance;
      e.preventDefault();
    }
  }

  /**
   * Handle touch end - reset touch state
   */
  function onTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      // All fingers lifted
      isTouchDragging.value = false;
      lastTouchDistance.value = 0;
    } else if (e.touches.length === 1) {
      // Reset to single touch
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;
      lastTouchDistance.value = 0;
    }
  }

  // Setup event listeners (VueUse auto-cleanup)
  useEventListener('touchstart', onTouchStart, { passive: false });
  useEventListener('touchmove', onTouchMove, { passive: false });
  useEventListener('touchend', onTouchEnd, { passive: false });

  // No public API needed - side effects only
  return {};
}
