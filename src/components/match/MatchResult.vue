<template>
	<div class="match-result-screen">
		<div class="result-container" :class="getResultIconClass()">
			<div class="result-header">
				<div class="result-icon" :class="getResultIconClass()">
					<i :class="getResultIcon()"></i>
				</div>
				<h2 class="result-title">{{ getResultTitle() }}</h2>
				<p class="result-subtitle">{{ getResultSubtitle() }}</p>
			</div>

			<div class="result-stats">
				<div class="stat-row">
					<span class="stat-label">Match Duration:</span>
					<span class="stat-value">{{ formatDuration(matchResult?.duration || 0) }}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Your Health:</span>
					<span class="stat-value">{{ matchResult?.playerHealth || 0 }} HP</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Enemy Health:</span>
					<span class="stat-value">{{ matchResult?.enemyHealth || 0 }} HP</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Actions Performed:</span>
					<span class="stat-value">{{ matchResult?.actionsPerformed || 0 }}</span>
				</div>
			</div>

			<div class="session-stats">
				<h3>Session Statistics</h3>
				<div class="stats-grid">
					<div class="stat-item">
						<span class="stat-number">{{ sessionStats.victories }}</span>
						<span class="stat-text">Victories</span>
					</div>
					<div class="stat-item">
						<span class="stat-number">{{ sessionStats.defeats }}</span>
						<span class="stat-text">Defeats</span>
					</div>
					<div class="stat-item">
						<span class="stat-number">{{ sessionStats.winRate }}%</span>
						<span class="stat-text">Win Rate</span>
					</div>
					<div class="stat-item">
						<span class="stat-number">{{ sessionStats.totalMatches }}</span>
						<span class="stat-text">Total Matches</span>
					</div>
				</div>
			</div>

			<div class="result-actions">
				<Button :loading="isLoading" @click="$emit('rematch')" severity="success" size="large" class="rematch-button">
					<i class="pi pi-refresh"></i>
					Rematch
				</Button>
				<Button @click="$emit('returnToLobby')" :disabled="isLoading" severity="secondary" size="large" class="lobby-button">
					<i class="pi pi-home"></i>
					Return to Lobby
				</Button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import Button from "primevue/button";
import { MatchResult } from "../../stores/match.store";

interface Props {
	matchResult: MatchResult | null;
	sessionStats: {
		victories: number;
		defeats: number;
		winRate: number;
		totalMatches: number;
	};
	isLoading: boolean;
}

interface Emits {
	(e: "rematch"): void;
	(e: "returnToLobby"): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

function getResultIconClass() {
	const result = props.matchResult?.result;
	return result || "disconnect";
}

function getResultIcon() {
	const result = props.matchResult?.result;
	switch (result) {
		case "victory":
			return "pi pi-trophy";
		case "defeat":
			return "pi pi-times-circle";
		case "draw":
			return "pi pi-minus-circle";
		default:
			return "pi pi-info-circle";
	}
}

function getResultTitle() {
	const result = props.matchResult?.result;
	switch (result) {
		case "victory":
			return "Victory!";
		case "defeat":
			return "Defeat";
		case "draw":
			return "Draw";
		default:
			return "Match Complete";
	}
}

function getResultSubtitle() {
	const result = props.matchResult?.result;
	switch (result) {
		case "victory":
			return "You defeated the AI opponent!";
		case "defeat":
			return "The AI opponent proved too strong.";
		case "draw":
			return "Both fighters fell in battle.";
		default:
			return "The match has ended.";
	}
}

function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
</script>

<style lang="scss" scoped>
.match-result-screen {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 80vh;
	padding: 2rem;
}

.result-container {
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 8px;
	padding: 2rem;
	text-align: center;
	max-width: 600px;
	width: 100%;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
	margin-bottom: 2rem;

	.result-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem;
		font-size: 2rem;

		&.victory {
			background: var(--p-green-100);
			color: var(--p-green-600);
			border: 3px solid var(--p-green-200);
		}

		&.defeat {
			background: var(--p-red-100);
			color: var(--p-red-600);
			border: 3px solid var(--p-red-200);
		}

		&.draw {
			background: var(--p-orange-100);
			color: var(--p-orange-600);
			border: 3px solid var(--p-orange-200);
		}

		&.disconnect {
			background: var(--p-surface-100);
			color: var(--p-surface-600);
			border: 3px solid var(--p-surface-200);
		}
	}

	.result-title {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: var(--p-text-color);

		.victory & {
			color: var(--p-green-400);
		}

		.defeat & {
			color: var(--p-red-400);
		}

		.draw & {
			color: var(--p-orange-400);
		}
	}

	.result-subtitle {
		font-size: 1.1rem;
		color: var(--p-text-muted-color);
		margin-bottom: 0;
	}
}

.result-stats {
	margin-bottom: 2rem;

	.stat-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--p-surface-200);

		&:last-child {
			border-bottom: none;
		}

		.stat-label {
			font-weight: 500;
			color: var(--p-text-muted-color);
		}

		.stat-value {
			font-weight: 600;
			color: var(--p-primary-color);
		}
	}
}

.session-stats {
	margin-bottom: 2rem;

	h3 {
		margin-bottom: 1rem;
		color: var(--p-text-color);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;

		.stat-item {
			text-align: center;
			padding: 1rem;
			background: var(--p-content-background);
			border: 1px solid var(--p-surface-200);
			border-radius: 6px;

			.stat-number {
				display: block;
				font-size: 1.5rem;
				font-weight: 700;
				color: var(--p-primary-color);
				margin-bottom: 0.25rem;
			}

			.stat-text {
				font-size: 0.875rem;
				color: var(--p-text-muted-color);
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}
		}
	}
}

.result-actions {
	display: flex;
	gap: 1rem;
	justify-content: center;

	.rematch-button,
	.lobby-button {
		min-width: 140px;

		i {
			margin-right: 0.5rem;
		}
	}
}

@media (max-width: 768px) {
	.result-actions {
		flex-direction: column;
		align-items: center;

		.rematch-button,
		.lobby-button {
			width: 100%;
		}
	}

	.stats-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}
</style>
