import { ref, onMounted, onUnmounted } from "vue";

/**
 * Composable to detect and handle reduced motion preferences
 * Respects the user's accessibility settings for motion
 */
export function useReducedMotion() {
	const prefersReducedMotion = ref(false);

	// Check if media query is supported
	const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

	// Update the preference
	const updateMotionPreference = (event?: MediaQueryListEvent | MediaQueryList) => {
		prefersReducedMotion.value = event?.matches ?? false;
	};

	onMounted(() => {
		// Set initial value
		if (mediaQuery) {
			updateMotionPreference(mediaQuery);

			// Listen for changes
			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener("change", updateMotionPreference);
			} else {
				// Fallback for older browsers
				mediaQuery.addListener(updateMotionPreference);
			}
		}
	});

	onUnmounted(() => {
		// Clean up listener
		if (mediaQuery) {
			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener("change", updateMotionPreference);
			} else {
				// Fallback for older browsers
				mediaQuery.removeListener(updateMotionPreference);
			}
		}
	});

	return {
		prefersReducedMotion,
	};
}

/**
 * Helper function to get motion props based on reduced motion preference
 * Returns empty object if reduced motion is preferred
 */
export function getMotionProps(
	initialProps: Record<string, any>,
	enterProps: Record<string, any>,
	options?: { delay?: number; visibleOnce?: boolean }
) {
	const { prefersReducedMotion } = useReducedMotion();

	if (prefersReducedMotion.value) {
		// Return props with instant transitions for reduced motion
		return {
			initial: initialProps,
			[options?.visibleOnce ? "visible-once" : "enter"]: {
				...enterProps,
				transition: { duration: 0 },
			},
			...(options?.delay && { delay: 0 }),
		};
	}

	// Return normal motion props
	return {
		initial: initialProps,
		[options?.visibleOnce ? "visible-once" : "enter"]: enterProps,
		...(options?.delay && { delay: options.delay }),
	};
}