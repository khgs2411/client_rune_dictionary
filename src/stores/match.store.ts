import { I_GameState, I_MatchResult, MatchState } from '@/common/match.types';
import { useWebSocketStore } from '@/stores/websocket.store';
import { defineStore } from 'pinia';
import { Lib, WebsocketStructuredMessage } from 'topsyde-utils';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useMatchState } from '@/composables/useMatchState';
import type {
  MatchCreatedEvent,
  MatchStateChangeEvent,
  MatchHealthUpdateEvent,
  MatchATBReadinessUpdateEvent,
  MatchTurnStartEvent,
  MatchTurnEndEvent,
  MatchStateUpdateEvent,
  MatchDamageDealtEvent,
  MatchVictoryEvent,
  MatchEndEvent,
} from '@/common/match-events.types';

export const useMatchStore = defineStore(
  'match',
  () => {

    const websocket = useWebSocketStore();

    // ========================================================================
    // Composable (granular combat state)
    // ========================================================================

    /**
     * Game state composable - handles real-time match events
     * Components access via: matchStore.gameState.player.health, etc.
     */
    const gameState = useMatchState();

    // ========================================================================
    // State (high-level lifecycle)
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
    // Actions (Lifecycle only - combat state handled by gameState composable)
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
      matchState.value = 'IN_PROGRESS';
      isConnectedToMatch.value = false; // Will be set to true when WebSocket confirms

      // Initialize gameState composable with player/NPC data
      gameState.initializeMatchState(data.state.player, data.state.npc);
    }

    /**
     * Confirm WebSocket connection to match channel
     */
    function confirmMatchConnection() {
      isConnectedToMatch.value = true;
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
      matchResult.value = null;
      matchState.value = 'LOBBY';
      isConnectedToMatch.value = false;

      // Reset gameState composable
      gameState.resetState();
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
      matchResult.value = null;

      // Reset gameState composable
      gameState.resetState();
    }


    // ========================================================================
    // WebSocket Event Routing
    // ========================================================================

    onMounted(() => {
      console.log('[match.store] Registering WebSocket handlers');
      websocket.register('match.store', {
        data: async (_ws: WebSocket, message: WebsocketStructuredMessage) => {
          // Route match events to gameState composable handlers
          switch (message.type) {
            case 'match.created':
              gameState.handleMatchCreated(message as MatchCreatedEvent);
              break;

            case 'match.state.change':
              gameState.handleMatchStateChange(message as MatchStateChangeEvent);
              break;

            case 'match.health.update':
              gameState.handleHealthUpdate(message as MatchHealthUpdateEvent);
              break;

            case 'match.atb.readiness.update':
              gameState.handleATBUpdate(message as MatchATBReadinessUpdateEvent);
              break;

            case 'match.turn.start':
              gameState.handleTurnStart(message as MatchTurnStartEvent);
              break;

            case 'match.turn.end':
              gameState.handleTurnEnd(message as MatchTurnEndEvent);
              break;

            case 'match.state.update':
              gameState.handleStateUpdate(message as MatchStateUpdateEvent);
              break;

            case 'match.damage.dealt':
              gameState.handleDamageDealt(message as MatchDamageDealtEvent);
              break;

            case 'match.victory':
              gameState.handleMatchVictory(message as MatchVictoryEvent);
              break;

            case 'match.end':
              gameState.handleMatchEnd(message as MatchEndEvent);
              break;

            default:
              // Log unknown match events for debugging
              if (message.type.startsWith('match.')) {
                console.warn('[match.store] Unknown match event:', message.type);
                Lib.LogObject(message);
              }
          }
        }
      });
    });

    onBeforeUnmount(() => {
      console.log('[match.store] Unregistering WebSocket handlers');
      websocket.unregister('match.store');
    });

    return {
      // State (lifecycle)
      currentMatchId,
      currentChannelId,
      channelName,
      matchState,
      isConnectedToMatch,
      matchResult,

      // Composable (combat state)
      gameState,

      // Computed
      hasActiveMatch,
      isMatchInProgress,
      isInLobby,
      isMatchFinished,

      // Actions (lifecycle only)
      setInitialMatchState,
      confirmMatchConnection,
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
