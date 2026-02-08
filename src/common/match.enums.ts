/**
 * Match Action Types - What actions can be performed
 * Mirrors server definition from: server_rune_matchmaking/src/domains/match/match.enums.ts
 */
export enum E_MatchActionType {
	ATTACK = "attack",
	PASS = "pass", // Pass turn without taking action
	ABILITY = "ability", // Use ability with execution effects
}

/**
 * Match End Results
 * Mirrors server definition
 */
export enum E_MatchResult {
	VICTORY = "victory",
	DEFEAT = "defeat",
	DRAW = "draw",
	DISCONNECT = "disconnect",
	CANCELLED = "cancelled",
}

/**
 * Match Event Types
 * Standardized event strings for WebSocket listeners
 */
export enum E_MatchEventType {
	CREATED = "match.created",
	STATE_CHANGE = "match.state.change",
	HEALTH_UPDATE = "match.health.update",
	ATB_READINESS_UPDATE = "match.atb.readiness.update",
	TURN_START = "match.turn.start",
	TURN_END = "match.turn.end",
	STATE_UPDATE = "match.state.update",
	DAMAGE_DEALT = "match.damage.dealt",
	VICTORY = "match.victory",
	END = "match.end",
	ACTION = "match.action",
	COMBAT_SEQUENCE = "match.combat_sequence",
	COMBAT_SEQUENCE_ACK = "match.combat_sequence_ack",
	ACTIVE_EFFECTS_SNAPSHOT = "match.active_effects_snapshot",
}
