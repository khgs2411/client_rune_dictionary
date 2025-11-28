import { useRafFn } from "@vueuse/core";
import { ref, watch } from "vue";

/**
 * Client-side ATB progress prediction composable
 *
 * Smoothly interpolates toward server ATB value using lerp.
 * No prediction/extrapolation - just smooth following of server state.
 */
export function useATBPrediction(serverReadiness: () => number) {
	// Display value (smoothly interpolated)
	const predictedReadiness = ref(0);

	// Target value from server
	const targetReadiness = ref(0);

	// Track last server value to detect resets
	let lastServerValue = 0;

	// Watch server readiness updates
	watch(
		() => serverReadiness(),
		(newReadiness) => {
			// Detect ATB reset (value dropped significantly)
			const isReset = newReadiness < lastServerValue - 10;

			if (isReset) {
				// Instant snap on reset
				predictedReadiness.value = newReadiness;
				targetReadiness.value = newReadiness;
			} else {
				// Normal update - set target for smooth interpolation
				targetReadiness.value = newReadiness;
			}

			lastServerValue = newReadiness;
		},
		{ immediate: true },
	);

	// 60fps smooth interpolation loop
	const { resume: resumeRaf } = useRafFn(() => {
		const current = predictedReadiness.value;
		const target = targetReadiness.value;
		const diff = target - current;

		// Lerp toward target (0.15 = smooth but responsive)
		if (Math.abs(diff) > 0.1) {
			predictedReadiness.value = current + diff * 0.15;
		} else {
			// Snap when close enough
			predictedReadiness.value = target;
		}
	});

	// Start RAF loop immediately
	resumeRaf();

	// Pause handler: snap to 100% if close (turn started)
	function pause() {
		if (targetReadiness.value >= 95) {
			targetReadiness.value = 100;
		}
	}

	// Resume handler (no-op, kept for API compatibility)
	function resume() {}

	return {
		predictedReadiness,
		pause,
		resume,
	};
}
