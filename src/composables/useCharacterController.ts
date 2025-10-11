import { I_CharacterControls, I_CharacterControlsOptions } from '@/common/types';
import { useCharacterJump } from './useCharacterJump';
import { useCharacterMovement } from './useCharacterMovement';
import { useJoystick } from './useJoystick';



/**
 * Main character controls composable
 * Orchestrates movement, jump, and joystick composables
 */
export function useCharacterControls(options: I_CharacterControlsOptions): I_CharacterControls {
  const { cameraAngleH } = options;

  console.log('🎮 [Character] Initializing...');

  // Compose smaller, focused composables
  const joystick = useJoystick();
  const jump = useCharacterJump();
  const movement = useCharacterMovement();

  console.log('✅ [Character] Initialized');

  /**
   * Update character state (call every frame)
   */
  function update(delta: number) {
    // Update movement with keyboard + joystick input
    movement.update(
      delta,
      cameraAngleH.value,
      joystick.inputX.value,
      joystick.inputZ.value
    );

    // Update jump physics
    jump.update(movement.position.y, delta);
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
    console.log('🧹 [Character] Starting cleanup...');
    reset();
    console.log('✅ [Character] Cleanup complete');
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

    update,
    reset,
    destroy,
  };
}
