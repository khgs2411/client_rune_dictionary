import { type Ref } from 'vue';

export interface CameraZoom {
  update: (delta: number) => void;
}

/**
 * Camera zoom composable
 * Handles shared zoom logic with distance clamping
 */
export function useCameraZoom(
  distance: Ref<number>,
  limits = { min: 5, max: 20 }
): CameraZoom {
  /**
   * Update camera distance with clamping to min/max limits
   */
  function update(delta: number) {
    distance.value = Math.max(
      limits.min,
      Math.min(limits.max, distance.value + delta)
    );
  }

  return {
    update,
  };
}
