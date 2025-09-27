import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import { E_MatchState } from "../components/match/useMatch";

export interface MatchResult {
	result: "victory" | "defeat" | "disconnect" | "draw" | "loading";
	duration: number; // in seconds
	playerHealth: number;
	enemyHealth: number;
	actionsPerformed: number;
	timestamp: Date;
}

export interface GameState {
	playerHealth: number;
	enemyHealth: number;
	playerMaxHealth: number;
	enemyMaxHealth: number;
	currentTurn: "player" | "enemy";
	actionsPerformed: number;
	matchStartTime: Date | null;
	turnCounter: number;
}

export const useMatchStore = defineStore(
	"match",
	() => {
		const currentMatchId = ref(<string | null>null);
		const currentChannelId = ref(<string | null>null);
		const matchState = ref(E_MatchState.LOBBY);
		const isConnectedToMatch = ref(false);

		// Enhanced match data
		const matchResult = ref(<MatchResult | null>null);
		const timerInfo: Ref<{
			/** The duration in which the entity is allowed to take action in milliseconds (default: 5000) */
			duration: number;
			/** Action to take when timer expires (default: 'pass') */
			fallbackAction: 'pass' | 'skip';
			/** Warning threshold as percentage of total duration (default: 80) */
			warningThreshold: number;
			/** Enable speed-based turn timing (default: false) */
			useSpeedBasedTurns?: boolean;
		}> = ref({
			duration: 3000,
			fallbackAction: 'pass',
			warningThreshold: 80,
			useSpeedBasedTurns: false,
		})
		const gameState = ref(<GameState>{
			playerHealth: 10,
			enemyHealth: 10,
			playerMaxHealth: 10,
			enemyMaxHealth: 10,
			currentTurn: "player",
			actionsPerformed: 0,
			matchStartTime: null,
			turnCounter: 0,
		});

		// Match history for this session
		const matchHistory = ref(<MatchResult[]>[]);

		return {
			currentMatchId,
			currentChannelId,
			matchState,
			isConnectedToMatch,
			matchResult,
			gameState,
			matchHistory,
			timerInfo,
		};
	},
	{
		persist: true,
	},
);
