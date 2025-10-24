import { I_SceneContext, I_SceneService } from '../common/scenes.types';
import SceneService from './SceneService';

/**
 * Scene state enum for controlling game behavior
 *
 * - OVERWORLD: Normal gameplay (movement, interactions enabled)
 * - MATCH_INSTANTIATING: Match creation in progress (disable movement, other interactions)
 * - PVE_MATCH: Match active (different control scheme, limited interactions)
 */
export enum E_SceneState {
  OVERWORLD = 'OVERWORLD',
  MATCH_INSTANTIATING = 'MATCH_INSTANTIATING',
  PVE_MATCH = 'PVE_MATCH',
  PVP_MATCH = 'PVP_MATCH',
  MENU = 'MENU',
}

/**
 * SceneStateService - Manages scene state for cross-cutting behavior control
 *
 * This service provides a centralized state machine that other systems can query
 * to determine what actions are allowed in different game states.
 *
 * **Usage**:
 * - MatchModule modifies state during match creation flow
 * - KinematicMovementComponent queries state to prevent movement during transitions
 * - InteractionService can check state to disable interactions
 *
 * **State Transitions**:
 * - OVERWORLD → MATCH_INSTANTIATING (when player initiates match)
 * - MATCH_INSTANTIATING → PVE_MATCH (when match successfully created)
 * - PVE_MATCH → OVERWORLD (when match ends)
 *
 * **Example**:
 * ```typescript
 * // In MatchModule
 * const stateService = context.services.sceneState;
 * stateService.setState(E_SceneState.MATCH_INSTANTIATING);
 *
 * // In KinematicMovementComponent
 * if (stateService.getState() !== E_SceneState.OVERWORLD) {
 *   return; // Disable movement
 * }
 * ```
 */
export default class SceneStateService extends SceneService implements I_SceneService {
  private currentState: E_SceneState = E_SceneState.OVERWORLD;

  /**
   * Initialize the service with default OVERWORLD state
   */
  protected async init(context: I_SceneContext): Promise<void> {
    this.currentState = E_SceneState.OVERWORLD;
    console.log('🎮 [SceneStateService] Initialized with state:', this.currentState);
  }

  /**
   * Get the current scene state
   *
   * @returns Current scene state enum value
   */
  public getState(): E_SceneState {
    return this.currentState;
  }

  /**
   * Set the scene state
   *
   * @param newState - New scene state to transition to
   */
  public setState(newState: E_SceneState): void {
    const oldState = this.currentState;
    this.currentState = newState;
    console.log(`🎮 [SceneStateService] State transition: ${oldState} → ${newState}`);
  }

  /**
   * Check if currently in OVERWORLD state
   */
  public isOverworld(): boolean {
    return this.currentState === E_SceneState.OVERWORLD;
  }

  /**
   * Check if currently instantiating a match
   */
  public isMatchInstantiating(): boolean {
    return this.currentState === E_SceneState.MATCH_INSTANTIATING;
  }

  /**
   * Check if currently in PVE match
   */
  public isPVEMatch(): boolean {
    return this.currentState === E_SceneState.PVE_MATCH;
  }

  /**
   * Reset state to OVERWORLD (useful for cleanup, scene transitions)
   */
  public reset(): void {
    this.setState(E_SceneState.OVERWORLD);
  }

  /**
   * Cleanup service
   */
  public async destroy(): Promise<void> {
    this.reset();
    console.log('🎮 [SceneStateService] Destroyed');
  }
}
