import { ref, watch } from "vue";
import { useRafFn } from "@vueuse/core";

/**
 * Client-side ATB progress prediction composable
 *
 * Tracks server ATB updates and extrapolates between updates for smooth 60fps animation.
 * Prevents jarring jumps from ~95% to turn start by predicting up to 100%.
 */
export function useATBPrediction(serverReadiness: () => number) {
	// Predicted readiness value (extrapolated)
	const predictedReadiness = ref(0);

	// History of server updates for fill rate calculation
	const updateHistory = ref<Array<{ readiness: number; timestamp: number }>>([]);

	// Current fill rate (readiness per millisecond)
	const fillRate = ref(0);

	// Watch server readiness updates
	watch(
		() => serverReadiness(),
		(newReadiness) => {
			const now = performance.now();

			// Add to history
			updateHistory.value.push({ readiness: newReadiness, timestamp: now });

			// Keep only last 3 updates
			if (updateHistory.value.length > 3) {
				updateHistory.value.shift();
			}

			// Calculate fill rate from history (if we have at least 2 updates)
			if (updateHistory.value.length >= 2) {
				const oldest = updateHistory.value[0];
				const newest = updateHistory.value[updateHistory.value.length - 1];

				const readinessChange = newest.readiness - oldest.readiness;
				const timeDelta = newest.timestamp - oldest.timestamp;

				if (timeDelta > 0) {
					fillRate.value = readinessChange / timeDelta; // readiness per ms
				}
			}

			// Sync predicted value to server value
			predictedReadiness.value = newReadiness;
		},
		{ immediate: true },
	);

	// 60fps extrapolation loop
	const { pause, resume } = useRafFn(({ delta }) => {
		if (fillRate.value > 0 && predictedReadiness.value < 100) {
			// Extrapolate forward based on fill rate and time delta
			predictedReadiness.value += fillRate.value * delta;

			// Cap at 100% to prevent overshoot
			if (predictedReadiness.value > 100) {
				predictedReadiness.value = 100;
			}
		}
	});

	// Start RAF loop immediately
	resume();

	return {
		predictedReadiness,
		fillRate,
		pause,
		resume,
	};
}
