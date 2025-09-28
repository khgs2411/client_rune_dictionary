<template>
	<div class="game-actions">
		<!-- Action Panel (Bottom Center) -->
		<div class="action-panel" :class="{ expanded: isExpanded, collapsed: !isExpanded }">
			<!-- Collapsed View (Mobile only) - Shows only Attack button -->
			<div class="collapsed-content" v-if="!isExpanded && isMobile && isPlayerTurn && !isProcessingAction">
				<div class="collapsed-inner">
					<Button label="Attack" icon="pi pi-bolt" severity="danger" class="action-btn attack-btn" :disabled="isProcessingAction" @click="$emit('attack')" />
					<button class="expand-indicator" @click="toggleExpanded">
						<i class="pi pi-angle-double-up"></i>
					</button>
				</div>
			</div>

			<!-- Expanded View -->
			<div class="expanded-content" v-if="(isExpanded && isMobile) || !isMobile || !isPlayerTurn || !isWaiting">
				<div class="action-prompt" v-if="isPlayerTurn && !isProcessingAction">What will {{ playerName }} do?</div>
				<div class="action-prompt" v-else-if="isEnemyTurn">{{ enemyName }} is thinking...</div>
				<div class="action-prompt" v-else-if="isWaiting">Waiting...</div>
				<div class="action-buttons" v-if="isPlayerTurn && !isProcessingAction">
					<Button label="Attack" icon="pi pi-bolt" severity="danger" class="action-btn attack-btn" :disabled="isProcessingAction" @click="$emit('attack')" />
					<Button label="Defend" icon="pi pi-shield" severity="info" class="action-btn" :disabled="isProcessingAction" />
					<Button label="Item" icon="pi pi-box" severity="success" class="action-btn" :disabled="isProcessingAction" />
					<Button label="Run" icon="pi pi-directions" severity="warning" class="action-btn" :disabled="isProcessingAction" @click="$emit('leave-match')" />
				</div>

				<!-- Control Buttons Row -->
				<div class="control-buttons">
					<Button icon="pi pi-cog" class="control-btn" severity="secondary" text rounded v-tooltip.top="'Settings'" @click="$emit('open-settings')" />
					<Button icon="pi pi-book" class="control-btn" severity="secondary" text rounded v-tooltip.top="'Combat Log'" @click="$emit('toggle-log')" />
					<Button icon="pi pi-times" class="control-btn" severity="secondary" text rounded v-tooltip.top="'Leave Match'" @click="$emit('leave-match')" />
				</div>

				<!-- Collapse indicator for mobile expanded view -->
				<button class="collapse-indicator" @click="toggleExpanded" v-if="isMobile && isPlayerTurn">
					<i class="pi pi-angle-double-down"></i>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import Button from "primevue/button";
import { ref } from "vue";
import useDevice from "../../common/composables/useDevice";

interface Props {
	playerName?: string;
	enemyName: string;
	isPlayerTurn: boolean;
	isEnemyTurn: boolean;
	isWaiting: boolean;
	isProcessingAction: boolean;
}

defineProps<Props>();

defineEmits<{
	(e: "attack"): void;
	(e: "leave-match"): void;
	(e: "open-settings"): void;
	(e: "toggle-log"): void;
}>();

// State for collapsed/expanded
const isExpanded = ref(false);

// Device detection using the new composable with custom 576px mobile breakpoint
const device = useDevice(576); // Mobile breakpoint at 576px for game actions
const { isMobile } = device;

// Watch for device changes and reset expanded state on desktop
const resetExpanded = () => {
	if (!isMobile.value) {
		isExpanded.value = false; // Reset when switching to desktop
	}
};

// Add resize listener for reset functionality
window.addEventListener("resize", resetExpanded);

const toggleExpanded = () => {
	isExpanded.value = !isExpanded.value;
};
</script>

<style lang="scss" scoped>
@use "../../assets/css/styles/mixins/_breakpoints" as *;

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
	transition: all 0.3s ease;

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

		// Collapsed state on mobile
		&.collapsed {
			padding: 8px;
			width: calc(100% - 16px);
			min-width: unset;

			.expanded-content {
				display: none;
			}
		}

		// Expanded state on mobile
		&.expanded {
			bottom: 8px;
			max-height: 60vh;
			overflow-y: auto;
			transition: max-height 0.3s ease;
		}
	}
}

// Expand/Collapse indicators - integrated into the action bar
.expand-indicator,
.collapse-indicator {
	display: none;
	background: transparent;
	border: none;
	color: var(--p-text-color);
	cursor: pointer;
	transition: all 0.2s ease;
	padding: 8px;

	i {
		font-size: 1.2rem;
		transition: transform 0.2s ease;
	}

	&:hover {
		color: var(--p-text-color);

		i {
			transform: translateY(-2px);
		}
	}

	&:active i {
		transform: translateY(0);
	}

	@include breakpoint-down("sm") {
		display: block;
	}
}

.expand-indicator {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--p-text-color);
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	width: 34px;
	height: 34px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	backdrop-filter: blur(4px);
	animation: pulse-glow 2s ease-in-out infinite;
	transition: all 0.3s ease;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

	i {
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	&:hover {
		background: oklch(from var(--foreground) l c h / 0.2);
		border-color: oklch(from var(--foreground) l c h / 0.5);
		transform: translateY(-50%) scale(1.05);
		box-shadow: 0 4px 12px oklch(0 0 0 / 0.2);
		animation-play-state: paused;

		i {
			transform: translateY(-1px);
			font-size: 1.1rem;
		}
	}

	&:active {
		transform: translateY(-50%) scale(0.95);
	}
}

@keyframes pulse-glow {
	0%,
	100% {
		transform: translateY(-50%);
		box-shadow:
			0 2px 8px oklch(0 0 0 / 0.1),
			0 0 0 0 oklch(from var(--foreground) l c h / 0.3);
	}
	50% {
		transform: translateY(-50%) translateY(-2px);
		box-shadow:
			0 4px 12px oklch(0 0 0 / 0.15),
			0 0 0 4px oklch(from var(--foreground) l c h / 0.1);
	}
}

.collapse-indicator {
	margin-top: 8px;
}

// Collapsed content - only visible on mobile when collapsed
.collapsed-content {
	display: none;

	@include breakpoint-down("sm") {
		display: block;
		width: 100%;

		.collapsed-inner {
			position: relative;
			width: 100%;
		}

		.action-btn {
			margin: 0;
			width: 100%;
			height: 48px;
			font-size: 1.1rem;
			font-weight: 700;
			padding-left: 48px; // Make room for expand indicator

			// Make it more prominent in collapsed mode
			&.attack-btn {
				background: var(--p-red-500);
				border-color: var(--p-red-500);
				box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);

				&:hover:not(:disabled) {
					background: var(--p-red-600);
					border-color: var(--p-red-600);
					transform: translateY(-1px);
					box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
				}
			}
		}
	}
}

// Expanded content
.expanded-content {
	// Always visible on desktop
	display: block;
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
