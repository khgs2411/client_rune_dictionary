<template>
	<div class="battle-area">
		<!-- Player Section -->
		<div class="player-section">
			<div class="player-card">
				<div class="player-avatar">
					<i class="pi pi-user" style="font-size: 2rem; color: var(--p-primary-color);"></i>
				</div>
				<div class="player-info">
					<h3>You</h3>
					<div class="health-bar">
						<div class="health-fill"
							:style="{ width: `${(playerHealth / playerMaxHealth) * 100}%` }">
						</div>
						<span class="health-text">{{ playerHealth }} / {{ playerMaxHealth }}</span>
					</div>
				</div>
				<div class="turn-indicator" :class="{ active: isPlayerTurn }">
					<span v-if="isPlayerTurn">Your Turn</span>
				</div>
			</div>
		</div>

		<!-- VS Divider -->
		<div class="vs-divider">
			<span class="vs-text">VS</span>
		</div>

		<!-- Enemy Section -->
		<div class="enemy-section">
			<div class="enemy-card">
				<div class="enemy-avatar">
					<i class="pi pi-android" style="font-size: 2rem; color: var(--p-orange-500);"></i>
				</div>
				<div class="enemy-info">
					<h3>{{ enemyName }}</h3>
					<div class="health-bar">
						<div class="health-fill enemy"
							:style="{ width: `${(enemyHealth / enemyMaxHealth) * 100}%` }">
						</div>
						<span class="health-text">{{ enemyHealth }} / {{ enemyMaxHealth }}</span>
					</div>
				</div>
				<div class="turn-indicator" :class="{ active: isEnemyTurn }">
					<span v-if="isEnemyTurn">{{ enemyName }}'s Turn</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	playerHealth: number;
	playerMaxHealth: number;
	enemyHealth: number;
	enemyMaxHealth: number;
	enemyName: string;
	isPlayerTurn: boolean;
	isEnemyTurn: boolean;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.battle-area {
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	gap: 1rem;
	align-items: center;
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 8px;
	padding: 1.5rem;
}

.player-section,
.enemy-section {
	.player-card,
	.enemy-card {
		background: var(--p-surface-100);
		border-radius: 8px;
		padding: 1rem;
		text-align: center;
		border: 2px solid transparent;
		transition: border-color 0.3s ease;

		&:hover {
			border-color: var(--p-primary-color);
		}
	}

	.player-avatar,
	.enemy-avatar {
		margin-bottom: 0.5rem;
	}

	.player-info,
	.enemy-info {
		h3 {
			margin: 0 0 0.75rem 0;
			color: var(--p-text-color);
		}
	}

	.health-bar {
		position: relative;
		background: var(--p-surface-200);
		border-radius: 12px;
		height: 24px;
		overflow: hidden;
		margin-bottom: 0.75rem;

		.health-fill {
			background: var(--p-green-500);
			height: 100%;
			border-radius: 12px;
			transition: width 0.3s ease;

			&.enemy {
				background: var(--p-orange-500);
			}
		}

		.health-text {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-weight: 600;
			font-size: 0.85rem;
			color: white;
			text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		}
	}

	.turn-indicator {
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.85rem;
		opacity: 0;
		transition: opacity 0.3s ease;

		&.active {
			opacity: 1;
			background: var(--p-primary-100);
			color: var(--p-primary-700);
		}
	}
}

.vs-divider {
	display: flex;
	align-items: center;
	justify-content: center;
	
	.vs-text {
		background: var(--p-primary-color);
		color: white;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
}

@media (max-width: 768px) {
	.battle-area {
		grid-template-columns: 1fr;
		grid-template-rows: auto auto auto;
		gap: 1rem;
		
		.vs-divider {
			order: 2;
			
			.vs-text {
				width: 40px;
				height: 40px;
				font-size: 1rem;
			}
		}
		
		.enemy-section {
			order: 3;
		}
	}
}
</style>