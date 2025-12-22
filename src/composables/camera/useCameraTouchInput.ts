import { ref } from "vue";
import { useEventListener } from "@vueuse/core";
import type { CameraZoom } from "./useCameraZoom";

export interface CameraTouchInput {}

/**
 * Camera touch input composable
 * Handles touch-based camera controls (pinch zoom only - rotation disabled for isometric view)
 */
export function useCameraTouchInput(zoom: CameraZoom): CameraTouchInput {
	// Touch-specific state for pinch zoom
	const lastTouchDistance = ref(0);

	/**
	 * Handle touch start - begin pinch zoom
	 */
	function onTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			// Two fingers - pinch to zoom
			e.preventDefault();
			e.stopPropagation();

			const dx = e.touches[0].clientX - e.touches[1].clientX;
			const dy = e.touches[0].clientY - e.touches[1].clientY;
			lastTouchDistance.value = Math.sqrt(dx * dx + dy * dy);
		}
	}

	/**
	 * Handle touch move - update zoom
	 */
	function onTouchMove(e: TouchEvent) {
		if (e.touches.length === 2) {
			// Two fingers - pinch to zoom
			const dx = e.touches[0].clientX - e.touches[1].clientX;
			const dy = e.touches[0].clientY - e.touches[1].clientY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (lastTouchDistance.value > 0) {
				const delta = distance - lastTouchDistance.value;
				zoom.update(-delta * 0.05);
			}

			lastTouchDistance.value = distance;
			e.preventDefault();
		}
	}

	/**
	 * Handle touch end - reset touch state
	 */
	function onTouchEnd(e: TouchEvent) {
		if (e.touches.length < 2) {
			// Less than 2 fingers - reset pinch zoom state
			lastTouchDistance.value = 0;
		}
	}

	// Setup event listeners (VueUse auto-cleanup)
	useEventListener("touchstart", onTouchStart, { passive: false });
	useEventListener("touchmove", onTouchMove, { passive: false });
	useEventListener("touchend", onTouchEnd, { passive: false });

	// No public API needed - side effects only
	return {};
}
