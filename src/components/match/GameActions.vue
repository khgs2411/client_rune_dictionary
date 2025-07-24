<template>
	<div class="game-actions">
		<!-- Action Panel (Bottom Center) -->
		<div class="action-panel">
			<div class="action-prompt" v-if="isPlayerTurn && !isProcessingAction">What will {{ playerName }} do?</div>
			<div class="action-prompt" v-else-if="isEnemyTurn">{{ enemyName }} is thinking...</div>
			<div class="action-buttons" v-if="isPlayerTurn && !isProcessingAction">
				<Button label="Attack" icon="pi pi-bolt" severity="danger" class="action-btn attack-btn" :disabled="isProcessingAction" @click="$emit('attack')" />
				<!-- Future buttons can go here - the panel will auto-expand -->
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

// Action Panel - Slick and modern with dynamic width
.action-panel {
	position: absolute;
	bottom: 12px;
	left: 50%;
	transform: translateX(-50%);
	width: auto; // Dynamic width based on content
	min-width: 280px; // Thinner minimum width for desktop
	max-width: min(600px, calc(100% - 40px)); // Allow wider for more buttons
	background: var(--p-content-background);
	border: 1px solid var(--p-surface-border);
	border-radius: 16px; // More modern rounded corners
	padding: 12px 20px; // Horizontal padding for dynamic sizing
	z-index: 5;
	box-shadow:
		0 1px 3px rgba(0, 0, 0, 0.06),
		0 2px 8px rgba(0, 0, 0, 0.08);
	backdrop-filter: none;
	opacity: 1;

	@include breakpoint-down("md") {
		width: calc(100% - 20px); // Full width on tablets
		min-width: unset;
		padding: 10px 14px;
		bottom: 10px;
	}

	@include breakpoint-down("sm") {
		width: calc(100% - 16px); // Almost full width on mobile
		padding: 10px 12px;
		bottom: 8px;
		border-radius: 12px;
	}
}

.action-prompt {
	font-size: 0.95rem;
	font-weight: 500;
	color: var(--p-text-color);
	margin-bottom: 10px;
	text-align: center;
	line-height: 1.2;

	@include breakpoint-down("sm") {
		font-size: 0.9rem;
		margin-bottom: 8px;
	}
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
	margin-bottom: 12px;
	flex-wrap: wrap; // Allow wrapping if too many buttons

	@include breakpoint-down("sm") {
		gap: 6px;
		margin-bottom: 10px;
		width: 100%;
		flex-direction: column; // Stack vertically on mobile
	}

	.action-btn {
		padding: 8px 16px; // Slightly less horizontal padding
		font-size: 0.9rem;
		font-weight: 600;
		border-radius: 10px;
		transition: all 0.15s ease;
		min-width: 100px; // Smaller min width for more buttons
		height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		white-space: nowrap; // Prevent text wrapping

		&.attack-btn {
			background: var(--p-red-500);
			border-color: var(--p-red-500);
			color: white;

			&:hover:not(:disabled) {
				background: var(--p-red-600);
				border-color: var(--p-red-600);
				transform: translateY(-1px);
				box-shadow: 0 2px 6px rgba(var(--p-red-500-rgb), 0.3);
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

// Control Buttons Row - Compact and modern
.control-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
	padding-top: 10px;
	border-top: 1px solid var(--p-surface-border);

	.control-btn {
		background: transparent;
		border: 1px solid var(--p-surface-border);
		color: var(--p-text-muted-color);
		width: 32px;
		height: 32px;
		transition: all 0.15s ease;

		&:hover {
			background: var(--p-surface-50);
			border-color: var(--p-primary-200);
			color: var(--p-primary-color);
			transform: translateY(-1px);
		}

		&:active {
			transform: translateY(0);
		}

		:deep(.p-button-icon) {
			font-size: 0.9rem;
		}
	}

	@include breakpoint-down("sm") {
		padding-top: 8px;
		gap: 6px;

		.control-btn {
			width: 30px;
			height: 30px;

			:deep(.p-button-icon) {
				font-size: 0.85rem;
			}
		}
	}
}
</style>
