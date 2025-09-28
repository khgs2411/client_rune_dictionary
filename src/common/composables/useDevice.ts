import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Device detection composable with comprehensive mobile/tablet/touch detection
 * Based on multiple detection methods for maximum reliability
 *
 * @param customMobileBreakpoint - Custom mobile breakpoint (default: 640px)
 * @param customTabletBreakpoint - Custom tablet breakpoint (default: 768px)
 * @param customDesktopBreakpoint - Custom desktop breakpoint (default: 1024px)
 */
export const useDevice = (
	customMobileBreakpoint?: number,
	customTabletBreakpoint?: number,
	customDesktopBreakpoint?: number
) => {
	// Reactive state
	const isMobile = ref(false);
	const isTablet = ref(false);
	const isDesktop = ref(false);
	const isTouch = ref(false);
	const screenWidth = ref(0);
	const screenHeight = ref(0);
	const orientation = ref<'portrait' | 'landscape'>('portrait');

	// Breakpoints (customizable or defaults matching Tailwind/SCSS)
	const BREAKPOINTS = {
		mobile: customMobileBreakpoint ?? 640,   // sm breakpoint or custom
		tablet: customTabletBreakpoint ?? 768,   // md breakpoint or custom
		desktop: customDesktopBreakpoint ?? 1024 // lg breakpoint or custom
	} as const;

	/**
	 * Detect if device has touch capabilities
	 */
	const detectTouch = (): boolean => {
		return (
			'ontouchstart' in window ||
			navigator.maxTouchPoints > 0 ||
			(navigator as any).msMaxTouchPoints > 0
		);
	};

	/**
	 * Detect mobile based on user agent (fallback method)
	 */
	const detectMobileUserAgent = (): boolean => {
		const userAgent = navigator.userAgent.toLowerCase();
		const mobileRegex = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
		return mobileRegex.test(userAgent);
	};

	/**
	 * Update device state based on current window dimensions and capabilities
	 */
	const updateDeviceState = () => {
		if (typeof window === 'undefined') return;

		screenWidth.value = window.innerWidth;
		screenHeight.value = window.innerHeight;

		// Orientation detection
		orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

		// Touch capability detection
		isTouch.value = detectTouch();

		// Screen size based detection (primary method)
		const width = window.innerWidth;

		// Mobile: small screens + touch OR user agent detection
		isMobile.value = (
			width < BREAKPOINTS.mobile ||
			(width < BREAKPOINTS.tablet && isTouch.value) ||
			(width < BREAKPOINTS.tablet && detectMobileUserAgent())
		);

		// Tablet: medium screens with touch, but not mobile
		isTablet.value = (
			!isMobile.value &&
			width >= BREAKPOINTS.mobile &&
			width < BREAKPOINTS.desktop &&
			isTouch.value
		);

		// Desktop: large screens or no touch capability
		isDesktop.value = !isMobile.value && !isTablet.value;
	};

	/**
	 * Get device type as string
	 */
	const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
		if (isMobile.value) return 'mobile';
		if (isTablet.value) return 'tablet';
		return 'desktop';
	};

	/**
	 * Check if current device is mobile OR tablet (useful for touch interfaces)
	 */
	const isMobileOrTablet = (): boolean => {
		return isMobile.value || isTablet.value;
	};

	/**
	 * Check if screen is below a specific breakpoint
	 */
	const isBelow = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
		return screenWidth.value < BREAKPOINTS[breakpoint];
	};

	/**
	 * Check if screen is above a specific breakpoint
	 */
	const isAbove = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
		return screenWidth.value >= BREAKPOINTS[breakpoint];
	};

	/**
	 * Check if device has limited screen real estate (for UI decisions)
	 */
	const hasLimitedSpace = (): boolean => {
		return isMobile.value || (isTablet.value && orientation.value === 'portrait');
	};

	// Resize handler
	let resizeHandler: (() => void) | null = null;

	onMounted(() => {
		updateDeviceState();

		// Add resize listener with debouncing
		let resizeTimeout: NodeJS.Timeout;
		resizeHandler = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(updateDeviceState, 150);
		};

		window.addEventListener('resize', resizeHandler);
		window.addEventListener('orientationchange', resizeHandler);
	});

	onUnmounted(() => {
		if (resizeHandler) {
			window.removeEventListener('resize', resizeHandler);
			window.removeEventListener('orientationchange', resizeHandler);
		}
	});

	return {
		// Reactive state
		isMobile,
		isTablet,
		isDesktop,
		isTouch,
		screenWidth,
		screenHeight,
		orientation,

		// Computed helpers
		getDeviceType,
		isMobileOrTablet,
		hasLimitedSpace,
		isBelow,
		isAbove,

		// Constants
		BREAKPOINTS,

		// Manual update (for testing or edge cases)
		updateDeviceState
	};
};

// Default export with standard breakpoints for backward compatibility
export default useDevice;