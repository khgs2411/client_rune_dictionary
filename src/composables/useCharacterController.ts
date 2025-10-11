import { useGameConfig } from '@/stores/gameConfig.store';
import { useCharacterJump } from './useCharacterJump';
import { useCharacterMovement } from './useCharacterMovement';
import { useJoystick } from './useJoystick';
import { I_CharacterControls } from './composables.types';
import { I_CharacterControlsOptions } from '@/common/types';
import { Vector3 } from 'three';

/**
 * Main character controls composable
 * Orchestrates movement, jump, and joystick composables
 */
export function useCharacterController(options: I_CharacterControlsOptions): I_CharacterControls {
  const config = useGameConfig();
  const { cameraAngleH } = options;

  if (config.debug.enableConsoleLog) {
    console.log('         ↳ Character controller initializing...');
  }

  // Compose smaller, focused composables
  const joystick = useJoystick();
  const jump = useCharacterJump();
  const movement = useCharacterMovement();

  if (config.debug.enableConsoleLog) {
    console.log('         ↳ Character controller ready');
  }

  /**
   * Update character state (call every frame)
   */
  function update(delta: number) {
    // Update movement with keyboard + joystick input
    movement.update(delta, cameraAngleH.value, joystick.inputX.value, joystick.inputZ.value);

    // Update jump physics
    jump.update(movement.position.y, delta);
  }

  
  /**
   * Returns the current position of the character as a `Vector3`.
   * The X and Z coordinates are taken from the movement state, while the Y coordinate is fixed at 1
   * to maintain a consistent height for lookAt operations.
   *
   * @returns {Vector3} The position vector with fixed height.
   */
  function getPosition(): Vector3 {
    return new Vector3(
      movement.position.x.value,
      1, // Fixed height for lookAt
      movement.position.z.value,
    )
  }

  /**
   * Reset all character state
   */
  function reset() {
    movement.reset();
    jump.reset();
  }

  /**
   * Cleanup (VueUse composables handle auto-cleanup)
   */
  function destroy() {
    if (config.debug.enableConsoleLog) {
      console.log('         ↳ Resetting character state...');
    }
    reset();
    if (config.debug.enableConsoleLog) {
      console.log('         ↳ Character controller cleanup complete');
    }
  }

  return {
    position: movement.position,
    rotation: movement.rotation,
    speed: movement.speed,
    isJumping: jump.isJumping,
    joystick: {
      active: joystick.active,
      x: joystick.x,
      y: joystick.y,
      startX: joystick.startX,
      startY: joystick.startY,
    },

    getPosition,
    update,
    reset,
    destroy,
  };
}
