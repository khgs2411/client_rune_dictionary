import { WebsocketStructuredMessage } from "topsyde-utils";
import { computed, onUnmounted } from "vue";
import MatchAPI from "../../api/match.api";
import { useMatchStore } from "../../stores/match.store";
import { Entity } from "../types/types";
import useAuth from "./useAuth";
import usePrompt, { PromptChoice, PromptData } from "./usePrompt";
import useUtils from "./useUtils";
import { I_UseWSM } from "./useWSM";

const MATCH_CHANNEL = "match";
const MATCH_MESSAGE = " Would like to battle";

export enum E_MatchState {
	LOBBY = "LOBBY",
	IN_PROGRESS = "IN_PROGRESS",
	FINISHED = "FINISHED",
}

export { MATCH_CHANNEL, MATCH_MESSAGE };

const useMatch = () => {
	const api = new MatchAPI();
	const utils = useUtils();
	const auth$ = useAuth();
	const prompt$ = usePrompt();

	// Use Pinia store for persistent state
	const matchStore = useMatchStore();

	async function pve() {
		const response = await api.pve(auth$.client.value);

		// Store match data for WebSocket connection
		if (response.data?.matchId && response.data?.channelId) {
			matchStore.currentMatchId = response.data.matchId;
			matchStore.currentChannelId = response.data.channelId;

			// Connect to match channel for real-time updates
			await connectToMatchChannel();
		}

		matchStore.matchState = E_MatchState.IN_PROGRESS;
		return response.data;
	}

	// Computed properties using store state (facade pattern)
	const inMatch = computed(() => matchStore.matchState === E_MatchState.IN_PROGRESS);
	const inLobby = computed(() => matchStore.matchState === E_MatchState.LOBBY);

	/**
	 * Connect to the match WebSocket channel for real-time updates
	 */
	async function connectToMatchChannel() {
		if (!matchStore.currentChannelId) {
			console.error("Cannot connect to match channel: No channel ID");
			return;
		}

		try {
			console.log(`Connecting to match channel: ${matchStore.currentChannelId}`);
			matchStore.isConnectedToMatch = true;

			// Add WebSocket event listeners for PVE match events
			setupMatchEventListeners();

		} catch (error) {
			console.error("Failed to connect to match channel:", error);
			utils.toast.error("Failed to connect to match", "top-right");
			matchStore.isConnectedToMatch = false;
		}
	}

	/**
	 * Set up event listeners for PVE match events
	 */
	function setupMatchEventListeners() {
		console.log("Setting up match event listeners for PVE");
		// TODO: Add specific event listeners for:
		// - Turn-based gameplay events
		// - NPC action events  
		// - Game state updates
		// - Match end events
	}

	/**
	 * Handle turn-based game events
	 */
	function onGameEvent(wsm$: I_UseWSM) {
		console.log("Received game event:", wsm$.data);

		// Handle different game event types
		switch (wsm$.data?.type) {
			case "player.turn":
				handlePlayerTurn(wsm$.data);
				break;
			case "enemy.turn":
				handleEnemyTurn(wsm$.data);
				break;
			case "game.state.update":
				handleGameStateUpdate(wsm$.data);
				break;
			case "match.end":
				handleMatchEnd(wsm$.data);
				break;
			default:
				console.log("Unknown game event type:", wsm$.data?.type);
		}
	}

	/**
	 * Handle player turn events
	 */
	function handlePlayerTurn(data: any) {
		console.log("Player turn:", data);
		// TODO: Update UI for player turn
	}

	/**
	 * Handle enemy turn events
	 */
	function handleEnemyTurn(data: any) {
		console.log("Enemy turn:", data);
		// TODO: Display enemy actions and animations
	}

	/**
	 * Handle game state updates
	 */
	function handleGameStateUpdate(data: any) {
		console.log("Game state update:", data);
		// TODO: Update game state in UI
	}

	/**
	 * Handle match end events
	 */
	function handleMatchEnd(data: any) {
		console.log("Match ended:", data);

		// Clean up match state
		cleanup();

		// Show match result
		utils.toast.success("Match completed!", "center");
	}

	/**
	 * Clean up match resources and reset state
	 */
	function cleanup() {
		console.log("Cleaning up match resources");

		matchStore.currentMatchId = null;
		matchStore.currentChannelId = null;
		matchStore.isConnectedToMatch = false;
		matchStore.matchState = E_MatchState.LOBBY;

		// TODO: Close WebSocket connections
		// TODO: Clear any match-specific UI state
	}

	// Clean up on component unmount
	onUnmounted(() => {
		if (matchStore.isConnectedToMatch) {
			cleanup();
		}
	});

	/**
	 * Challenge a player to a match
	 * @param whoami - The entity of the player who is challenging
	 * @param target - The entity of the player who is being challenged
	 * @returns The response from the API
	 */
	async function challenge(whoami: Entity, target: Entity) {
		try {
			const response = await api.createMatch(whoami, target);
			return response;
		} catch (e) {
			utils.toast.error("Something went wrong", "top-left");
		}
	}

	/**
	 * Accept an incoming match request
	 * @param matchId - The ID of the match to accept
	 * @returns The response from the API
	 */
	async function accept(matchId: string) {
		try {
			const response = await api.acceptMatch(matchId, { id: "", name: "" }, { id: "", name: "" });
			return response;
		} catch (e) {
			utils.toast.error("Something went wrong", "top-left");
		}
	}

	/**
	 * Decline an incoming match request
	 * @param matchId - The ID of the match to decline
	 * @returns The response from the API
	 */
	async function decline(matchId: string) {
		try {
			const response = await api.decline(matchId, { id: "", name: "" }, { id: "", name: "" });
			return response;
		} catch (e) {
			utils.toast.error("Something went wrong", "top-left");
		}
	}

	/**
	 * Handle a match request
	 * @param wsm$ - The websocket structured message
	 */
	function onMatchRequest(wsm$: I_UseWSM) {
		prompt$.next({
			message: MATCH_MESSAGE,
			from: wsm$.client.value,
			time: 10,
			metadata: wsm$.data,
			callback: (choice: PromptChoice, data: PromptData<WebsocketStructuredMessage>) => {
				if (!data.metadata) return;
				console.log(choice, data.metadata);
			},
		});
	}



	return {
		// Legacy state for backward compatibility
		state: computed(() => matchStore.matchState),
		// Computed properties
		inMatch,
		inLobby,
		// Match operations
		challenge,
		accept,
		decline,
		pve,
		onMatchRequest,
		// Enhanced WebSocket methods
		connectToMatchChannel,
		onGameEvent,
		cleanup,
		// Store access for advanced usage
		matchStore,
	};
};
export default useMatch;
