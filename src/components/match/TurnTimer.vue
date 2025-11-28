<template>
	<!-- Turn Timer - Top-center shared element -->
	<div v-if="isVisible" class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg px-6 py-3 min-w-[280px] sm:min-w-[320px]">
		<!-- Turn indicator -->
		<div class="text-center mb-2">
			<span :class="['text-sm font-semibold', isPlayerTurn ? 'text-primary' : 'text-destructive']">
				{{ isPlayerTurn ? "Your Turn" : "Enemy Turn" }}
			</span>
		</div>

		<!-- Timer bar -->
		<div class="relative w-full h-3 sm:h-4 bg-muted rounded-full overflow-hidden">
			<!-- Fill progress -->
			<div
				:class="['absolute left-0 top-0 h-full transition-all duration-500 ease-linear will-change-[width]', isPlayerTurn ? 'bg-primary' : 'bg-destructive', isWarningState && 'animate-pulse']"
				:style="{ width: `${timePercentage}%` }"></div>

			<!-- Time remaining text (centered) -->
			<div class="absolute inset-0 flex items-center justify-center">
				<span class="text-xs sm:text-sm font-mono font-bold text-foreground drop-shadow-md">
					{{ formattedTimeRemaining }}
				</span>
			</div>
		</div>

		<!-- Warning message (< 3 seconds) -->
		<div v-if="isWarningState" class="text-center mt-2">
			<span class="text-xs text-destructive font-medium animate-pulse"> Time running out! </span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useMatchStore } from "@/stores/match.store";
import { useRafFn } from "@vueuse/core";
import { computed, ref, watch } from "vue";

// ========================================
// Match State Integration
// ========================================

const matchStore = useMatchStore();

// UI controls from composable (granular controls)
const isVisible = computed(() => matchStore.match.turnTimer.visible);
const isRunning = computed(() => matchStore.match.turnTimer.running);
const isPlayerTurn = computed(() => matchStore.match.turn.isPlayerTurn);

// Local countdown prediction
const localCountdown = ref(0); // in milliseconds

const maxTurnTime = computed(() => matchStore.match.timer.duration ?? 10000); // in ms

// Start countdown when turn timer becomes visible
watch(
	() => matchStore.match.turnTimer.visible,
	(visible) => {
		if (visible) {
			// Turn started - initialize local countdown
			localCountdown.value = maxTurnTime.value;
		} else {
			// Turn ended - reset countdown
			localCountdown.value = 0;
		}
	},
);

// Sync local countdown with server updates (drift correction)
watch(
	() => matchStore.match.timer.remaining,
	(serverRemaining) => {
		if (serverRemaining != null && isRunning.value) {
			const diff = Math.abs(localCountdown.value - serverRemaining);

			if (diff >= 1000) {
				// Large drift (≥1s) - snap to server value
				localCountdown.value = serverRemaining;
			} else if (diff > 100) {
				// Small drift (100ms-1s) - blend smoothly
				localCountdown.value = localCountdown.value * 0.7 + serverRemaining * 0.3;
			}
			// If diff < 100ms, ignore (trust local countdown)
		}
	},
);

// 60fps countdown loop - only runs when isRunning is true
const { pause, resume } = useRafFn(({ delta }) => {
	if (isRunning.value && localCountdown.value > 0) {
		// Decrement countdown based on delta time
		localCountdown.value -= delta;

		// Clamp to 0
		if (localCountdown.value < 0) {
			localCountdown.value = 0;
		}
	}
});

// Watch running state to pause/resume RAF loop
watch(
	isRunning,
	(running) => {
		if (running) {
			resume();
		} else {
			pause();
		}
	},
	{ immediate: true },
);

// Computed values using local countdown
const timeRemainingSeconds = computed(() => Math.ceil(localCountdown.value / 1000));

const timePercentage = computed(() => {
	const max = maxTurnTime.value;
	const remaining = localCountdown.value;
	return max > 0 ? (remaining / max) * 100 : 0;
});

const formattedTimeRemaining = computed(() => {
	return `${timeRemainingSeconds.value}s`;
});

const isWarningState = computed(() => {
	return timeRemainingSeconds.value < 3;
});

// Timer bar color using composable (optional - currently using player/enemy color)
// Uncomment to use gradient color based on time remaining:
// const { colorClass: timerColorClass } = useProgressBarColor(
//   () => localCountdown.value,
//   () => maxTurnTime.value,
//   'timer',
// );
</script>
