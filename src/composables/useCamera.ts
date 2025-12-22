import { useGameConfigStore } from "@/stores/config.store";
import { useEventListener, useRafFn } from "@vueuse/core";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { ref, watchEffect } from "vue";
import { useCameraController } from "./camera/useCameraController";
import { I_CameraPerspective, I_GameCamera } from "./composables.types";

/**
 * High-level camera entity composable
 * Manages Three.js camera instance and wraps controller logic
 */
export function useCamera(): I_GameCamera {
	const config = useGameConfigStore();

	// Initialize pure controller (state/input logic)
	const controller = useCameraController();

	// Create Three.js camera instance
	const instance = new PerspectiveCamera(
		75, // FOV
		window.innerWidth / window.innerHeight, // Aspect
		0.1, // Near
		1000, // Far
	);

	/**
	 * Handle window resize - update camera aspect ratio
	 */
	function handleResize() {
		instance.aspect = window.innerWidth / window.innerHeight;
		instance.updateProjectionMatrix();
	}

	/**
	 * Initialize camera - set lookAt and update matrices
	 */
	function start() {
		instance.lookAt(new Vector3(0, 2, 0)); // y=2 to match combat camera
		instance.updateMatrixWorld(true);
	}

	/**
	 * Update camera target (what to look at)
	 * Uses fixed Y=2 for lookAt to match combat camera perspective
	 */
	function update(lookAtVector: Vector3) {
		controller.target.x = lookAtVector.x;
		controller.target.z = lookAtVector.z;
		instance.lookAt(new Vector3(lookAtVector.x, 2, lookAtVector.z));
	}

	/**
	 * Reset camera to defaults
	 */
	function reset() {
		controller.reset();
	}

	/**
	 * Destroy camera and cleanup
	 */
	function destroy() {
		controller.destroy();
	}

	/**
	 * Change camera target with smooth animation
	 *
	 * @param newTarget - Position to look at (Vector3)
	 * @param perspective - Camera angle, distance, FOV configuration
	 * @param duration - Animation duration in milliseconds
	 * @returns Promise that resolves when animation completes
	 */
	function changeTarget(newTarget: Vector3, perspective: I_CameraPerspective, duration: number): Promise<void> {
		return new Promise<void>((resolve) => {
			// Store initial values
			const startTarget = { x: controller.target.x, z: controller.target.z };
			const startAngleH = controller.angle.horizontal.value;
			const startAngleV = controller.angle.vertical.value;
			const startDistance = controller.distance.value;
			const startFov = instance.fov;

			// Animation state
			const elapsed = ref(0);
			const isComplete = ref(false);

			// Use VueUse RAF for smooth animation loop
			const { pause } = useRafFn((info) => {
				elapsed.value += info.delta;
				const progress = Math.min(elapsed.value / duration, 1.0);

				// Smooth easing (ease-in-out)
				const t = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

				// Lerp target position
				controller.target.x = MathUtils.lerp(startTarget.x, newTarget.x, t);
				controller.target.z = MathUtils.lerp(startTarget.z, newTarget.z, t);

				// Lerp camera angles
				controller.angle.horizontal.value = MathUtils.lerp(startAngleH, perspective.angle.horizontal, t);
				controller.angle.vertical.value = MathUtils.lerp(startAngleV, perspective.angle.vertical, t);

				// Lerp camera distance
				controller.distance.value = MathUtils.lerp(startDistance, perspective.distance, t);

				// Lerp FOV
				instance.fov = MathUtils.lerp(startFov, perspective.fov, t);
				instance.updateProjectionMatrix();

				// Update lookAt (y=2 to match combat camera)
				instance.lookAt(new Vector3(controller.target.x, 2, controller.target.z));

				// Check if complete
				if (progress >= 1.0 && !isComplete.value) {
					isComplete.value = true;
					pause(); // Stop animation loop
					resolve();
				}
			});
		});
	}

	// Auto-sync Three.js camera position with controller state
	watchEffect(() => {
		// Skip reactive updates when camera is frozen (e.g., during matches with fixed camera)
		if (controller.freezeReactiveUpdates.value) {
			return;
		}

		const offsetX = Math.sin(controller.angle.horizontal.value) * controller.distance.value * Math.cos(controller.angle.vertical.value);
		const offsetZ = Math.cos(controller.angle.horizontal.value) * controller.distance.value * Math.cos(controller.angle.vertical.value);
		const offsetY = Math.sin(controller.angle.vertical.value) * controller.distance.value;

		instance.position.set(controller.target.x + offsetX, offsetY + 1, controller.target.z + offsetZ);
	});

	// Setup resize listener (VueUse auto-cleanup)
	useEventListener("resize", handleResize);

	return {
		// Three.js instance
		instance,

		// Delegated controller state
		controller,

		// Methods
		start,
		update,
		reset,
		destroy,
		changeTarget,
	};
}
