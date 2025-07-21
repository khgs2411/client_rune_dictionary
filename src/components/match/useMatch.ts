import { computed, onUnmounted, reactive } from "vue";
import MatchAPI from "../../api/match.api";
import useAuth from "../../common/composables/useAuth";
import useUtils from "../../common/composables/useUtils";
import { Entity } from "../../common/types/types";
import { useMatchStore } from "../../stores/match.store";

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
	const store = useMatchStore();
	const utils = useUtils();
	const auth$ = useAuth();
	const loading = reactive({
		match: false,
		api: false,
	})

	// Use Pinia store for persistent state


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

			utils.toast.info("Starting new match...", "bottom-right");
		} catch (error) {
			console.error("Failed to start rematch:", error);
			utils.toast.error("Failed to start rematch", "center");
		}
	}

	/**
	 * Return to lobby (clean up and reset everything)
	 */
	function returnToLobby() {
		cleanup();
		utils.toast.info("Returned to lobby", "bottom-right");
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
		// Enhanced WebSocket methods
		connectToMatchChannel,
		cleanup,
		// New match end methods
		startRematch,
		returnToLobby,
		getMatchStats,
		leaveMatch,
		// Store access for advanced usage
		store,
		loading,
		
	};
};
export default useMatch;
