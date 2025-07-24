<template>
	<div class="game-actions">
		<!-- Action Panel (Bottom Center) -->
		<div class="action-panel">
			<div class="action-prompt" v-if="isPlayerTurn && !isProcessingAction">What will {{ playerName }} do?</div>
			<div class="action-prompt" v-else-if="isEnemyTurn">{{ enemyName }} is thinking...</div>
			<div class="action-buttons" v-if="isPlayerTurn && !isProcessingAction">
				<Button label="Attack" icon="pi pi-bolt" severity="danger" class="action-btn attack-btn" :disabled="isProcessingAction" @click="$emit('attack')" />
				<!-- Future buttons can go here -->
			</div>

			<!-- Control Buttons Row -->
			<div class="control-buttons">
				<Button icon="pi pi-cog" class="control-btn" severity="secondary" text rounded v-tooltip.top="'Settings'" @click="$emit('open-settings')" />
				<Button icon="pi pi-book" class="control-btn" severity="secondary" text rounded v-tooltip.top="'Combat Log'" @click="$emit('toggle-log')" />
				<Button icon="pi pi-times" class="control-btn" severity="secondary" text rounded v-tooltip.top="'Leave Match'" @click="$emit('leave-match')" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import Button from "primevue/button";

interface Props {
	playerName?: string;
	enemyName: string;
	isPlayerTurn: boolean;
	isEnemyTurn: boolean;
	isProcessingAction: boolean;
}

defineProps<Props>();

defineEmits<{
	(e: "attack"): void;
	(e: "leave-match"): void;
	(e: "open-settings"): void;
	(e: "toggle-log"): void;
}>();
</script>

<style lang="scss" scoped>
@use "../../assets/css/styles/mixins/breakpoints" as *;

// Action Panel
.action-panel {
	position: absolute;
	bottom: 20px;
	left: 50%;
	transform: translateX(-50%);
	width: calc(100% - 40px);
	max-width: 600px;
	background: var(--p-content-background);
	border: 1px solid var(--p-surface-border);
	border-radius: var(--p-border-radius-lg);
	padding: 24px;
	z-index: 5;
	box-shadow:
		0 2px 4px rgba(0, 0, 0, 0.08),
		0 4px 16px rgba(0, 0, 0, 0.12);
	backdrop-filter: none;
	opacity: 1;

	@include breakpoint-down("md") {
		width: calc(100% - 20px);
		padding: 20px;
		bottom: 16px;
	}

	@include breakpoint-down("sm") {
		padding: 16px;
		bottom: 12px;
	}
}

.action-prompt {
	font-size: 1.1rem;
	font-weight: 600;
	color: var(--p-text-color);
	margin-bottom: 16px;
	text-align: center;
	line-height: 1.4;

	@include breakpoint-down("sm") {
		font-size: 1rem;
		margin-bottom: 12px;
	}
}

.action-buttons {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
	gap: 12px;
	margin-bottom: 20px;

	@include breakpoint-down("sm") {
		grid-template-columns: 1fr;
		gap: 10px;
		margin-bottom: 16px;
	}

	.action-btn {
		padding: 12px 24px;
		font-size: 1rem;
		font-weight: 600;
		border-radius: var(--p-border-radius);
		transition: all 0.2s ease;
		min-width: 140px;
		height: 48px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;

		&.attack-btn {
			background: var(--p-red-500);
			border-color: var(--p-red-500);
			color: white;

			&:hover:not(:disabled) {
				background: var(--p-red-600);
				border-color: var(--p-red-600);
				transform: translateY(-2px);
				box-shadow: 0 4px 12px rgba(var(--p-red-500-rgb), 0.4);
			}

			&:active:not(:disabled) {
				transform: translateY(0);
			}
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
			transform: none !important;
		}

		@include breakpoint-down("sm") {
			width: 100%;
			min-width: unset;
		}
	}
}

// Control Buttons Row
.control-buttons {
	display: flex;
	justify-content: center;
	gap: 12px;
	padding-top: 16px;
	border-top: 1px solid var(--p-surface-border);

	.control-btn {
		background: var(--p-content-background);
		border: 1px solid var(--p-primary-color);
		color: var(--p-text-color);
		width: 40px;
		height: 40px;
		transition: all 0.2s ease;

		&:hover {
			// background: var(--p-surface-100);
			transform: translateY(-2px);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			color: var(--p-primary-color);
		}

		&:active {
			transform: translateY(0);
		}

		:deep(.p-button-icon) {
			font-size: 1.1rem;
		}
	}

	@include breakpoint-down("sm") {
		padding-top: 12px;
		gap: 8px;

		.control-btn {
			width: 36px;
			height: 36px;

			:deep(.p-button-icon) {
				font-size: 1rem;
			}
		}
	}
}
</style>
