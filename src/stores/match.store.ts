import { I_ATBState, I_GameState, I_MatchResult, I_TurnState, MatchState } from '@/common/match.types';
import { useWebSocketStore } from '@/stores/websocket.store';
import { defineStore } from 'pinia';
import { Lib, WebsocketStructuredMessage } from 'topsyde-utils';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

export const useMatchStore = defineStore(
  'match',
  () => {

    const websocket = useWebSocketStore();


    // ========================================================================
    // State
    // ========================================================================

    /**
     * Current match identifier (UUID from server)
     */
    const currentMatchId = ref<string | null>(null);

    /**
     * Current WebSocket channel identifier
     */
    const currentChannelId = ref<string | null>(null);

    /**
     * WebSocket channel name
     */
    const channelName = ref<string | null>(null);

    /**
     * Current match state for UI state machine
     */
    const matchState = ref<MatchState>('LOBBY');

    /**
     * WebSocket connection status for match channel
     */
    const isConnectedToMatch = ref<boolean>(false);

    /**
     * Complete game state (player, npc, turn, atb, timer)
     * Null when no match is active
     */
    const gameState = ref<I_GameState | null>(null);

    /**
     * Match result data (populated when match ends)
     * Null during active match or in lobby
     */
    const matchResult = ref<I_MatchResult | null>(null);

    // ========================================================================
    // Computed
    // ========================================================================

    /**
     * Check if currently in an active match
     */
    const hasActiveMatch = computed(() => currentMatchId.value !== null);

    /**
     * Check if match is in progress
     */
    const isMatchInProgress = computed(() => matchState.value === 'IN_PROGRESS');

    /**
     * Check if in lobby
     */
    const isInLobby = computed(() => matchState.value === 'LOBBY');

    /**
     * Check if match is finished
     */
    const isMatchFinished = computed(() => matchState.value === 'FINISHED');

    // ========================================================================
    // Actions
    // ========================================================================

    /**
     * Initialize match with data from server HTTP response
     */
    function setInitialMatchState(data: {
      matchId: string;
      channelId: string;
      channelName: string;
      state: I_GameState;
    }) {
      currentMatchId.value = data.matchId;
      currentChannelId.value = data.channelId;
      channelName.value = data.channelName;
      gameState.value = data.state;
      matchState.value = 'IN_PROGRESS';
      isConnectedToMatch.value = false; // Will be set to true when WebSocket confirms
    }

    /**
     * Confirm WebSocket connection to match channel
     */
    function confirmMatchConnection() {
      isConnectedToMatch.value = true;
    }

    /**
     * Update game state (used by WebSocket event handlers)
     */
    function updateGameState(updates: Partial<I_GameState>) {
      if (gameState.value) {
        gameState.value = { ...gameState.value, ...updates };
      }
    }

    /**
     * Update player health
     */
    function updatePlayerHealth(health: number) {
      if (gameState.value) {
        gameState.value.player.health = health;
      }
    }

    /**
     * Update NPC health
     */
    function updateNPCHealth(health: number) {
      if (gameState.value) {
        gameState.value.npc.health = health;
      }
    }

    /**
     * Update turn state
     */
    function updateTurnState(turn: Partial<I_TurnState>) {
      if (gameState.value) {
        gameState.value.turn = { ...gameState.value.turn, ...turn };
      }
    }

    /**
     * Update ATB readiness
     */
    function updateATBState(atb: Partial<I_ATBState>) {
      if (gameState.value) {
        gameState.value.atb = { ...gameState.value.atb, ...atb };
      }
    }

    /**
     * End match and store result
     */
    function endMatch(result: I_MatchResult) {
      matchResult.value = result;
      matchState.value = 'FINISHED';
    }

    /**
     * Leave match and return to lobby
     */
    function leaveMatch() {
      currentMatchId.value = null;
      currentChannelId.value = null;
      channelName.value = null;
      gameState.value = null;
      matchResult.value = null;
      matchState.value = 'LOBBY';
      isConnectedToMatch.value = false;
    }

    /**
     * Reset store to initial state
     */
    function $reset() {
      currentMatchId.value = null;
      currentChannelId.value = null;
      channelName.value = null;
      matchState.value = 'LOBBY';
      isConnectedToMatch.value = false;
      gameState.value = null;
      matchResult.value = null;
    }


    onMounted(() => {
      console.error('mounted')
      websocket.register('match.store', {
        data: async (_ws: WebSocket, message: WebsocketStructuredMessage) => {
          /* const alreadyCatalogied = ["match.state.change", "match.created", "match.atb.readiness.update ", "client.leave.channel",];
          if (alreadyCatalogied.includes(message.type)) {
            return;
          } */
          console.log('[match.store] Incoming message: ',);
          Lib.LogObject(message)
        }
      })
    })

    onBeforeUnmount(() => {
      console.error('[WS] Match store unmounting, disconnecting...');
      websocket.unregister('match.store');
    })

    return {
      // State
      currentMatchId,
      currentChannelId,
      channelName,
      matchState,
      isConnectedToMatch,
      gameState,
      matchResult,

      // Computed
      hasActiveMatch,
      isMatchInProgress,
      isInLobby,
      isMatchFinished,

      // Actions
      setInitialMatchState,
      confirmMatchConnection,
      updateGameState,
      updatePlayerHealth,
      updateNPCHealth,
      updateTurnState,
      updateATBState,
      endMatch,
      leaveMatch,
      $reset,
    };
  },
);

/**
 * Match store type for external usage
 */
export type MatchStore = ReturnType<typeof useMatchStore>;
