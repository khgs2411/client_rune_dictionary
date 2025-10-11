import { I_CharacterControlsOptions } from '@/common/types';
import { useConfigStore } from '@/stores/config.store';
import { I_GameCharacter } from './composables.types';
import { useCharacterController } from './useCharacterController';



/**
 * High-level character entity composable
 * Wraps character controller and could handle Three.js mesh in the future
 */
export function useCharacter(options: I_CharacterControlsOptions): I_GameCharacter {
  const config = useConfigStore();

  if (config.debug.enableConsoleLog) {
    console.log('      ↳ Initializing character composable...');
  }

  // Initialize pure controller (state/input logic)
  const controller = useCharacterController(options);

  /**
   * Update character state (called every frame)
   */
  function update(delta: number) {
    controller.update(delta);
  }

  /**
   * Reset character to defaults
   */
  function reset() {
    controller.reset();
  }

  /**
   * Destroy character and cleanup
   */
  function destroy() {
    if (config.debug.enableConsoleLog) {
      console.log('      ↳ Cleaning up character controller...');
    }
    controller.destroy();
  }

  if (config.debug.enableConsoleLog) {
    console.log('      ↳ Character composable ready');
  }

  return {
    // Delegated controller state
    controller,

    // Methods
    update,
    reset,
    destroy,
  };
}
