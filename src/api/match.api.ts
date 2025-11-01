import {
  CreatePveMatchResponseData,
  I_CreatePveMatchRequest,
  I_CreatePveMatchResponse,
  I_LeaveMatchRequest,
} from '@/common/match.types';
import { BaseAPI } from 'topsyde-utils';

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
 * - POST /match/:matchId/leave - Leave a match
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
  public async createPveMatch(
    payload: I_CreatePveMatchRequest,
  ): Promise<CreatePveMatchResponseData> {
    const response = await this.post<{ status: boolean; data: I_CreatePveMatchResponse }>(
      'pve',
      payload,
    );

    // BaseAPI.Status() throws on error responses (4xx/5xx)
    BaseAPI.Status(response);

    return response.data.data.data;
  }

  /**
   * Leave a match
   *
   * @param payload - Player entity data and match ID
   * @returns Success message
   * @throws Error if request fails or server returns error
   */
  public async leaveMatch(payload: I_LeaveMatchRequest): Promise<{ message: string }> {
    const response = await this.post<{ status: boolean; data: { message: string } }>(
      'leave',
      payload,
    );

    // BaseAPI.Status() throws on error responses (4xx/5xx)
    BaseAPI.Status(response);

    return response.data.data;
  }
}
