import { inject, type InjectionKey } from 'vue';
import type { CameraControls } from './useCameraController';
import type { CharacterControls } from './useCharacterController';
import type { Scene } from './useScene';

export interface GameContext {
  camera$?: CameraControls;
  character$?: CharacterControls;
  scene$: Scene;

  /**
   * Register a custom update callback for this scene
   * Called after standard camera/character updates
   * Returns a cleanup function to unregister the callback
   */
  registerCustomUpdate?: (callback: (delta: number) => void) => () => void;
}

export const GameContextKey: InjectionKey<GameContext> = Symbol('game-context');

/**
 * Inject the game context provided by Game.vue
 *
 * @returns Game context with camera, character, and scene refs
 *
 * @example
 * const { camera$, character$, scene$ } = useGameContext();
 *
 * // Just HMR in scene file
 * onHotReload(scene$);
 */
export function useGameContext(): GameContext {
  const context = inject(GameContextKey);

  if (!context) {
    throw new Error('useGameContext must be used within Game.vue or a child component');
  }

  return context;
}
