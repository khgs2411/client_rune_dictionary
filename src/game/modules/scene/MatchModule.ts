import MatchAPI, { I_CreatePveMatchRequest } from '@/api/match.api';
import { I_SceneContext, I_SceneModule } from '@/game/common/scenes.types';
import SceneModule from '@/game/modules/SceneModule';
import { E_SceneState } from '@/game/services/SceneStateService';
import { useMatchStore } from '@/stores/match.store';
import { useWebSocketStore } from '@/stores/websocket.store';

/**
 * MatchModule - Handles match creation from game world interactions
 *
 * Responsibilities:
 * - Listen for double-click on NPC/player objects via InteractionService
 * - Initiate match creation flow (HTTP request to /match/pve)
 * - Update SceneStateService during transitions
 * - Populate match store with server response
 * - Orchestrate game mode shift (hide non-participants)
 * - Handle errors and revert to OVERWORLD state
 *
 * State transitions:
 * 1. OVERWORLD → MATCH_INSTANTIATING (on double-click)
 * 2. MATCH_INSTANTIATING → PVE_MATCH (on successful API response)
 * 3. PVE_MATCH → OVERWORLD (on match end)
 *
 * Usage:
 * ```typescript
 * scene.addModule('match', new MatchModule());
 * ```
 */
export default class MatchModule extends SceneModule implements I_SceneModule {
  private matchAPI: MatchAPI;
  private matchStore: ReturnType<typeof useMatchStore>;
  private websocketStore: ReturnType<typeof useWebSocketStore>;

  // Double-click detection state
  private lastClickTime = 0;
  private lastClickedObjectId: string | null = null;
  private readonly DOUBLE_CLICK_THRESHOLD = 300; // milliseconds

  constructor() {
    super('MatchModule');
    this.matchAPI = new MatchAPI();
    this.matchStore = useMatchStore();
    this.websocketStore = useWebSocketStore();
  }

  protected async init(context: I_SceneContext): Promise<void> {
    await super.init(context);

    // Register click handler with InteractionService for all objects
    // We'll filter for NPCs/players in the handler itself
    context.services.interaction.registerMouseClick(
      'match-module-click',
      'left',
      this.handleObjectClick.bind(this),
      { requireHover: true } // Only trigger on objects user is hovering
    );

    console.log('⚔️ [MatchModule] Initialized - listening for NPC/player double-clicks');
  }

  /**
   * Handle mouse click on objects - detect double-click on NPCs/players
   */
  private handleObjectClick(event: MouseEvent, objectId?: string): void {
    if (!objectId) return;

    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - this.lastClickTime;

    // Check for double-click on same object
    if (
      this.lastClickedObjectId === objectId &&
      timeSinceLastClick < this.DOUBLE_CLICK_THRESHOLD
    ) {
      // Double-click detected!
      this.handleDoubleClick(objectId);

      // Reset double-click state
      this.lastClickTime = 0;
      this.lastClickedObjectId = null;
    } else {
      // First click or different object
      this.lastClickTime = currentTime;
      this.lastClickedObjectId = objectId;
    }
  }

  /**
   * Handle double-click on object - check if it's NPC/player and initiate match
   */
  private async handleDoubleClick(objectId: string): Promise<void> {
    // TODO: Filter for NPCs/players only (check object type/tags)
    // For now, accept any double-clicked object as potential match target

    console.log('⚔️ [MatchModule] Double-click detected on:', objectId);

    // Check if already in match or instantiating
    const stateService = this.context.services.sceneState;
    if (!stateService.isOverworld()) {
      console.warn('⚔️ [MatchModule] Cannot start match - not in OVERWORLD state');
      return;
    }

    // Transition to MATCH_INSTANTIATING
    stateService.setState(E_SceneState.MATCH_INSTANTIATING);

    try {
      await this.createPveMatch();
    } catch (error) {
      this.handleMatchCreationError(error);
    }
  }

  /**
   * Create PvE match via API
   */
  private async createPveMatch(): Promise<void> {
    // Get client data from websocket store
    const clientData = this.websocketStore.clientData;
    if (!clientData) {
      throw new Error('Client not connected - cannot create match');
    }

    console.log('⚔️ [MatchModule] Creating PvE match...');

    // Make API request
    const payload: I_CreatePveMatchRequest = {
      whoami: clientData,
    };

    const response = await this.matchAPI.createPveMatch(payload);

    console.log('⚔️ [MatchModule] Match created successfully:', response.matchId);

    // Populate match store
    this.matchStore.initializeMatch({
      matchId: response.matchId,
      channelId: response.channelId,
      channelName: response.channelName,
      state: response.state,
    });

    // Transition to PVE_MATCH state
    const stateService = this.context.services.sceneState;
    stateService.setState(E_SceneState.PVE_MATCH);

    // Execute game mode shift
    this.enterPVEMode();
  }

  /**
   * Enter PVE mode - hide non-participants
   */
  private enterPVEMode(): void {
    console.log('⚔️ [MatchModule] Entering PVE mode - hiding non-participants');

    // TODO: Implement visibility management
    // 1. Get all player objects in scene
    // 2. Hide all players except match participants
    // 3. Keep environment objects visible (trees, ground, etc.)

    // Placeholder for now
    console.warn('⚔️ [MatchModule] TODO: Implement object visibility management');
  }

  /**
   * Handle match creation error - revert to OVERWORLD
   */
  private handleMatchCreationError(error: any): void {
    console.error('⚔️ [MatchModule] Match creation failed:', error);

    // Revert to OVERWORLD state
    const stateService = this.context.services.sceneState;
    stateService.setState(E_SceneState.OVERWORLD);

    // TODO: Show error message to user
    // Could use a toast notification service or HUD message
    const errorMessage = error instanceof Error ? error.message : 'Failed to create match';
    console.error('⚔️ [MatchModule] Error:', errorMessage);
  }

  /**
   * Exit PVE mode - show all players again
   */
  public exitPVEMode(): void {
    console.log('⚔️ [MatchModule] Exiting PVE mode - restoring object visibility');

    // TODO: Restore visibility of all players

    // Reset to OVERWORLD state
    const stateService = this.context.services.sceneState;
    stateService.setState(E_SceneState.OVERWORLD);
  }

  public async destroy(): Promise<void> {
    // Cleanup will be handled by CleanupRegistry
    console.log('⚔️ [MatchModule] Destroyed');
  }
}
