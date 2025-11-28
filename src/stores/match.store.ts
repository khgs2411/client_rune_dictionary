import type {
	MatchATBReadinessUpdateEvent,
	MatchCreatedEvent,
	MatchDamageDealtEvent,
	MatchEndEvent,
	MatchHealthUpdateEvent,
	MatchStateChangeEvent,
	MatchStateUpdateEvent,
	MatchTurnEndEvent,
	MatchTurnStartEvent,
	MatchVictoryEvent,
} from "@/common/match-events.types";
import { I_GameState, I_MatchResult, MatchState } from "@/common/match.types";
import { useMatchState } from "@/composables/useMatchState";
import { useWebSocketStore } from "@/stores/websocket.store";
import { defineStore } from "pinia";
import { Lib, WebsocketStructuredMessage } from "topsyde-utils";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

export const useMatchStore = defineStore("match", () => {
	const websocket = useWebSocketStore();

	// ========================================================================
	// Composable (granular combat state)
	// ========================================================================

	/**
	 * Game state composable - handles real-time match events
	 * Components access via: matchStore.gameState.player.health, etc.
	 */
	const match = useMatchState();

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
	const matchState = ref<MatchState>("LOBBY");

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
	const isMatchInProgress = computed(() => matchState.value === "IN_PROGRESS");

	/**
	 * Check if in lobby
	 */
	const isInLobby = computed(() => matchState.value === "LOBBY");

	/**
	 * Check if match is finished
	 */
	const isMatchFinished = computed(() => matchState.value === "FINISHED");

	// ========================================================================
	// Actions (Lifecycle only - combat state handled by gameState composable)
	// ========================================================================

	/**
	 * Initialize match with data from server HTTP response
	 */
	function setInitialMatchState(data: { matchId: string; channelId: string; channelName: string; state: I_GameState }) {
		currentMatchId.value = data.matchId;
		currentChannelId.value = data.channelId;
		channelName.value = data.channelName;
		matchState.value = "IN_PROGRESS";
		isConnectedToMatch.value = false; // Will be set to true when WebSocket confirms

		// Initialize gameState composable with player/NPC data
		match.initializeMatchState(data.state.player, data.state.npc);
	}

	/**
	 * Reset store to initial state
	 */
	function $reset() {
		currentMatchId.value = null;
		currentChannelId.value = null;
		channelName.value = null;
		matchState.value = "LOBBY";
		isConnectedToMatch.value = false;
		matchResult.value = null;

		// Reset gameState composable
		match.resetState();
	}

	// ========================================================================
	// WebSocket Event Routing
	// ========================================================================

	onMounted(() => {
		console.log("[match.store] Registering WebSocket handlers");
		websocket.register("match.store", {
			data: async (_ws: WebSocket, message: WebsocketStructuredMessage) => {
				// Route match events to gameState composable handlers
				switch (message.type) {
					case "match.created":
						match.handleMatchCreated(message as MatchCreatedEvent);
						break;

					case "match.state.change":
						const event = message as MatchStateChangeEvent;
						if (event.content.currentState === "COMPLETED") matchState.value = "FINISHED";
						match.handleMatchStateChange(event);
						break;

					case "match.health.update":
						match.handleHealthUpdate(message as MatchHealthUpdateEvent);
						break;

					case "match.atb.readiness.update":
						match.handleATBUpdate(message as MatchATBReadinessUpdateEvent);
						break;

					case "match.turn.start":
						match.handleTurnStart(message as MatchTurnStartEvent);
						break;

					case "match.turn.end":
						match.handleTurnEnd(message as MatchTurnEndEvent);
						break;

					case "match.state.update":
						match.handleStateUpdate(message as MatchStateUpdateEvent);
						break;

					case "match.damage.dealt":
						match.handleDamageDealt(message as MatchDamageDealtEvent);
						break;

					case "match.victory":
						match.handleMatchVictory(message as MatchVictoryEvent);
						break;

					case "match.end":
						match.handleMatchEnd(message as MatchEndEvent);
						break;

					default:
						// Log unknown match events for debugging
						if (message.type.startsWith("match.")) {
							console.warn("[match.store] Unknown match event:", message.type);
							Lib.LogObject(message);
						}
				}
			},
		});
	});

	onBeforeUnmount(() => {
		console.log("[match.store] Unregistering WebSocket handlers");
		websocket.unregister("match.store");
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
		match,

		// Computed
		hasActiveMatch,
		isMatchInProgress,
		isInLobby,
		isMatchFinished,

		// Actions (lifecycle only)
		setInitialMatchState,
		$reset,
	};
});

/**
 * Match store type for external usage
 */
export type MatchStore = ReturnType<typeof useMatchStore>;
