import MatchAPI, { I_CreatePveMatchRequest } from '@/api/match.api';
import type { I_SceneContext } from '@/game/common/scenes.types';
import { ComponentPriority, GameComponent } from '@/game/GameComponent';
import { E_SceneState } from '@/game/services/SceneStateService';
import { DataStore } from '@/stores/DataStore';
import { InteractionComponent } from '../interactions/InteractionComponent';

/**
 * MatchComponent - Handles PvE match creation from NPC interaction
 *
 * This component listens to double-click events from InteractionComponent
 * and triggers the match creation flow.
 *
 * Responsibilities:
 * - Listen to 'doubleclick' event from InteractionComponent
 * - Validate scene state (must be OVERWORLD)
 * - Call MatchAPI to create PvE match
 * - Update match store with response data
 * - Transition scene state (OVERWORLD → MATCH_INSTANTIATING → PVE_MATCH)
 * - Handle errors and revert state if needed
 *
 * Dependencies:
 * - Requires InteractionComponent (for doubleclick event)
 *
 * Usage:
 * ```typescript
 * const npc = new GameObject({ id: 'training-dummy' })
 *   .addComponent(new TransformComponent({ position: [10, 0, 5] }))
 *   .addComponent(new GeometryComponent({ type: 'capsule' }))
 *   .addComponent(new MaterialComponent({ color: 0xff0000 }))
 *   .addComponent(new MeshComponent())
 *   .addComponent(new InteractionComponent())  // Provides doubleclick event
 *   .addComponent(new MatchComponent());       // Handles match creation
 * ```
 *
 * Priority: INTERACTION (300) - Runs after InteractionComponent
 */
export class MatchComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION;

  private matchAPI: MatchAPI;

  constructor() {
    super();
    this.matchAPI = new MatchAPI();
  }

  async init(context: I_SceneContext): Promise<void> {
    // Require InteractionComponent for event system
    this.onInteraction(context);

    console.log(
      `⚔️ [MatchComponent] Listening for double-click events on GameObject "${this.gameObject.id}"`,
    );
  }

  private onInteraction(context: I_SceneContext) {
    const interaction = this.requireComponent(InteractionComponent);

    // Listen to doubleclick event
    interaction.on('doubleclick', async (_intersection) => {
      console.log('⚔️ [MatchComponent] Double-click detected, initiating match creation...');
      // intersection.distance = distance from camera to hit point
      console.log('Distance from camera:', _intersection.distance);

      // _intersection.point = 3D world position where ray hit the object
      console.log('Hit point:', _intersection.point); // Vector3

      // _intersection.object = the Three.js mesh that was clicked
      console.log('Clicked mesh:', _intersection.object);

      // _intersection.face = the face of the mesh that was hit
      console.log('Face hit:', _intersection.face);

      // _intersection.faceIndex = index of the face
      console.log('Face index:', _intersection.faceIndex);

      // _intersection.uv = UV coordinates at hit point (for textures)
      console.log('UV coords:', _intersection.uv);
      await this.handleMatchCreation(context);
    });
  }

  /**
   * Handle match creation flow
   */
  private async handleMatchCreation(context: I_SceneContext): Promise<void> {
    // Check scene state - must be in OVERWORLD
    const stateService = context.getService('state');
    if (!stateService.isOverworld()) {
      console.warn('⚔️ [MatchComponent] Cannot start match - not in OVERWORLD state');
      return;
    }

    // Transition to MATCH_INSTANTIATING
    stateService.setState(E_SceneState.MATCH_INSTANTIATING);

    try {
      await this.createPveMatch(context);
    } catch (error) {
      this.handleMatchCreationError(error, context);
    }
  }

  /**
   * Create PvE match via API
   */
  private async createPveMatch(context: I_SceneContext): Promise<void> {
    // Get client data from DataStore
    const clientData = DataStore.websocket.clientData;
    if (!clientData) {
      throw new Error('Client not connected - cannot create match');
    }

    console.log('⚔️ [MatchComponent] Creating PvE match...');

    // Make API request
    const payload: I_CreatePveMatchRequest = {
      whoami: clientData,
    };

    const response = await this.matchAPI.createPveMatch(payload);

    console.log('⚔️ [MatchComponent] Match created successfully:', response.matchId);

    // Update match store via DataStore
    DataStore.match.setInitialMatchState({
      matchId: response.matchId,
      channelId: response.channelId,
      channelName: response.channelName,
      state: response.state,
    });

    // Transition to PVE_MATCH state
    const stateService = context.getService('state');
    stateService.setState(E_SceneState.PVE_MATCH);

    console.log('⚔️ [MatchComponent] Match state updated, entering PVE mode');
  }

  /**
   * Handle match creation error - revert to OVERWORLD state
   */
  private handleMatchCreationError(error: any, context: I_SceneContext): void {
    console.error('⚔️ [MatchComponent] Match creation failed:', error);

    // Revert to OVERWORLD state
    const stateService = context.getService('state');
    stateService.setState(E_SceneState.OVERWORLD);

    // TODO: Show error toast notification to user
    // For now, just log to console
    const errorMessage = error instanceof Error ? error.message : 'Failed to create match';
    console.error('⚔️ [MatchComponent] Error message:', errorMessage);
  }

  destroy(): void {
    // Nothing to clean up (InteractionComponent handles its own cleanup)
    console.log(
      `⚔️ [MatchComponent] Destroyed for GameObject "${this.gameObject.id}"`,
    );
  }
}
