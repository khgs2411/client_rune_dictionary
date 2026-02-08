import { E_MatchActionType, E_MatchEventType } from "@/common/match.enums";
import { useMatchStore } from "@/stores/match.store";
import { useWebSocketStore } from "@/stores/websocket.store";
import { WebsocketStructuredMessage } from "topsyde-utils";

/**
 * Composable for managing Match Actions (sending commands to server)
 * Pattern: Service-as-Composable
 */
export function useMatchActions() {
	const matchStore = useMatchStore();
	const websocketStore = useWebSocketStore();

	/**
	 * Send a generic match action to the server
	 */
	function sendAction(actionType: E_MatchActionType | string, payload?: any) {
		if (!matchStore.currentChannelId) {
			console.warn("[useMatchActions] Cannot send action: No active match channel");
			return;
		}
		if (!websocketStore.clientData) {
			console.error("[useMatchActions] Cannot send action: No client data");
			return;
		}

		// Get strict WebSocket instance (throws if not connected)
		const ws = websocketStore.getWebSocketInstance<true>();

		const wsm: WebsocketStructuredMessage = {
			type: "match.action", // Using string literal as per protocol, or could use Enum if standardized
			content: {
				actionType,
				matchId: matchStore.currentMatchId,
				...payload,
			},
			channel: matchStore.currentChannelId,
			timestamp: new Date().toISOString(),
			client: websocketStore.clientData,
		};

		console.log(`[useMatchActions] Sending action: ${actionType}`, wsm);
		ws.send(JSON.stringify(wsm));
	}

	/**
	 * Perform basic attack
	 */
	function attack() {
		sendAction(E_MatchActionType.ATTACK);
	}

	/**
	 * Pass turn
	 */
	function pass() {
		sendAction(E_MatchActionType.PASS);
	}

	/**
	 * Use an equipped ability by ID
	 */
	function useAbility(abilityId: string) {
		sendAction(E_MatchActionType.ABILITY, { skillId: abilityId });
	}

	/**
	 * Send combat sequence ACK directly (NOT via sendAction — different message type)
	 */
	function sendSequenceAck(matchId: string, token: string) {
		if (!websocketStore.clientData) {
			console.error("[useMatchActions] Cannot send ACK: No client data");
			return;
		}

		const ws = websocketStore.getWebSocketInstance<true>();
		const message: WebsocketStructuredMessage = {
			type: E_MatchEventType.COMBAT_SEQUENCE_ACK,
			content: { matchId, token },
			channel: matchId,
			client: websocketStore.clientData,
		};

		ws.send(JSON.stringify(message));
	}

	/**
	 * Run from match (if applicable)
	 * Note: "Run" might be an action OR a state change request depending on game logic.
	 * Assuming it's an action type 'run' based on HUD logic.
	 */
	function run() {
		// If 'run' isn't in the server Enum yet, we cast or add it.
		// Detailed check showed: ATTACK, PASS, ABILITY.
		// MatchHUD used 'run' string. We will support it dynamically or add TO Enum if user confirms.
		// For now using string literal to maintain current HUD behavior safely.
		sendAction("run");
	}

	return {
		sendAction,
		attack,
		pass,
		useAbility,
		run,
		sendSequenceAck,
	};
}
