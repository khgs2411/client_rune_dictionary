import { type Ref } from "vue";
import type { I_CameraPerspective } from "../composables.types";

export interface CameraZoomLimits {
	min: number;
	max: number;
}

export interface CameraZoom {
	update: (delta: number) => void;
}

/**
 * Camera zoom composable
 * Handles shared zoom logic with distance clamping
 */
export function useCameraZoom(distance: Ref<number>, limits: CameraZoomLimits): CameraZoom {
	/**
	 * Update camera distance with clamping to min/max limits
	 */
	function update(delta: number) {
		distance.value = Math.max(limits.min, Math.min(limits.max, distance.value + delta));
	}

	return {
		update,
	};
}
/**
 * Camera Zoom Preset - Single source of truth for zoom defaults
 */

export const CAMERA_ZOOM_PRESET = {
	min: 6, // Closest zoom (zoomed in)
	max: 15, // Furthest zoom (zoomed out)
	default: 10, // Starting zoom distance
} as const; /**
 * Camera Overworld Perspective - Default camera settings for overworld
 */

export const CAMERA_OVERWORLD_PERSPECTIVE: I_CameraPerspective = {
	angle: {
		horizontal: Math.PI, // Camera at -Z looking toward +Z (so +Z is "up" on screen)
		vertical: 0.76, // ~43° - isometric-style view
	},
	distance: CAMERA_ZOOM_PRESET.default,
	fov: 75,
};
