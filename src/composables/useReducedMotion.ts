import { ref, computed, onMounted, onUnmounted } from "vue";

// Global reduced motion state
const prefersReducedMotion = ref(false);
const forceReducedMotion = ref(false);
let mediaQuery: MediaQueryList | null = null;

/**
 * Initialize reduced motion detection
 */
function initializeReducedMotion() {
  if (typeof window === 'undefined') return;

  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const updatePreference = () => {
    prefersReducedMotion.value = mediaQuery?.matches ?? false;
  };

  // Set initial value
  updatePreference();

  // Listen for changes
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', updatePreference);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(updatePreference);
  }
}

// Initialize on import
if (typeof window !== 'undefined') {
  initializeReducedMotion();
}

/**
 * Enhanced Reduced Motion Composable
 * Provides CSS fallbacks and motion preference detection
 */
export function useReducedMotion() {
	onMounted(() => {
		initializeReducedMotion();
	});

	// Combined reduced motion state (user preference OR forced)
	const isReducedMotion = computed(() => {
		return prefersReducedMotion.value || forceReducedMotion.value;
	});

	/**
	 * Force reduced motion mode (useful for testing)
	 */
	const setForcedReducedMotion = (forced: boolean) => {
		forceReducedMotion.value = forced;
	};

	/**
	 * Get CSS transition properties based on motion preference
	 */
	const getTransition = (
		property: string = 'all',
		duration: number = 300,
		easing: string = 'ease-out'
	): string => {
		if (isReducedMotion.value) {
			// Very fast transitions for reduced motion
			return `${property} 0.01s linear`;
		}
		
		return `${property} ${duration}ms ${easing}`;
	};

	/**
	 * Get transform properties with reduced motion fallback
	 */
	const getTransform = (transforms: string[]): string => {
		if (isReducedMotion.value) {
			// No transforms in reduced motion mode
			return 'none';
		}
		
		return transforms.join(' ');
	};

	/**
	 * Get animation properties with reduced motion fallback
	 */
	const getAnimation = (
		name: string,
		duration: number = 300,
		easing: string = 'ease-out',
		iterations: string | number = 1
	): string => {
		if (isReducedMotion.value) {
			// No animation in reduced motion mode
			return 'none';
		}
		
		return `${name} ${duration}ms ${easing} ${iterations}`;
	};

	/**
	 * Generate CSS classes for motion preferences
	 */
	const motionClasses = computed(() => ({
		'motion-safe': !isReducedMotion.value,
		'motion-reduce': isReducedMotion.value,
		'prefers-reduced-motion': prefersReducedMotion.value,
		'forced-reduced-motion': forceReducedMotion.value,
	}));

	/**
	 * Get motion-v compatible config with reduced motion support
	 */
	const getMotionConfig = (config: any) => {
		if (isReducedMotion.value) {
			return {
				...config,
				transition: {
					duration: 0.01,
					ease: 'linear',
				},
			};
		}
		
		return config;
	};

	return {
		// Legacy compatibility
		prefersReducedMotion,
		
		// Enhanced state
		isReducedMotion,
		motionClasses,
		
		// Methods
		setForcedReducedMotion,
		getTransition,
		getTransform,
		getAnimation,
		getMotionConfig,
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