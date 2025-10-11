import { type Ref } from 'vue';
import { useGameConfig } from '@/stores/gameConfig.store';

export interface CameraRotation {
  updateHorizontal: (delta: number) => void;
  updateVertical: (delta: number) => void;
  update: (deltaH: number, deltaV: number) => void;
}

/**
 * Camera rotation composable
 * Handles shared rotation logic with angle clamping
 */
export function useCameraRotation(
  angleH: Ref<number>,
  angleV: Ref<number>,
  sensitivity = { h: 0.005, v: 0.005 }
): CameraRotation {
  const config = useGameConfig();

  const MIN_VERTICAL = config.camera.angleVMin;
  const MAX_VERTICAL = config.camera.angleVMax;

  /**
   * Update horizontal rotation angle
   */
  function updateHorizontal(delta: number) {
    angleH.value -= delta * sensitivity.h;
  }

  /**
   * Update vertical rotation angle with clamping
   */
  function updateVertical(delta: number) {
    angleV.value = Math.max(
      MIN_VERTICAL,
      Math.min(MAX_VERTICAL, angleV.value + delta * sensitivity.v)
    );
  }

  /**
   * Update both horizontal and vertical angles
   */
  function update(deltaH: number, deltaV: number) {
    updateHorizontal(deltaH);
    updateVertical(deltaV);
  }

  return {
    updateHorizontal,
    updateVertical,
    update,
  };
}
