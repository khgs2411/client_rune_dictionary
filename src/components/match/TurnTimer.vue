<template>
	<div v-if="isVisible" class="turn-timer-wrapper relative rounded-xl overflow-hidden">
		<!-- Background -->
		<div class="absolute inset-0 timer-panel-bg" />
		<div class="absolute inset-0 timer-panel-border" />

		<div class="relative z-10 px-6 py-3 min-w-[280px] sm:min-w-[320px]">
			<!-- Turn indicator -->
			<div class="text-center mb-2">
				<span
					:class="[
						'text-xs font-bold tracking-[0.2em] uppercase',
						isPlayerTurn ? 'text-cyan-400' : 'text-red-400',
					]">
					{{ isPlayerTurn ? "Your Turn" : "Enemy Turn" }}
				</span>
			</div>

			<!-- Timer bar -->
			<div class="timer-bar-container h-3 sm:h-4">
				<!-- Fill progress -->
				<div
					:class="[
						'timer-fill will-change-[width]',
						isPlayerTurn ? 'timer-fill-player' : 'timer-fill-enemy',
						isWarningState && 'timer-warning',
					]"
					:style="{ width: `${timePercentage}%` }">
					<div class="timer-shine" />
				</div>

				<!-- Time remaining text (centered) -->
				<div class="absolute inset-0 flex items-center justify-center">
					<span
						:class="[
							'text-xs sm:text-sm font-mono font-black',
							isWarningState ? 'text-red-200' : 'text-white/90',
						]"
						style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8)">
						{{ formattedTimeRemaining }}
					</span>
				</div>
			</div>

			<!-- Warning message -->
			<div v-if="isWarningState" class="text-center mt-2">
				<span class="text-[10px] text-red-400 font-bold tracking-widest uppercase warning-flash"> Hurry! </span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useMatchStore } from "@/stores/match.store";
import { useRafFn } from "@vueuse/core";
import { computed, ref, watch } from "vue";

const matchStore = useMatchStore();

const isVisible = computed(() => matchStore.match.turnTimer.visible);
const isRunning = computed(() => matchStore.match.turnTimer.running);
const isPlayerTurn = computed(() => matchStore.match.turn.isPlayerTurn);

const localCountdown = ref(0);

const maxTurnTime = computed(() => matchStore.match.timer.duration ?? 10000);

watch(
	() => matchStore.match.turnTimer.visible,
	(visible) => {
		if (visible) {
			localCountdown.value = maxTurnTime.value;
		} else {
			localCountdown.value = 0;
		}
	},
);

watch(
	() => matchStore.match.timer.remaining,
	(serverRemaining) => {
		if (serverRemaining != null && isRunning.value) {
			const diff = Math.abs(localCountdown.value - serverRemaining);

			if (diff >= 1000) {
				localCountdown.value = serverRemaining;
			} else if (diff > 100) {
				localCountdown.value = localCountdown.value * 0.7 + serverRemaining * 0.3;
			}
		}
	},
);

const { pause, resume } = useRafFn(({ delta }) => {
	if (isRunning.value && localCountdown.value > 0) {
		localCountdown.value -= delta;
		if (localCountdown.value < 0) {
			localCountdown.value = 0;
		}
	}
});

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
</script>

<style scoped>
.timer-panel-bg {
	background: linear-gradient(180deg, rgba(10, 15, 30, 0.94) 0%, rgba(12, 18, 35, 0.92) 100%);
	backdrop-filter: blur(12px);
}

.timer-panel-border {
	border: 1px solid rgba(255, 255, 255, 0.06);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.timer-bar-container {
	position: relative;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 6px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.04);
}

.timer-fill {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	border-radius: 5px;
	transition: width 0.5s linear;
}

.timer-fill-player {
	background: linear-gradient(90deg, #0891b2, #22d3ee);
	box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
}

.timer-fill-enemy {
	background: linear-gradient(90deg, #dc2626, #f87171);
	box-shadow: 0 0 10px rgba(248, 113, 113, 0.3);
}

.timer-warning {
	animation: warningPulse 0.6s ease-in-out infinite;
}

.timer-shine {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 40%;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
	border-radius: 5px 5px 0 0;
}

.warning-flash {
	animation: warningFlash 0.5s ease-in-out infinite;
	text-shadow: 0 0 8px rgba(255, 60, 60, 0.5);
}

@keyframes warningPulse {
	0%,
	100% {
		box-shadow: 0 0 10px rgba(248, 113, 113, 0.3);
	}
	50% {
		box-shadow: 0 0 20px rgba(248, 113, 113, 0.6);
	}
}

@keyframes warningFlash {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}
</style>
