import { I_ClientData } from '@/common/types';
import { I_GameState } from '@/stores/match.store';
import { BaseAPI } from 'topsyde-utils';

// ============================================================================
// Request/Response Types
// ============================================================================

/**
 * Request payload for creating a PvE match
 */
export interface I_CreatePveMatchRequest {
  whoami: I_ClientData; // Player entity initiating the match
}

export type CreatePveMatchResponseData = {
  matchId: string;
  channelId: string;
  channelName: string;
  state: I_GameState;
}

/**
 * Response data from creating a PvE match
 */
export interface I_CreatePveMatchResponse {
  success: boolean;
  data: CreatePveMatchResponseData;
}

// ============================================================================
// MatchAPI Class
// ============================================================================

/**
 * MatchAPI - Handles HTTP requests to the matchmaking server
 *
 * Extends BaseAPI from topsyde-utils for consistent error handling
 * and request/response patterns.
 *
 * Endpoints:
 * - POST /match/pve - Create a PvE match
 */
export default class MatchAPI extends BaseAPI {
  constructor() {
    super('match', import.meta.env.VITE_HOST);
  }

  /**
   * Create a PvE match
   *
   * @param payload - Player entity data
   * @returns Match initialization data (matchId, channelId, channelName, initial game state)
   * @throws Error if request fails or server returns error
   */
  public async createPveMatch(payload: I_CreatePveMatchRequest): Promise<CreatePveMatchResponseData> {
    const response = await this.post<{ status: boolean, data: I_CreatePveMatchResponse }>('pve', payload);

    // BaseAPI.Status() throws on error responses (4xx/5xx)
    BaseAPI.Status(response);

    return response.data.data.data;
  }
}
