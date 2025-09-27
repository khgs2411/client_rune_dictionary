<template>
	<div class="game-interface">
		<!-- Battle Arena for battlefield display -->
		<BattleArena
			:player-health="gameState.playerHealth"
			:player-max-health="gameState.playerMaxHealth"
			:enemy-health="gameState.enemyHealth"
			:enemy-max-health="gameState.enemyMaxHealth"
			:enemy-name="enemyName"
			:is-player-turn="isPlayerTurn"
			:is-enemy-turn="isEnemyTurn"
			:is-processing-action="isProcessingAction"
			:timer-remaining="timerRemaining"
			:timer-duration="timerDuration"
			:timer-active="timerActive"
			:player-atb-progress="playerAtbProgress"
			:enemy-atb-progress="enemyAtbProgress" />
		
		<!-- Game Actions for controls and action buttons -->
		<GameActions
			:player-name="playerName"
			:enemy-name="enemyName"
			:is-player-turn="isPlayerTurn"
			:is-enemy-turn="isEnemyTurn"
			:is-processing-action="isProcessingAction"
			@attack="$emit('attack')"
			@leave-match="$emit('leave-match')"
			@open-settings="$emit('open-settings')"
			@toggle-log="$emit('toggle-log')" />
	</div>
</template>

<script lang="ts" setup>
import { GameState } from "../../stores/match.store";
import BattleArena from "./BattleArena.vue";
import GameActions from "./GameActions.vue";

defineProps<{
	matchTypeLabel: string;
	matchId: string | null;
	playerName?: string;
	enemyName: string;
	gameState: GameState;
	isPlayerTurn: boolean;
	isEnemyTurn: boolean;
	isProcessingAction: boolean;
	gameLog: Array<{
		type: string;
		message: string;
		timestamp: Date;
	}>;
	// Timer props
	timerRemaining?: number;
	timerDuration?: number;
	timerActive?: boolean;
	// ATB props
	playerAtbProgress?: number;
	enemyAtbProgress?: number;
}>();

defineEmits<{
	(e: "attack"): void;
	(e: "leave-match"): void;
	(e: "open-settings"): void;
	(e: "toggle-log"): void;
}>();
</script>

<style lang="scss" scoped>
@use "../../assets/css/styles/mixins/_breakpoints" as *;

.game-interface {
	width: 100%;
	height: 100%;
	position: relative;
}
</style>
