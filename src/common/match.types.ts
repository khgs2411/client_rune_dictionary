import { I_ClientData } from '@/common/types';

/**
 * Request payload for creating a PvE match
 */
export interface I_CreatePveMatchRequest {
  whoami: I_ClientData; // Player entity initiating the match
}

/**
 * Request payload for leaving a match
 */
export interface I_LeaveMatchRequest {
  whoami: I_ClientData; // Player entity leaving the match
  matchId: string; // Match ID to leave
}

export type CreatePveMatchResponseData = {
  matchId: string;
  channelId: string;
  channelName: string;
  state: I_GameState;
};

/**
 * Response data from creating a PvE match
 */
export interface I_CreatePveMatchResponse {
  success: boolean;
  data: CreatePveMatchResponseData;
}

/**
 * Stats structure for both player and NPC participants
 */
export interface I_ParticipantStats {
  attack: number;
  defense: number;
  speed: number;
}

/**
 * Player participant data structure
 */
export interface I_PlayerParticipant {
  entityId: string;
  name: string;
  health: number;
  maxHealth: number;
  stats: I_ParticipantStats;
  readiness: number; // ATB readiness (0-100)
}

/**
 * NPC participant data structure (same as player for PvE)
 */
export interface I_NPCParticipant {
  entityId: string;
  name: string;
  health: number;
  maxHealth: number;
  stats: I_ParticipantStats;
  readiness: number; // ATB readiness (0-100)
}

/**
 * Turn state information
 */
export interface I_TurnState {
  number: number;
  currentEntityId: string;
  isPlayerTurn: boolean;
}

/**
 * ATB (Active Time Battle) readiness state
 */
export interface I_ATBState {
  playerReadiness: number; // 0-100 percentage
  npcReadiness: number; // 0-100 percentage
}

/**
 * Timer configuration for turn duration
 */
export interface I_TimerConfig {
  duration: number; // milliseconds per turn
  warningThreshold: number; // percentage threshold for warning (e.g., 80)
  fallbackAction: 'pass' | 'skip'; // action on timeout
  active: boolean; // whether timer is currently running
  remaining: number; // milliseconds remaining in current turn
  elapsed: number; // milliseconds elapsed in current turn
  percentage: number; // percentage of turn elapsed (0-100)
}

/**
 * Complete game state received from server
 */
export interface I_GameState {
  player: I_PlayerParticipant;
  npc: I_NPCParticipant;
  turn: I_TurnState;
  atb: I_ATBState;
  timer: I_TimerConfig;
}

/**
 * Match result data (populated when match ends)
 */
export interface I_MatchResult {
  winner: 'player' | 'npc' | 'draw';
  playerFinalHealth: number;
  npcFinalHealth: number;
  totalTurns: number;
  duration: number; // match duration in seconds
  // Future: Add stats like damage dealt, actions taken, etc.
}

/**
 * Match state enum for UI state machine
 */
export type MatchState = 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';

