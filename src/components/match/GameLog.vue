<template>
	<ScrollPanel class="game-log" :style="{ height: '200px', width: '100%' }">
		<h4>Combat Log</h4>
		<div class="log-entries">
			<div v-for="(entry, index) in gameLog" :key="index" class="log-entry" :class="entry.type">
				<span class="log-timestamp">{{ formatTime(entry.timestamp) }}</span>
				<span class="log-message">{{ entry.message }}</span>
			</div>
			<div v-if="gameLog.length === 0" class="log-entry system">
				<span class="log-message">Match started! Waiting for first turn...</span>
			</div>
		</div>
	</ScrollPanel>
</template>

<script lang="ts" setup>
import ScrollPanel from "primevue/scrollpanel";

interface Props {
	gameLog: Array<{
		type: string;
		message: string;
		timestamp: Date;
	}>;
}

defineProps<Props>();

function formatTime(date: Date): string {
	return date.toLocaleTimeString('en-US', { 
		hour12: false, 
		hour: '2-digit', 
		minute: '2-digit', 
		second: '2-digit' 
	});
}
</script>

<style lang="scss" scoped>
.game-log {
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 8px;
	padding: 1rem;

	h4 {
		margin: 0 0 1rem 0;
		color: var(--p-text-color);
	}

	.log-entries {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		.log-entry {
			padding: 0.5rem;
			border-radius: 4px;
			border-left: 4px solid transparent;
			background: var(--p-surface-100);
			display: flex;
			gap: 0.75rem;
			align-items: center;

			.log-timestamp {
				font-size: 0.8rem;
				color: var(--p-text-muted-color);
				font-family: monospace;
				min-width: 70px;
			}

			.log-message {
				flex: 1;
				color: var(--p-text-color);
			}

			&.player {
				border-left-color: var(--p-primary-color);
				background: var(--p-primary-50);
			}

			&.enemy {
				border-left-color: var(--p-orange-500);
				background: var(--p-orange-50);
			}

			&.system {
				border-left-color: var(--p-surface-500);
				background: var(--p-surface-200);
				font-style: italic;
			}

			&.damage {
				border-left-color: var(--p-red-500);
				background: var(--p-red-50);
			}

			&.heal {
				border-left-color: var(--p-green-500);
				background: var(--p-green-50);
			}

			&.victory {
				border-left-color: var(--p-green-500);
				background: var(--p-green-100);
				font-weight: 600;
			}

			&.defeat {
				border-left-color: var(--p-red-500);
				background: var(--p-red-100);
				font-weight: 600;
			}
		}
	}
}

@media (max-width: 768px) {
	.log-entry {
		.log-timestamp {
			min-width: 60px;
			font-size: 0.75rem;
		}

		.log-message {
			font-size: 0.9rem;
		}
	}
}
</style>