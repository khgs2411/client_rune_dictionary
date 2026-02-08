<template>
	<div v-if="isVisible" class="turn-timer-bar">
		<div class="timer-track">
			<div
				class="timer-fill"
				:class="[isPlayerTurn ? 'fill-player' : 'fill-enemy', isUrgent && 'fill-urgent']"
				:style="{ width: `${timerPercent}%` }" />
		</div>
		<div class="timer-label">
			<Icon
				:icon="isPlayerTurn ? 'game-icons:knight-banner' : 'game-icons:skull-crossed-bones'"
				:class="['w-3.5 h-3.5', isPlayerTurn ? 'text-cyan-400' : 'text-red-400']" />
			<span :class="['timer-text', isUrgent && 'text-urgent']">
				{{ seconds }}s
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps<{
	seconds: number;
	maxSeconds: number;
	isVisible: boolean;
	isPlayerTurn: boolean;
}>();

const timerPercent = computed(() => {
	if (props.maxSeconds <= 0) return 100;
	return Math.max(0, Math.min(100, (props.seconds / props.maxSeconds) * 100));
});

const isUrgent = computed(() => props.seconds < 5);
</script>

<style scoped>
.turn-timer-bar {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 8px;
}

.timer-track {
	flex: 1;
	height: 4px;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 2px;
	overflow: hidden;
	border: 1px solid rgba(217, 170, 90, 0.15);
}

.timer-fill {
	height: 100%;
	border-radius: 2px;
	transition: width 0.3s linear;
}

.fill-player {
	background: linear-gradient(90deg, #0891b2, #22d3ee);
	box-shadow: 0 0 6px rgba(34, 211, 238, 0.3);
}

.fill-enemy {
	background: linear-gradient(90deg, #dc2626, #f87171);
	box-shadow: 0 0 6px rgba(248, 113, 113, 0.3);
}

.fill-urgent {
	animation: urgentPulse 0.6s ease-in-out infinite;
}

.timer-label {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
}

.timer-text {
	font-family: ui-monospace, monospace;
	font-size: 11px;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.6);
	letter-spacing: 0.05em;
}

.text-urgent {
	color: #f87171;
	text-shadow: 0 0 6px rgba(248, 113, 113, 0.4);
}

@keyframes urgentPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}
</style>
