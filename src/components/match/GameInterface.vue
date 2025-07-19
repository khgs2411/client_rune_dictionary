<template>
	<div class="game-interface">
		<!-- Game Header -->
		<div class="game-header">
			<div class="match-info">
				<span class="match-type">{{ matchTypeLabel }}</span>
				<span class="match-id">Match: {{ matchId || 'Unknown' }}</span>
			</div>
		</div>

		<!-- Battle Area -->
		<BattleArea 
			:player-health="gameState.playerHealth"
			:player-max-health="gameState.playerMaxHealth"
			:enemy-health="gameState.enemyHealth"
			:enemy-max-health="gameState.enemyMaxHealth"
			:enemy-name="enemyName"
			:is-player-turn="isPlayerTurn"
			:is-enemy-turn="isEnemyTurn"
		/>

		<!-- Game Actions -->
		<GameActions 
			:is-player-turn="isPlayerTurn"
			:is-processing-action="isProcessingAction"
			@attack="$emit('attack')"
			@test-victory="$emit('testVictory')"
		/>

		<!-- Game Log -->
		<GameLog :game-log="gameLog" />
	</div>
</template>

<script lang="ts" setup>
import { GameState } from '../../stores/match.store';
import BattleArea from './BattleArea.vue';
import GameActions from './GameActions.vue';
import GameLog from './GameLog.vue';

interface Props {
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
}

interface Emits {
	(e: 'attack'): void;
	(e: 'testVictory'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.game-interface {
	padding: 1rem;
	width: 600px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.game-header {
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 6px;
	padding: 1rem;

	.match-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;

		.match-type {
			font-weight: 600;
			color: var(--p-primary-color);
			font-size: 1.1rem;
		}

		.match-id {
			color: var(--p-text-muted-color);
			font-size: 0.9rem;
		}
	}
}

@media (max-width: 768px) {
	.game-interface {
		padding: 0.5rem;
	}

	.match-info {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>