import { Guards, Lib, NamespaceActions, Rxjs, WebsocketStructuredMessage } from "topsyde-utils";
import useAuth from "../../common/composables/useAuth";
import usePrompt, { PromptChoice, PromptData } from "../../common/composables/usePrompt";
import useUtils from "../../common/composables/useUtils";
import { I_WebsocketEventHandler } from "../../common/composables/useWebsocketEventHandler";
import { WebsocketClient } from "../../common/composables/useWebsocketInterface";
import { I_UseWSM } from "../../common/composables/useWSM";
import { MatchResult, useMatchStore } from "../../stores/match.store";
import { E_MatchState, MATCH_MESSAGE } from "./useMatch";

// ATB Progress Update interfaces
interface I_ATBEntityData {
	readiness: number;
}

interface I_ATBUpdateContent {
	matchId: string;
	atbData: Record<string, I_ATBEntityData>;
	timestamp: string;
}

interface I_ATBProgressUpdateData {
	type: string;
	content: I_ATBUpdateContent;
}

const useMatchWebsocketEventHandler = (): I_WebsocketEventHandler => {
	const prompt$ = usePrompt();
	const auth$ = useAuth();
	const store = useMatchStore();
	const utils = useUtils();

	function onWebsocketEvents(wsm$: I_UseWSM) {
		if (wsm$.is("match")) onMatchRequest(wsm$);
		else onGameEvent(wsm$);
	}

	function outputEvents(ws: WebsocketClient): NamespaceActions {
		return {
			"match.action": (data) => {
				Lib.Log("Attack action received:", data);
				if (Guards.IsNil(store.currentChannelId)) {
					throw new Error("Cannot send action: No current channel ID");
				}

				if (Guards.IsNil(auth$.client.value)) {
					throw new Error("Cannot send action: No authenticated client");
				}

				const wsm: WebsocketStructuredMessage = {
					type: "match.action",
					content: { action: "attack", ...data },
					channel: store.currentChannelId,
					timestamp: new Date().toISOString(),
					client: auth$.client.value,
					metadata: {},
				};
				ws.send(JSON.stringify(wsm));
			},
		};
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
				Lib.Log(choice, data.metadata);
			},
		});
	}

	function onGameEvent(wsm$: I_UseWSM) {
		Lib.Log("Received game event:", wsm$.data);

		// Debug: Log the exact event type

		// Handle different game event types
		switch (wsm$.data?.type) {
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
			case "match.state.update":
				handleMatchStateUpdate(wsm$.data);
				break;
			case "match.atb.readiness.update":
				handleATBProgressUpdate(wsm$.data);
				break;
			default:
				Lib.Log("Unknown game event type:", wsm$.data?.type);
		}
	}

	function handleMatchStateUpdate(data: any) {
		// Validate input data structure
		if (!data || typeof data !== 'object') {
			console.warn('Invalid match state update data:', data);
			return;
		}

		const content = data.content;
		if (!content || typeof content !== 'object') {
			console.warn('Invalid match state update content:', content);
			return;
		}

		const gameState = content.gameState;
		if (!gameState || typeof gameState !== 'object') {
			console.warn('Invalid game state in match update:', gameState);
			return;
		}

		// Handle turn updates
		if (gameState.currentTurnEntityId && gameState.turnCounter) {
			const currentUserId = auth$.client.value?.id;

			// Update game state turn counter
			if (typeof gameState.turnCounter === 'number') {
				store.gameState.turnCounter = gameState.turnCounter;
			}

			// Dispatch turn events based on entity
			if (gameState.currentTurnEntityId === currentUserId) {
				// It's the player's turn
				Rxjs.Next("match", {
					cta: "onPlayerTurn",
					data: { turnNumber: gameState.turnCounter }
				});
			} else {
				// It's the enemy's turn
				Rxjs.Next("match", {
					cta: "onEnemyTurn",
					data: { turnNumber: gameState.turnCounter }
				});
			}
		}

		// Handle timer updates
		if (gameState.timer && typeof gameState.timer === 'object') {
			const timer = gameState.timer;

			// Validate timer properties
			if (typeof timer.remaining === 'number' &&
				typeof timer.elapsed === 'number' &&
				typeof timer.percentage === 'number' &&
				typeof timer.duration === 'number') {

				// Dispatch timer update event
				Rxjs.Next("match", {
					cta: "onTimerUpdate",
					data: {
						remaining: Math.max(0, timer.remaining),
						elapsed: timer.elapsed,
						percentage: Math.max(0, Math.min(100, timer.percentage)),
						duration: timer.duration
					}
				});

				// If timer has expired (remaining <= 0), dispatch timer expired event
				if (timer.remaining <= 0) {
					Rxjs.Next("match", {
						cta: "onTimerExpired",
						data: {
							turnNumber: gameState.turnCounter || 0,
							entityId: gameState.currentTurnEntityId
						}
					});
				}
			} else {
				console.warn('Invalid timer data in match state update:', timer);
			}
		}

		// Handle other game state updates (health, etc.)
		if (gameState.entities && Array.isArray(gameState.entities)) {
			const currentUserId = auth$.client.value?.id;

			gameState.entities.forEach((entity: any) => {
				if (entity && typeof entity === 'object' && entity.id) {
					if (entity.id === currentUserId) {
						// Update player health if provided
						if (typeof entity.health === 'number' && typeof entity.maxHealth === 'number') {
							store.gameState.playerHealth = entity.health;
							store.gameState.playerMaxHealth = entity.maxHealth;
						}
					} else {
						// Update enemy health if provided
						if (typeof entity.health === 'number' && typeof entity.maxHealth === 'number') {
							store.gameState.enemyHealth = entity.health;
							store.gameState.enemyMaxHealth = entity.maxHealth;
						}
					}
				}
			});
		}

		// Log successful processing
		Lib.Log(`Match state updated - Turn: ${gameState.turnCounter}, Timer: ${gameState.timer?.remaining}ms remaining`);
	}

	/**
	 * Handle damage dealt events from server
	 */
	function handleDamageDealt(data: any) {
		Lib.Log("Damage dealt:", data);

		const { attackerId, targetId, damage, message } = data.content || data;
		const currentUserId = auth$.client.value?.id;

		// Update UI with damage information (could trigger animations, floating text, etc.)
		utils.toast.info(message, "bottom-right");

		// Update actions performed counter
		store.gameState.actionsPerformed++;

		// Add to game log if callback is available
		const logType = attackerId === currentUserId ? "player" : "enemy";
		Rxjs.Next("match", { cta: "onLogEntry", data: { type: logType, message } });

		Lib.Log(`${attackerId} dealt ${damage} damage to ${targetId}`);
	}

	/**
	 * Handle health update events from server
	 */
	function handleHealthUpdate(data: any) {
		Lib.Log("Health update:", data);

		const { entityId, health, maxHealth } = data.content || data;
		const currentUserId = auth$.client.value?.id;

		// Update health in game state based on entity
		if (entityId === currentUserId) {
			// Update player health
			store.gameState.playerHealth = health;
			store.gameState.playerMaxHealth = maxHealth;
			Rxjs.Next("match", { cta: "onLogEntry", data: { type: "player", message: "Health updated" } });
		} else {
			// Update enemy health
			store.gameState.enemyHealth = health;
			store.gameState.enemyMaxHealth = maxHealth;
			Rxjs.Next("match", { cta: "onLogEntry", data: { type: "enemy", message: "Health updated" } });
		}

		Rxjs.Next("match", {
			cta: "onTimerUpdate",
			data: {
				remaining: store.timerInfo.duration,
				elapsed: 0,
				percentage: 0,
				duration: store.timerInfo.duration
			}
		});

		Lib.Log(`Health updated for ${entityId}: ${health}/${maxHealth}`);
	}

	/**
	 * Handle turn start events from server
	 */
	function handleTurnStart(data: any) {
		Lib.Log("Turn start:", data);

		const { entityId, turnNumber } = data.content || data;
		const currentUserId = auth$.client.value?.id;

		// Update turn state
		if (entityId === currentUserId) {
			store.gameState.currentTurn = "player";
			utils.toast.info("Your turn!", "bottom-right");
			// Call frontend callback to update UI
			Rxjs.Next("match", { cta: "onPlayerTurn", data: {} });
		} else {
			store.gameState.currentTurn = "enemy";
			utils.toast.info("Enemy's turn...", "bottom-right");
			// Call frontend callback to update UI
			Rxjs.Next("match", { cta: "onEnemyTurn", data: {} });
		}

		Lib.Log(`Turn ${turnNumber} started for ${entityId}(${currentUserId})`);
	}

	/**
	 * Handle turn end events from server
	 */
	function handleTurnEnd(data: any) {
		Lib.Log("Turn end:", data);

		const { entityId, turnNumber } = data.content || data;
		// Could add turn end animations or effects here

		Lib.Log(`Turn ${turnNumber} ended for ${entityId}`);
	}

	/**
	 * Handle victory events from server
	 */
	function handleVictory(data: any) {
		Lib.Log("Victory event:", data);

		const { result, winnerId, message } = data.content || data;
		const currentUserId = auth$.client.value?.id;

		// Determine result from player's perspective
		let playerResult: "victory" | "defeat" | "draw";
		if (winnerId === currentUserId) {
			playerResult = "victory";
		} else {
			playerResult = "defeat";
		}

		// Handle match end with server-determined result
		handleMatchEnd({
			type: "match.end",
			result: playerResult,
			message,
		});

		Lib.Log(`Victory: ${result}, Winner: ${winnerId}`);
	}

	/**
	 * Handle match error events from server
	 */
	function handleMatchError(data: any) {
		Lib.Log("Match error:", data);

		const { error, entityId } = data.content || data;
		const currentUserId = auth$.client.value?.id;

		// Show error message to user if it affects them
		if (!entityId || entityId === currentUserId) {
			utils.toast.error(typeof error === "string" ? error : "Match error occurred", "center");
		}

		console.error(`Match error for ${entityId || "unknown"}: ${error}`);
	}

	/**
	 * Handle match end events
	 */
	function handleMatchEnd(data: any) {
		Lib.Log("Match ended:", data);

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
			timestamp: new Date(),
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
		if (result === "victory") {
			utils.toast.success(resultMessage, "bottom-right");
		} else if (result === "defeat") {
			utils.toast.error(resultMessage, "bottom-right");
		} else {
			utils.toast.info(resultMessage, "bottom-right");
		}

		Lib.Log("Match result:", matchResult);
	}

	/**
	 * Determine match result - now server authoritative only
	 */
	function determineMatchResult(data: any): "victory" | "defeat" | "disconnect" | "draw" {
		// Server always provides the result - no frontend logic needed
		if (data?.result) {
			return data.result;
		}

		// If no result provided by server, default to disconnect
		// This should not happen in normal server-authoritative flow
		console.warn("Match ended without server-provided result, defaulting to disconnect");
		return "disconnect";
	}

	/**
	 * Get user-friendly match result message
	 */
	function getMatchResultMessage(result: string): string {
		switch (result) {
			case "victory":
				return "🎉 Victory! You defeated the AI opponent!";
			case "defeat":
				return "💀 Defeat! The AI opponent proved too strong.";
			case "draw":
				return "🤝 Draw! Both fighters fell in battle.";
			case "disconnect":
				return "🔌 Match ended due to disconnection.";
			default:
				return "Match completed.";
		}
	}

	/**
	 * Save match result to database (placeholder for MongoDB integration)
	 */
	async function saveMatchResult(result: MatchResult) {
		try {
			// TODO: Integrate with MongoDB to save match statistics
			Lib.Log("Saving match result to database:", result);

			// This will be implemented when backend MongoDB integration is ready
			// await api.saveMatchResult(auth$.client.value.id, result);
		} catch (error) {
			console.error("Failed to save match result:", error);
		}
	}

	/**
	 * Handle ATB progress update events from server
	 */
	function handleATBProgressUpdate(data: any) {
		Lib.Log("ATB progress update:", data);

		// Validate input data structure
		if (!data || typeof data !== 'object') {
			console.warn('Invalid ATB progress update data:', data);
			return;
		}

		const content = data.content;
		if (!content || typeof content !== 'object') {
			console.warn('Invalid ATB progress update content:', content);
			return;
		}

		const atbData = content.atbData;
		if (!atbData || typeof atbData !== 'object') {
			console.warn('Invalid ATB data in progress update:', atbData);
			return;
		}

		// atbData contains readiness percentages for all entities
		// Example: { "player1": { readiness: 65.5 }, "npc1": { readiness: 23.1 } }
		const currentUserId = auth$.client.value?.id;


		// Extract player and enemy ATB progress
		let playerProgress: I_ATBEntityData = {
			readiness: 0
		};
		let enemyProgress: I_ATBEntityData ={
			readiness: 0
		};

		Object.entries(atbData).forEach(([entityId, entityData]: [string, any]) => {
			if (entityId === currentUserId) {
				playerProgress = entityData;
			} else {
				enemyProgress = entityData;
			}
		});

		// Dispatch ATB progress update event
		Rxjs.Next("match", {
			cta: "onATBProgressUpdate",
			data: {
				player: playerProgress,
				enemy: enemyProgress,
				timestamp: content.timestamp || new Date().toISOString()
			}
		});

		Lib.Log(`ATB Progress - Player: ${playerProgress?.readiness || 0}%, Enemy: ${enemyProgress?.readiness || 0}%`);
	}

	return {
		outputEvents,
		onWebsocketEvents,
	};
};

export default useMatchWebsocketEventHandler;
