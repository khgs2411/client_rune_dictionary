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
import type { I_ATBState, I_NPCParticipant, I_PlayerParticipant, I_TimerConfig, I_TurnState } from "@/common/match.types";
import { ref } from "vue";

/**
 * Composable for managing granular combat state in matches
 *
 * This composable handles real-time WebSocket events and transforms server data
 * into UI-friendly reactive refs. It serves as the transformation layer between
 * server event structure and component-ready data.
 *
 * **Pattern**: MVC Service - Store = Controller, Composable = Service, Component = View
 * **Instantiation**: Created once inside match store, never called directly by components
 * **Access**: Components read via `matchStore.gameState.player.health` etc.
 */
export function useMatchState() {
	// Participant state
	const player = ref<I_PlayerParticipant | undefined>();
	const npc = ref<I_NPCParticipant | undefined>();

	// Turn state
	const turn = ref<I_TurnState>({
		number: 0,
		currentEntityId: "",
		isPlayerTurn: false,
	});

	// ATB state (server data + UI control)
	const atb = ref<I_ATBState & { running: boolean }>({
		playerReadiness: 0,
		npcReadiness: 0,
		running: true, // Controls ATB bar progression
	});

	// Timer state (server data)
	const timer = ref<I_TimerConfig>({
		duration: 0,
		warningThreshold: 80,
		fallbackAction: "pass",
		active: false,
		remaining: 0,
		elapsed: 0,
		percentage: 0,
	});

	// Turn Timer UI controls (separate from server timer state)
	const turnTimer = ref({
		visible: false, // Controls TurnTimer component visibility
		running: false, // Controls TurnTimer countdown progression
	});

	/**
	 * Handle match.created event
	 * Initialize match with player/npc data from server
	 */
	function handleMatchCreated(event: MatchCreatedEvent): void {
		console.log("[useMatchState] Match created:", event.content.matchId);
		// Note: Player/NPC data comes from HTTP response, not this event
		// This event just confirms channel creation
	}

	/**
	 * Handle match.state.change event
	 * Update match lifecycle state transitions
	 */
	function handleMatchStateChange(event: MatchStateChangeEvent): void {
		const { previousState, currentState, reason } = event.content;
		console.log(`[useMatchState] State change: ${previousState} → ${currentState} (${reason})`);
		if (currentState === "COMPLETED") {
		}
		// State changes are handled at store level (LOBBY → IN_PROGRESS → FINISHED)
	}

	/**
	 * Handle match.health.update event
	 * Update player or NPC health based on entityId
	 */
	function handleHealthUpdate(event: MatchHealthUpdateEvent): void {
		const { entityId, health, maxHealth } = event.content;

		if (player.value && entityId === player.value.entityId) {
			player.value.health = health;
			player.value.maxHealth = maxHealth;
		} else if (npc.value && entityId === npc.value.entityId) {
			npc.value.health = health;
			npc.value.maxHealth = maxHealth;
		}
	}

	/**
	 * Handle match.atb.readiness.update event
	 * Transform server's entityId map to player/npc readiness values
	 */
	function handleATBUpdate(event: MatchATBReadinessUpdateEvent): void {
		const { atbData } = event.content;

		// Transform entityId map to player/npc readiness
		if (player.value && atbData[player.value.entityId]) {
			const readiness = atbData[player.value.entityId].readiness;
			player.value.readiness = readiness;
			atb.value.playerReadiness = readiness;
		}

		if (npc.value && atbData[npc.value.entityId]) {
			const readiness = atbData[npc.value.entityId].readiness;
			npc.value.readiness = readiness;
			atb.value.npcReadiness = readiness;
		}
	}

	/**
	 * Handle match.turn.start event
	 * Update current turn entity and turn number
	 */
	function handleTurnStart(event: MatchTurnStartEvent): void {
		const { entityId, turnNumber } = event.content;

		turn.value.number = turnNumber;
		turn.value.currentEntityId = entityId;
		turn.value.isPlayerTurn = player.value ? entityId === player.value.entityId : false;

		// UI controls: show turn timer, start countdown, pause ATB
		turnTimer.value.visible = true;
		turnTimer.value.running = true;
		atb.value.running = false;

		console.log(`[useMatchState] Turn ${turnNumber} started for ${entityId}`);
	}

	/**
	 * Handle match.turn.end event
	 * Clear turn state or reset for next turn
	 */
	function handleTurnEnd(event: MatchTurnEndEvent): void {
		const { entityId, turnNumber } = event.content;
		console.log(`[useMatchState] Turn ${turnNumber} ended for ${entityId}`);

		// Server timer state
		timer.value.active = false;
		turn.value.isPlayerTurn = false;

		// UI controls: hide turn timer, stop countdown, resume ATB
		turnTimer.value.visible = false;
		turnTimer.value.running = false;
		atb.value.running = true;
	}

	/**
	 * Handle match.state.update event
	 * Sync timer, turn counter, and current entity from server
	 */
	function handleStateUpdate(event: MatchStateUpdateEvent): void {
		const { gameState } = event.content;

		// Update turn state
		turn.value.number = gameState.turnCounter;
		turn.value.currentEntityId = gameState.currentTurnEntityId;
		turn.value.isPlayerTurn = player.value ? gameState.currentTurnEntityId === player.value.entityId : false;

		// Update timer state
		timer.value.active = gameState.timer.active;
		timer.value.remaining = gameState.timer.remaining;
		timer.value.elapsed = gameState.timer.elapsed;
		timer.value.percentage = gameState.timer.percentage;
		timer.value.duration = gameState.timer.duration;
		timer.value.warningThreshold = gameState.timer.warningThreshold;
		timer.value.fallbackAction = gameState.timer.fallbackAction;
	}

	/**
	 * Handle match.damage.dealt event
	 * Process damage event (health update comes from separate event)
	 */
	function handleDamageDealt(event: MatchDamageDealtEvent): void {
		const { attackerId, targetId, damage, message } = event.content;
		console.log(`[useMatchState] Damage: ${attackerId} → ${targetId} (${damage} dmg)`, message);
		// Health changes are handled by match.health.update event
		// This event is for logging/animation purposes
	}

	/**
	 * Handle match.victory event
	 * Process victory/defeat result for the player
	 */
	function handleMatchVictory(event: MatchVictoryEvent): void {
		const { result, winnerId, entityId, message } = event.content;
		console.log(`[useMatchState] Match result: ${result} (winner: ${winnerId})`, message);
		// Match result is handled at store level
	}

	/**
	 * Handle match.end event
	 * Finalize match state
	 */
	function handleMatchEnd(event: MatchEndEvent): void {
		const { winnerId } = event.content;
		console.log(`[useMatchState] Match ended. Winner: ${winnerId}`);
		resetState();
		// Match end is handled at store level
	}

	/**
	 * Initialize match state with player/NPC data
	 * Called from store after HTTP match creation response
	 */
	function initializeMatchState(playerData: I_PlayerParticipant, npcData: I_NPCParticipant): void {
		player.value = { ...playerData, readiness: 0 };
		npc.value = { ...npcData, readiness: 0 };

		// Reset other state
		turn.value = {
			number: 0,
			currentEntityId: "",
			isPlayerTurn: false,
		};

		atb.value = {
			playerReadiness: 0,
			npcReadiness: 0,
			running: true, // ATB starts running
		};

		timer.value = {
			duration: 0,
			warningThreshold: 80,
			fallbackAction: "pass",
			active: false,
			remaining: 0,
			elapsed: 0,
			percentage: 0,
		};

		turnTimer.value = {
			visible: false, // Turn timer hidden until first turn
			running: false,
		};

		console.log("[useMatchState] Match state initialized", {
			player: player.value,
			npc: npc.value,
		});
	}

	/**
	 * Reset all state
	 * Called when match ends or player leaves
	 */
	function resetState(): void {
		player.value = undefined;
		npc.value = undefined;

		turn.value = {
			number: 0,
			currentEntityId: "",
			isPlayerTurn: false,
		};

		atb.value = {
			playerReadiness: 0,
			npcReadiness: 0,
			running: false, // Stop ATB on reset
		};

		timer.value = {
			duration: 0,
			warningThreshold: 80,
			fallbackAction: "pass",
			active: false,
			remaining: 0,
			elapsed: 0,
			percentage: 100,
		};

		turnTimer.value = {
			visible: false,
			running: false,
		};

		console.log("[useMatchState] State reset");
	}

	return {
		// State refs
		player,
		npc,
		turn,
		atb,
		timer,
		turnTimer,

		// Event handlers
		handleMatchCreated,
		handleMatchStateChange,
		handleHealthUpdate,
		handleATBUpdate,
		handleTurnStart,
		handleTurnEnd,
		handleStateUpdate,
		handleDamageDealt,
		handleMatchVictory,
		handleMatchEnd,

		// Lifecycle methods
		initializeMatchState,
		resetState,
	};
}
