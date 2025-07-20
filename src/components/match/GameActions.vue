<template>
	<div class="game-actions">
		<div class="action-panel">
			<h4>Actions</h4>
			{{ isPlayerTurn }} {{isProcessingAction}}
			<div class="actions-grid">
				<Button 
					:disabled="!isPlayerTurn || isProcessingAction" 
					@click="$emit('attack')"
					severity="danger" 
					class="attack-button"
				>
					<i class="pi pi-bolt"></i>
					Attack
				</Button>
				<!-- Additional actions can be added here when implemented server-side -->
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import Button from "primevue/button";

interface Props {
	isPlayerTurn: boolean;
	isProcessingAction: boolean;
}

interface Emits {
	(e: 'attack'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.game-actions {
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 8px;
	padding: 1rem;

	.action-panel {
		h4 {
			margin: 0 0 1rem 0;
			color: var(--p-text-color);
		}

		.actions-grid {
			display: flex;
			gap: 1rem;
			justify-content: center;
			align-items: center;

			.attack-button {
				font-weight: 600;

				&:not(:disabled) {
					animation: pulse 2s infinite;
				}

				&:disabled {
					opacity: 0.6;
				}
			}

		}
	}
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(var(--p-red-500), 0.7);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(var(--p-red-500), 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(var(--p-red-500), 0);
	}
}

@media (max-width: 768px) {
	.actions-grid {
		flex-direction: column;
		
		.attack-button {
			width: 100%;
			min-width: unset;
		}
	}
}
</style>