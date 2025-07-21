<template>
	<ScrollPanel class="game-log" :style="{ height: '200px', width: '100%' }">
		<h4>Combat Log</h4>
		<div class="log-entries">
			<Message v-if="gameLog.length === 0" severity="info"> Match started! Waiting for first turn... </Message>
			<Message v-for="(entry, index) in gameLog" :key="index" :severity="getSeverityClass(entry.type)">
				<span class="log-timestamp">{{ formatTime(entry.timestamp) }}</span>
				<span class="log-message">{{ entry.message }}</span>
			</Message>
		</div>
	</ScrollPanel>
</template>

<script lang="ts" setup>
import Message from "primevue/message";
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
	return date.toLocaleTimeString("en-US", {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

function getSeverityClass(type: string) {
	switch (type) {
		case "player":
			return "success";
		case "enemy":
			return "info";
		case "system":
			return "warn";
		case "damage":
			return "error";
		case "heal":
			return "secondary";
		case "victory":
			return "contrast";
		case "defeat":
			return "error";
		default:
			return "info";
	}
}
</script>

<style lang="scss" scoped>
@use "../../assets/css/common.scss" as *;
@use "../../assets/css/variables.scss" as *;

.game-log {
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 8px;
	padding: $viewSpacing;

	h4 {
		margin: 0 0 $viewSpacing 0;
		color: var(--p-text-color);
	}

	.log-entries {
		display: flex;
		flex-direction: column;
		gap: $spacing;

		.log-timestamp {
			font-size: 0.8rem;
			font-family: monospace;
			min-width: 70px;
			padding: 0 $spacing;
		}

		.log-message {
			flex: 1;
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
