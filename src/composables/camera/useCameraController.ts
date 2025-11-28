import { useGameConfigStore } from "@/stores/config.store";
import { Vector3 } from "three";
import { reactive, ref, watchEffect } from "vue";
import { I_CameraControls } from "../composables.types";
import { useCameraMouseInput } from "./useCameraMouseInput";
import { useCameraRotation } from "./useCameraRotation";
import { useCameraTouchInput } from "./useCameraTouchInput";
import { useCameraZoom } from "./useCameraZoom";

/**
 * Main camera controls composable
 * Orchestrates rotation, zoom, mouse, and touch composables
 */
export function useCameraController(): I_CameraControls {
	const config = useGameConfigStore();

	const target = reactive({ x: 0, z: 0, y: 0 });
	const mouseRotationEnabled = ref(true); // Controlled by scene state
	const freezeReactiveUpdates = ref(false); // Freeze camera position updates (for fixed camera in matches)

	// Optional follow target override (for match camera)
	let followTarget: Vector3 | null = null;

	// Camera state from config
	const cameraDistance = ref(config.camera.initialDistance);
	const cameraAngleH = ref(config.camera.initialAngleH);
	const cameraAngleV = ref(config.camera.initialAngleV);

	// Compose smaller, focused composables (pass config sensitivity/limits)
	const rotation = useCameraRotation(cameraAngleH, cameraAngleV, {
		h: config.camera.mouseSensitivityH,
		v: config.camera.mouseSensitivityV,
	});
	const zoom = useCameraZoom(cameraDistance, {
		min: config.camera.zoomMin,
		max: config.camera.zoomMax,
	});
	const mouse = useCameraMouseInput(rotation, zoom, mouseRotationEnabled);
	useCameraTouchInput(rotation, zoom); // Side effects only

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
		cameraDistance.value = config.camera.initialDistance;
		cameraAngleH.value = config.camera.initialAngleH;
		cameraAngleV.value = config.camera.initialAngleV;
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
