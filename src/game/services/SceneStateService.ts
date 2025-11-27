import { useRxjs } from 'topsyde-utils';
import { I_SceneContext, I_SceneService } from '../common/scenes.types';
import SceneService from './SceneService';

/**
 * Scene state enum for controlling game behavior
 *
 * - OVERWORLD: Normal gameplay (movement, interactions enabled)
 * - MATCH_REQUEST: Match requested, API call in progress
 * - PVE_MATCH: Match active (different control scheme, limited interactions)
 */
export enum E_SceneState {
  OVERWORLD = 'OVERWORLD',
  MATCH_REQUEST = 'MATCH_REQUEST',
  PVE_MATCH = 'PVE_MATCH',
  PVP_MATCH = 'PVP_MATCH',
  MENU = 'MENU',
}

/**
 * Callback function signature for state change listeners
 * @param newState - The new state being transitioned to
 * @param oldState - The previous state before transition
 */
export type StateChangeCallback = (newState: E_SceneState, oldState: E_SceneState) => void;

/**
 * SceneStateService - Manages scene state for cross-cutting behavior control
 *
 * This service provides a centralized state machine that other systems can query
 * to determine what actions are allowed in different game states.
 *
 * **Event-Driven Pattern**:
 * Components can register callbacks to react to state changes instead of polling.
 *
 * **Usage**:
 * - MatchModule modifies state during match creation flow
 * - KinematicMovementComponent registers for state changes to control movement
 * - InteractionService can check state to disable interactions
 *
 * **State Transitions**:
 * - OVERWORLD → MATCH_REQUEST (when player initiates match)
 * - MATCH_REQUEST → PVE_MATCH (when match successfully created)
 * - PVE_MATCH → OVERWORLD (when match ends)
 *
 * **Example**:
 * ```typescript
 * // Register for state changes
 * const callback = (newState, oldState) => {
 * };
 * stateService.register(callback);
 *
 * // Trigger state change (notifies all registered callbacks)
 * stateService.setState(E_SceneState.MATCH_REQUEST);
 *
 * // Cleanup
 * stateService.unregister(callback);
 * ```
 */
export default class SceneStateService extends SceneService implements I_SceneService {
  private currentState: E_SceneState = E_SceneState.OVERWORLD;
  private rxjs = useRxjs('scene:state', undefined, { static_instance: true });
  private listeners: Set<StateChangeCallback> = new Set();

  /**
   * Initialize the service with default OVERWORLD state
   */
  protected async init(context: I_SceneContext): Promise<void> {
    this.currentState = E_SceneState.OVERWORLD;
    this.rxjs.$subscribe({
      onStateChange: this.onStateChange.bind(this),
    });
  }

  private onStateChange(newState: E_SceneState) {
    this.setState(newState);
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
   * Set the scene state and notify all registered listeners
   *
   * @param newState - New scene state to transition to
   */
  public setState(newState: E_SceneState): void {
    const oldState = this.currentState;
    this.currentState = newState;

    // Notify all registered listeners
    this.notifyListeners(newState, oldState);
  }

  /**
   * Register a callback to be notified of state changes
   *
   * @param callback - Function to call when state changes
   * @example
   * ```typescript
   * stateService.register((newState, oldState) => {
   *   if (newState === E_SceneState.PVE_MATCH) {
   *     // Match started - disable movement
   *   }
   * });
   * ```
   */
  public register(callback: StateChangeCallback): void {
    this.listeners.add(callback);
  }

  /**
   * Unregister a callback from state change notifications
   *
   * @param callback - The same function reference that was registered
   */
  public unregister(callback: StateChangeCallback): void {
    const wasRemoved = this.listeners.delete(callback);
    if (wasRemoved) {
    }
  }

  /**
   * Notify all registered listeners of a state change
   *
   * @param newState - The new state
   * @param oldState - The previous state
   */
  private notifyListeners(newState: E_SceneState, oldState: E_SceneState): void {
    if (this.listeners.size === 0) return;

    this.listeners.forEach((callback) => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('🎮 [SceneStateService] Error in listener callback:', error);
      }
    });
  }

  /**
   * Check if currently in OVERWORLD state
   */
  public isOverworld(): boolean {
    return this.currentState === E_SceneState.OVERWORLD;
  }

  /**
   * Check if a match has been requested (API call in progress)
   */
  public isMatchRequested(): boolean {
    return this.currentState === E_SceneState.MATCH_REQUEST;
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
    this.listeners.clear();
    this.rxjs.$unsubscribe();
  }
}
