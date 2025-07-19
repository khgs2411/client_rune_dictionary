import { WebsocketStructuredMessage } from "topsyde-utils";
import { computed, onUnmounted, reactive } from "vue";
import MatchAPI from "../../api/match.api";
import { MatchResult, useMatchStore } from "../../stores/match.store";
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
	const loading = reactive({
		match: false,
		api: false,
	})

	// Use Pinia store for persistent state
	const matchStore = useMatchStore();

	async function leaveMatch() {
		if (matchStore.isConnectedToMatch) {
			loading.api = true;
			await api.leaveMatch(matchStore.currentMatchId || "", auth$.client.value);
			matchStore.isConnectedToMatch = false;
			matchStore.currentMatchId = null;
			matchStore.currentChannelId = null;
			loading.api = false;
		}

	}

	async function pve() {
		loading.match = true;
		const response = await api.pve(auth$.client.value);

		// Store match data for WebSocket connection
		if (response.data?.matchId && response.data?.channelId) {
			matchStore.currentMatchId = response.data.matchId;
			matchStore.currentChannelId = response.data.channelId;

			// Initialize game state for new match
			initializeGameState();

			// Connect to match channel for real-time updates
			await connectToMatchChannel();
		}

		matchStore.matchState = E_MatchState.IN_PROGRESS;
		loading.match = false;
		return response.data;
	}

	/**
	 * Initialize game state for a new match
	 */
	function initializeGameState() {
		matchStore.gameState = {
			playerHealth: 100,
			enemyHealth: 100,
			playerMaxHealth: 100,
			enemyMaxHealth: 100,
			currentTurn: 'player',
			actionsPerformed: 0,
			matchStartTime: new Date()
		};
		matchStore.matchResult = null;
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

		// Calculate match duration
		const startTime = matchStore.gameState.matchStartTime;
		const duration = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;

		// Determine match result based on game state
		const result = determineMatchResult(data);

		// Create match result object
		const matchResult: MatchResult = {
			result,
			duration,
			playerHealth: matchStore.gameState.playerHealth,
			enemyHealth: matchStore.gameState.enemyHealth,
			actionsPerformed: matchStore.gameState.actionsPerformed,
			timestamp: new Date()
		};

		// Store match result
		matchStore.matchResult = matchResult;
		matchStore.matchHistory.push(matchResult);

		// Set match state to finished
		matchStore.matchState = E_MatchState.FINISHED;

		// Save match result to database (if available)
		saveMatchResult(matchResult);

		// Show match result notification
		const resultMessage = getMatchResultMessage(result);
		if (result === 'victory') {
			utils.toast.success(resultMessage, "center");
		} else if (result === 'defeat') {
			utils.toast.error(resultMessage, "center");
		} else {
			utils.toast.info(resultMessage, "center");
		}

		console.log("Match result:", matchResult);
	}

	/**
	 * Determine match result based on game state and data
	 */
	function determineMatchResult(data: any): 'victory' | 'defeat' | 'disconnect' | 'draw' {
		// If specific result provided in data
		if (data?.result) {
			return data.result;
		}

		// Check health values
		const playerHealth = matchStore.gameState.playerHealth;
		const enemyHealth = matchStore.gameState.enemyHealth;

		if (playerHealth <= 0 && enemyHealth <= 0) {
			return 'draw';
		} else if (playerHealth <= 0) {
			return 'defeat';
		} else if (enemyHealth <= 0) {
			return 'victory';
		}

		// Default to disconnect if no clear winner
		return 'disconnect';
	}

	/**
	 * Get user-friendly match result message
	 */
	function getMatchResultMessage(result: string): string {
		switch (result) {
			case 'victory':
				return '🎉 Victory! You defeated the AI opponent!';
			case 'defeat':
				return '💀 Defeat! The AI opponent proved too strong.';
			case 'draw':
				return '🤝 Draw! Both fighters fell in battle.';
			case 'disconnect':
				return '🔌 Match ended due to disconnection.';
			default:
				return 'Match completed.';
		}
	}

	/**
	 * Save match result to database (placeholder for MongoDB integration)
	 */
	async function saveMatchResult(result: MatchResult) {
		try {
			// TODO: Integrate with MongoDB to save match statistics
			console.log("Saving match result to database:", result);

			// This will be implemented when backend MongoDB integration is ready
			// await api.saveMatchResult(auth$.client.value.id, result);
		} catch (error) {
			console.error("Failed to save match result:", error);
		}
	}

	/**
	 * Clean up match resources and reset state
	 */
	function cleanup() {
		console.log("Cleaning up match resources");

		// Close WebSocket connections
		if (matchStore.isConnectedToMatch) {
			disconnectFromMatchChannel();
		}

		// Reset match store state
		matchStore.currentMatchId = null;
		matchStore.currentChannelId = null;
		matchStore.isConnectedToMatch = false;
		matchStore.matchState = E_MatchState.LOBBY;

		// Keep match result for UI display but reset game state
		matchStore.gameState = {
			playerHealth: 100,
			enemyHealth: 100,
			playerMaxHealth: 100,
			enemyMaxHealth: 100,
			currentTurn: 'player',
			actionsPerformed: 0,
			matchStartTime: null
		};

		console.log("Match cleanup completed");
	}

	/**
	 * Disconnect from match WebSocket channel
	 */
	function disconnectFromMatchChannel() {
		try {
			console.log("Disconnecting from match channel");
			api.leaveMatch(matchStore.currentMatchId || "", auth$.client.value).then(() => {
				// TODO: Implement actual WebSocket disconnection when WebSocket system is integrated
				// This would typically involve:
				// - Removing event listeners
				// - Closing WebSocket connections
				// - Clearing any pending timeouts/intervals

				matchStore.isConnectedToMatch = false;
				console.log("Disconnected from match channel successfully");
			});
		} catch (error) {
			console.error("Error disconnecting from match channel:", error);
		}
	}

	/**
	 * Start a rematch with the same settings
	 */
	async function startRematch() {
		try {
			console.log("Starting rematch");

			// Clear previous match result

			// Start new PVE match
			await leaveMatch();
			matchStore.matchResult = {
				result: 'loading',
				duration: 0,
				playerHealth: 100,
				enemyHealth: 100,
				actionsPerformed: 0,
				timestamp: new Date()
			};
			await pve();

			utils.toast.info("Starting new match...", "center");
		} catch (error) {
			console.error("Failed to start rematch:", error);
			utils.toast.error("Failed to start rematch", "top-right");
		}
	}

	/**
	 * Return to lobby (clean up and reset everything)
	 */
	function returnToLobby() {
		cleanup();
		utils.toast.info("Returned to lobby", "center");
	}

	/**
	 * Get current match statistics
	 */
	function getMatchStats() {
		const history = matchStore.matchHistory;
		const totalMatches = history.length;
		const victories = history.filter(m => m.result === 'victory').length;
		const defeats = history.filter(m => m.result === 'defeat').length;
		const draws = history.filter(m => m.result === 'draw').length;

		return {
			totalMatches,
			victories,
			defeats,
			draws,
			winRate: totalMatches > 0 ? Math.round((victories / totalMatches) * 100) : 0
		};
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
		isFinished: computed(() => matchStore.matchState === E_MatchState.FINISHED),
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
		// New match end methods
		startRematch,
		returnToLobby,
		getMatchStats,
		// Store access for advanced usage
		matchStore,
		loading,
	};
};
export default useMatch;
