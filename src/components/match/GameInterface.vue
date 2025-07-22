<template>
	<div class="game-interface">
		<!-- Game Header -->
		<div class="game-header">
			<div class="match-info">
				<span class="match-type">{{ matchTypeLabel }}</span>
				<span class="match-id">Match: {{ matchId || "Unknown" }}</span>
			</div>
		</div>
		<Button :disabled="isProcessingAction" v-ripple size="small" class="leavae-match-button pointer" @click="$emit('leave-match')">Leave Match</Button>

		<!-- Battle Area -->
		<BattleArea
			:player-health="gameState.playerHealth"
			:player-max-health="gameState.playerMaxHealth"
			:enemy-health="gameState.enemyHealth"
			:enemy-max-health="gameState.enemyMaxHealth"
			:enemy-name="enemyName"
			:is-player-turn="isPlayerTurn"
			:is-enemy-turn="isEnemyTurn" />

		<!-- Game Actions -->
		<GameActions :is-player-turn="isPlayerTurn" :is-processing-action="isProcessingAction" @attack="$emit('attack')" />

		<!-- Game Log -->
		<GameLog :game-log="gameLog" />
	</div>
</template>

<script lang="ts" setup>
import Button from "primevue/button";
import { GameState } from "../../stores/match.store";
import BattleArea from "./BattleArea.vue";
import GameActions from "./GameActions.vue";
import GameLog from "./GameLog.vue";

defineProps<{
	matchTypeLabel: string;
	matchId: string | null;
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
}>();

defineEmits<{
	(e: "attack"): void;
	(e: "leave-match"): void;
}>();
</script>

<style lang="scss" scoped>
@import "../../assets/css/styles/mixins/breakpoints";

.game-interface {
	padding: 1rem;
	width: 100%;
	max-width: 800px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 1rem;

	// Responsive padding
	@include breakpoint-down("sm") {
		padding: 0.5rem;
		gap: 0.75rem;
	}

	@include breakpoint-up("md") {
		gap: 1.5rem;
	}

	@include breakpoint-up("lg") {
		padding: 1.5rem;
		gap: 2rem;
	}
}

.game-header {
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 6px;
	padding: 1rem;
	position: relative;

	@include breakpoint-down("sm") {
		padding: 0.75rem;
		border-radius: 4px;
	}

	.match-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;

		.match-type {
			font-weight: 600;
			color: var(--p-primary-color);
			font-size: clamp(1rem, 2.5vw, 1.25rem);
		}

		.match-id {
			color: var(--p-text-muted-color);
			font-size: clamp(0.75rem, 2vw, 0.9rem);
		}

		// Stack on very small screens
		@include breakpoint-down(400px) {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
}

// Leave match button positioning
.leavae-match-button {
	position: absolute;
	top: 0.5rem;
	right: 0.5rem;

	@include breakpoint-up("sm") {
		top: 1rem;
		right: 1rem;
	}
}

// Ensure all child components are responsive
:deep(.battle-area),
:deep(.game-actions),
:deep(.game-log) {
	width: 100%;
}
</style>
