import { Guards, NamespaceActions, WebsocketStructuredMessage } from "topsyde-utils";
import { computed, onUnmounted, reactive } from "vue";
import MatchAPI from "../../api/match.api";
import useAuth from "../../common/composables/useAuth";
import usePrompt, { PromptChoice, PromptData } from "../../common/composables/usePrompt";
import useUtils from "../../common/composables/useUtils";
import { WebsocketClient } from "../../common/composables/useWebsocketInterface";
import { I_UseWSM } from "../../common/composables/useWSM";
import { Entity } from "../../common/types/types";
import { MatchResult, useMatchStore } from "../../stores/match.store";

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
	const store = useMatchStore();

	// Callback functions for frontend integration
	let onPlayerTurnCallback: (() => void) | null = null;
	let onEnemyTurnCallback: (() => void) | null = null;
	let addLogEntryCallback: ((type: string, message: string) => void) | null = null;

	async function leaveMatch() {
		if (store.isConnectedToMatch) {
			loading.api = true;
			await api.leaveMatch(store.currentMatchId || "", auth$.client.value);
			store.isConnectedToMatch = false;
			store.currentMatchId = null;
			store.currentChannelId = null;
			loading.api = false;
		}

	}

	async function pve() {
		loading.match = true;
		const response = await api.pve(auth$.client.value);

		// Store match data for WebSocket connection
		if (response.data?.matchId && response.data?.channelId) {
			store.currentMatchId = response.data.matchId;
			store.currentChannelId = response.data.channelId;

			// Initialize game state for new match
			initializeGameState();

			// Connect to match channel for real-time updates
			await connectToMatchChannel();
		}

		store.matchState = E_MatchState.IN_PROGRESS;
		loading.match = false;
		return response.data;
	}

	/**
	 * Initialize game state for a new match
	 */
	function initializeGameState() {
		store.gameState = {
			playerHealth: 100,
			enemyHealth: 100,
			playerMaxHealth: 100,
			enemyMaxHealth: 100,
			currentTurn: 'player',
			actionsPerformed: 0,
			matchStartTime: new Date()
		};
		store.matchResult = null;
	}

	// Computed properties using store state (facade pattern)
	const inMatch = computed(() => store.matchState === E_MatchState.IN_PROGRESS);
	const inLobby = computed(() => store.matchState === E_MatchState.LOBBY);

	/**
	 * Connect to the match WebSocket channel for real-time updates
	 */
	async function connectToMatchChannel() {
		if (!store.currentChannelId) {
			console.error("Cannot connect to match channel: No channel ID");
			return;
		}

		try {
			console.log(`Connecting to match channel: ${store.currentChannelId}`);
			store.isConnectedToMatch = true;

			// Add WebSocket event listeners for PVE match events
			setupMatchEventListeners();

		} catch (error) {
			console.error("Failed to connect to match channel:", error);
			utils.toast.error("Failed to connect to match", "top-right");
			store.isConnectedToMatch = false;
		}
	}

	/**
	 * Set up event listeners for PVE match events
	 */
	function setupMatchEventListeners() {
		console.log("Setting up match event listeners for PVE");
		
		// The onGameEvent handler is now properly connected through useWebsocketEventHandler
		// and will receive the following server events:
		// - match.damage.dealt: When damage is dealt to any participant
		// - match.health.update: When participant health changes
		// - match.turn.start: When a new turn begins
		// - match.turn.end: When a turn ends
		// - match.victory: When match ends with victory/defeat
		// - match.error: When action validation fails
		// - match.state.update: For general state synchronization
		
		console.log("Match event listeners configured for server-authoritative combat");
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
			// New server events for server-authoritative combat
			case "match.damage.dealt":
				handleDamageDealt(wsm$.data);
				break;
			case "match.health.update":
				handleHealthUpdate(wsm$.data);
				break;
			case "match.turn.start":
				handleTurnStart(wsm$.data);
				break;
			case "match.turn.end":
				handleTurnEnd(wsm$.data);
				break;
			case "match.victory":
				handleVictory(wsm$.data);
				break;
			case "match.error":
				handleMatchError(wsm$.data);
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
		const startTime = store.gameState.matchStartTime;
		const duration = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;

		// Determine match result based on game state
		const result = determineMatchResult(data);

		// Create match result object
		const matchResult: MatchResult = {
			result,
			duration,
			playerHealth: store.gameState.playerHealth,
			enemyHealth: store.gameState.enemyHealth,
			actionsPerformed: store.gameState.actionsPerformed,
			timestamp: new Date()
		};

		// Store match result
		store.matchResult = matchResult;
		store.matchHistory.push(matchResult);

		// Set match state to finished
		store.matchState = E_MatchState.FINISHED;

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
	 * Determine match result - now server authoritative only
	 */
	function determineMatchResult(data: any): 'victory' | 'defeat' | 'disconnect' | 'draw' {
		// Server always provides the result - no frontend logic needed
		if (data?.result) {
			return data.result;
		}

		// If no result provided by server, default to disconnect
		// This should not happen in normal server-authoritative flow
		console.warn('Match ended without server-provided result, defaulting to disconnect');
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
	 * Handle damage dealt events from server
	 */
	function handleDamageDealt(data: any) {
		console.log("Damage dealt:", data);
		
		const { attackerId, targetId, damage, message } = data.content || data;
		const currentUserId = auth$.client.value?.id;
		
		// Update UI with damage information (could trigger animations, floating text, etc.)
		utils.toast.info(message, "center");
		
		// Update actions performed counter
		store.gameState.actionsPerformed++;
		
		// Add to game log if callback is available
		if (addLogEntryCallback) {
			const logType = attackerId === currentUserId ? "player" : "enemy";
			addLogEntryCallback(logType, message);
		}
		
		console.log(`${attackerId} dealt ${damage} damage to ${targetId}`);
	}

	/**
	 * Handle health update events from server
	 */
	function handleHealthUpdate(data: any) {
		console.log("Health update:", data);
		
		const { entityId, health, maxHealth } = data.content || data;
		const currentUserId = auth$.client.value?.id;
		
		// Update health in game state based on entity
		if (entityId === currentUserId) {
			// Update player health
			store.gameState.playerHealth = health;
			store.gameState.playerMaxHealth = maxHealth;
		} else {
			// Update enemy health
			store.gameState.enemyHealth = health;
			store.gameState.enemyMaxHealth = maxHealth;
		}
		
		console.log(`Health updated for ${entityId}: ${health}/${maxHealth}`);
	}

	/**
	 * Handle turn start events from server
	 */
	function handleTurnStart(data: any) {
		console.log("Turn start:", data);
		
		const { entityId, turnNumber } = data.content || data;
		const currentUserId = auth$.client.value?.id;
		
		// Update turn state
		if (entityId === currentUserId) {
			store.gameState.currentTurn = 'player';
			utils.toast.info("Your turn!", "center");
			// Call frontend callback to update UI
			if (onPlayerTurnCallback) {
				onPlayerTurnCallback();
			}
		} else {
			store.gameState.currentTurn = 'enemy';
			utils.toast.info("Enemy's turn...", "center");
			// Call frontend callback to update UI
			if (onEnemyTurnCallback) {
				onEnemyTurnCallback();
			}
		}
		
		console.log(`Turn ${turnNumber} started for ${entityId}`);
	}

	/**
	 * Handle turn end events from server
	 */
	function handleTurnEnd(data: any) {
		console.log("Turn end:", data);
		
		const { entityId, turnNumber } = data.content || data;
		// Could add turn end animations or effects here
		
		console.log(`Turn ${turnNumber} ended for ${entityId}`);
	}

	/**
	 * Handle victory events from server
	 */
	function handleVictory(data: any) {
		console.log("Victory event:", data);
		
		const { result, winnerId, message } = data.content || data;
		const currentUserId = auth$.client.value?.id;
		
		// Determine result from player's perspective
		let playerResult: 'victory' | 'defeat' | 'draw';
		if (winnerId === currentUserId) {
			playerResult = 'victory';
		} else {
			playerResult = 'defeat';
		}
		
		// Handle match end with server-determined result
		handleMatchEnd({ 
			type: 'match.end', 
			result: playerResult,
			message 
		});
		
		console.log(`Victory: ${result}, Winner: ${winnerId}`);
	}

	/**
	 * Handle match error events from server
	 */
	function handleMatchError(data: any) {
		console.log("Match error:", data);
		
		const { error, entityId } = data.content || data;
		const currentUserId = auth$.client.value?.id;
		
		// Show error message to user if it affects them
		if (!entityId || entityId === currentUserId) {
			utils.toast.error(typeof error === 'string' ? error : 'Match error occurred', "top-right");
		}
		
		console.error(`Match error for ${entityId || 'unknown'}: ${error}`);
	}

	/**
	 * Set callback functions for frontend integration
	 */
	function setUICallbacks(callbacks: {
		onPlayerTurn?: () => void;
		onEnemyTurn?: () => void;
		addLogEntry?: (type: string, message: string) => void;
	}) {
		onPlayerTurnCallback = callbacks.onPlayerTurn || null;
		onEnemyTurnCallback = callbacks.onEnemyTurn || null;
		addLogEntryCallback = callbacks.addLogEntry || null;
	}

	/**
	 * Clean up match resources and reset state
	 */
	function cleanup() {
		console.log("Cleaning up match resources");

		// Close WebSocket connections
		if (store.isConnectedToMatch) {
			disconnectFromMatchChannel();
		}

		// Reset match store state
		store.currentMatchId = null;
		store.currentChannelId = null;
		store.isConnectedToMatch = false;
		store.matchState = E_MatchState.LOBBY;

		// Keep match result for UI display but reset game state
		store.gameState = {
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
			api.leaveMatch(store.currentMatchId || "", auth$.client.value).then(() => {
				// TODO: Implement actual WebSocket disconnection when WebSocket system is integrated
				// This would typically involve:
				// - Removing event listeners
				// - Closing WebSocket connections
				// - Clearing any pending timeouts/intervals

				store.isConnectedToMatch = false;
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
			store.matchResult = {
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
		const history = store.matchHistory;
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
		if (store.isConnectedToMatch) {
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

	function onWebsocketEvents(ws: WebsocketClient): NamespaceActions {
		return {
			'match.action': (data) => {
				console.log("Attack action received:", data);
				if (Guards.IsNil(store.currentChannelId)) {
					throw new Error("Cannot send action: No current channel ID");
				}

				if (Guards.IsNil(auth$.client.value)) {
					throw new Error("Cannot send action: No authenticated client");
				}

				const wsm: WebsocketStructuredMessage = {
					type: 'match.action',
					content: { action: 'attack', ...data },
					channel: store.currentChannelId,
					timestamp: new Date().toISOString(),
					client: auth$.client.value,
					metadata: {},
				}
				ws.send(JSON.stringify(wsm));
			}
		}
	}



	return {
		// Legacy state for backward compatibility
		state: computed(() => store.matchState),
		// Computed properties
		inMatch,
		inLobby,
		isFinished: computed(() => store.matchState === E_MatchState.FINISHED),
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
		leaveMatch,
		// Store access for advanced usage
		store,
		loading,
		// Websocket Logic
		onWebsocketEvents,
		// Server event handlers for frontend integration
		handleDamageDealt,
		handleHealthUpdate,
		handleTurnStart,
		handleTurnEnd,
		handleVictory,
		handleMatchError,
		// Frontend integration
		setUICallbacks
	};
};
export default useMatch;
