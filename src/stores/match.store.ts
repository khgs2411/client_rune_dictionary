import { defineStore } from "pinia";
import { ref } from "vue";
import { E_MatchState } from "../components/match/useMatch";

export interface MatchResult {
    result: 'victory' | 'defeat' | 'disconnect' | 'draw' | 'loading';
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
    currentTurn: 'player' | 'enemy';
    actionsPerformed: number;
    matchStartTime: Date | null;
}

export const useMatchStore = defineStore('match', () => {
    const currentMatchId = ref(<string | null>null);
    const currentChannelId = ref(<string | null>null);
    const matchState = ref(E_MatchState.LOBBY);
    const isConnectedToMatch = ref(false);
    
    // Enhanced match data
    const matchResult = ref(<MatchResult | null>null);
    const gameState = ref(<GameState>({
        playerHealth: 100,
        enemyHealth: 100,
        playerMaxHealth: 100,
        enemyMaxHealth: 100,
        currentTurn: 'player',
        actionsPerformed: 0,
        matchStartTime: null
    }));
    
    // Match history for this session
    const matchHistory = ref(<MatchResult[]>[]);

    return {
        currentMatchId,
        currentChannelId,
        matchState,
        isConnectedToMatch,
        matchResult,
        gameState,
        matchHistory
    }
}, {
    persist: true
});