import { I_GameCharacter } from './composables.types';
import { useConfigStore } from '@/stores/config.store';
import type { Ref } from 'vue';
import { useCharacterController } from './useCharacterController';

export interface CharacterOptions {
  cameraAngleH: Ref<number>;
}

/**
 * High-level character entity composable
 * Wraps character controller and could handle Three.js mesh in the future
 */
export function useCharacter(options: CharacterOptions): I_GameCharacter {
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
    console.log('      ↳ Character controller ready');
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
