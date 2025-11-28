import { useGameConfigStore } from "@/stores/config.store";
import { ref, computed, type Ref } from "vue";
import { useEventListener } from "@vueuse/core";

export interface JoystickState {
	active: Ref<boolean>;
	x: Ref<number>;
	y: Ref<number>;
	startX: Ref<number>;
	startY: Ref<number>;
	inputX: Ref<number>; // Normalized input (-1 to 1)
	inputZ: Ref<number>; // Normalized input (-1 to 1)
}

/**
 * Virtual joystick composable for mobile touch controls
 * Activates on left half of screen, provides normalized input
 */
export function useJoystick(): JoystickState {
	const config = useGameConfigStore();

	// Joystick state
	const active = ref(false);
	const x = ref(0);
	const y = ref(0);
	const startX = ref(0);
	const startY = ref(0);
	const touchId = ref<number | null>(null);

	// Computed normalized input values (optimized to calculate distance once)
	const joystickInput = computed(() => {
		if (!active.value) return { x: 0, z: 0 };

		const dx = x.value - startX.value;
		const dy = y.value - startY.value;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Apply dead zone
		if (distance <= config.character.joystickDeadZone) return { x: 0, z: 0 };

		// Clamp and normalize
		const clampedDistance = Math.min(distance, config.character.joystickMaxDistance);
		const normalizedDx = (dx / distance) * clampedDistance;
		const normalizedDy = (dy / distance) * clampedDistance;

		return {
			x: normalizedDx / config.character.joystickMaxDistance,
			z: normalizedDy / config.character.joystickMaxDistance,
		};
	});

	const inputX = computed(() => joystickInput.value.x);
	const inputZ = computed(() => joystickInput.value.z);

	// Touch handlers
	function onTouchStart(e: TouchEvent) {
		// Only activate joystick if touch is in the left half of the screen
		const touch = e.touches[0];
		if (touch.clientX < window.innerWidth / 2 && touchId.value === null) {
			e.preventDefault();
			e.stopPropagation();

			touchId.value = touch.identifier;
			active.value = true;
			startX.value = touch.clientX;
			startY.value = touch.clientY;
			x.value = touch.clientX;
			y.value = touch.clientY;
		}
	}

	function onTouchMove(e: TouchEvent) {
		if (touchId.value === null) return;

		// Find the touch that matches our joystick
		for (let i = 0; i < e.touches.length; i++) {
			const touch = e.touches[i];
			if (touch.identifier === touchId.value) {
				e.preventDefault();
				e.stopPropagation();

				x.value = touch.clientX;
				y.value = touch.clientY;
				break;
			}
		}
	}

	function onTouchEnd(e: TouchEvent) {
		if (touchId.value === null) return;

		// Check if our joystick touch ended
		let touchEnded = true;
		for (let i = 0; i < e.touches.length; i++) {
			if (e.touches[i].identifier === touchId.value) {
				touchEnded = false;
				break;
			}
		}

		if (touchEnded) {
			e.preventDefault();
			e.stopPropagation();

			active.value = false;
			x.value = 0;
			y.value = 0;
			touchId.value = null;
		}
	}

	// Setup touch event listeners (VueUse auto-cleanup)
	// passive: false allows preventDefault() to work
	useEventListener("touchstart", onTouchStart, { passive: false });
	useEventListener("touchmove", onTouchMove, { passive: false });
	useEventListener("touchend", onTouchEnd, { passive: false });

	return {
		active,
		x,
		y,
		startX,
		startY,
		inputX,
		inputZ,
	};
}
