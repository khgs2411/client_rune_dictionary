<template>
	<div v-if="isVisible" class="text-center">
		<span
			:class="[
				'text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-1.5',
				seconds < 5 ? 'text-red-400 timer-urgent' : 'text-white/60',
			]">
			<Icon icon="game-icons:hourglass" :class="['w-4 h-4', seconds < 5 && 'animate-pulse']" />
			<span class="font-mono">{{ seconds }}s</span>
		</span>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
	seconds: number;
	isVisible: boolean;
}>();
</script>

<style scoped>
.timer-urgent {
	animation: urgentPulse 0.8s ease-in-out infinite;
	text-shadow: 0 0 8px rgba(255, 60, 60, 0.5);
}

@keyframes urgentPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.6;
	}
}
</style>
