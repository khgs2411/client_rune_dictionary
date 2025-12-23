import { useGameConfigStore } from "@/stores/config.store";
import { Vector3 } from "three";
import { reactive, ref, watchEffect } from "vue";
import { I_CameraControls } from "../composables.types";
import { CAMERA_OVERWORLD_PERSPECTIVE } from "./useCameraZoom";
import { CAMERA_ZOOM_PRESET } from "./useCameraZoom";
import { useCameraMouseInput } from "./useCameraMouseInput";
import { useCameraRotation } from "./useCameraRotation";
import { useCameraTouchInput } from "./useCameraTouchInput";
import { useCameraZoom } from "./useCameraZoom";

// Re-export for backwards compatibility
/**
 * Main camera controls composable
 * Orchestrates rotation, zoom, mouse, and touch composables
 */
export function useCameraController(): I_CameraControls {
	const config = useGameConfigStore();

	const target = reactive({ x: 0, z: 0, y: 0 });
	const mouseRotationEnabled = ref(false); // Disabled - isometric camera has fixed angle
	const freezeReactiveUpdates = ref(false); // Freeze camera position updates (for fixed camera in matches)

	// Optional follow target override (for match camera)
	let followTarget: Vector3 | null = null;

	// Camera state - use preset values directly (bypasses persistence issues)
	const cameraDistance = ref(CAMERA_ZOOM_PRESET.default);
	const cameraAngleH = ref(CAMERA_OVERWORLD_PERSPECTIVE.angle.horizontal);
	const cameraAngleV = ref(CAMERA_OVERWORLD_PERSPECTIVE.angle.vertical);

	// Compose smaller, focused composables (pass config sensitivity/limits)
	const rotation = useCameraRotation(cameraAngleH, cameraAngleV, {
		h: config.camera.mouseSensitivityH,
		v: config.camera.mouseSensitivityV,
	});
	// Use preset values directly for zoom limits (bypasses persistence issues)
	const zoom = useCameraZoom(cameraDistance, {
		min: CAMERA_ZOOM_PRESET.min,
		max: CAMERA_ZOOM_PRESET.max,
	});
	const mouse = useCameraMouseInput(rotation, zoom, mouseRotationEnabled);
	useCameraTouchInput(zoom); // Pinch zoom only (rotation disabled for isometric view)

	// Auto-update camera position when angles/distance/target change
	watchEffect(() => {
		const offsetX = Math.sin(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
		const offsetZ = Math.cos(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
		const offsetY = Math.sin(cameraAngleV.value) * cameraDistance.value;
	});

	/**
	 * Reset camera to defaults
	 */
	function reset() {
		cameraDistance.value = CAMERA_ZOOM_PRESET.default;
		cameraAngleH.value = CAMERA_OVERWORLD_PERSPECTIVE.angle.horizontal;
		cameraAngleV.value = CAMERA_OVERWORLD_PERSPECTIVE.angle.vertical;
	}

	/**
	 * destroy (VueUse composables handle auto-destroy)
	 */
	function destroy() {
		reset();
		mouse.isDragging.value = false;
	}

	function update(lookAtVector: Vector3) {
		target.x = lookAtVector.x;
		target.z = lookAtVector.z;
	}

	function getPosition(): Vector3 {
		const offsetX = Math.sin(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
		const offsetZ = Math.cos(cameraAngleH.value) * cameraDistance.value * Math.cos(cameraAngleV.value);
		const offsetY = Math.sin(cameraAngleV.value) * cameraDistance.value;

		return new Vector3(target.x + offsetX, target.y + offsetY, target.z + offsetZ);
	}

	// Setup resize listener (VueUse auto-destroy)

	return {
		angle: {
			horizontal: cameraAngleH,
			vertical: cameraAngleV,
		},
		distance: cameraDistance,
		isDragging: mouse.isDragging,
		mouseRotationEnabled,
		freezeReactiveUpdates,
		target,
		followTarget,
		update,
		getPosition,
		reset,
		destroy,
	};
}
