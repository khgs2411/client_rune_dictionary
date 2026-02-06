import { useGameConfigStore } from "@/stores/config.store";
import { useSettingsStore } from "@/stores/settings.store";
import { ref, computed, type Ref } from "vue";
import { useMagicKeys } from "@vueuse/core";

export interface CharacterMovement {
	position: {
		x: Ref<number>;
		y: Ref<number>;
		z: Ref<number>;
	};
	rotation: Ref<number>;
	speed: Ref<number>;
	isMoving: Ref<boolean>;
	update: (delta: number, cameraAngleH: number, joystickInputX: number, joystickInputZ: number) => void;
	reset: () => void;
}

/**
 * Character movement composable
 * Handles keyboard + joystick input, camera-relative movement, and position updates
 */
export function useCharacterMovement(): CharacterMovement {
	const config = useGameConfigStore();
	const settings = useSettingsStore();

	const isMoving = ref(false);
	// Position and rotation
	const playerX = ref(0);
	const playerY = ref(5); // Spawn height - prevents falling through ground on init
	const playerZ = ref(0);
	const playerRotation = ref(0);

	// TODO: Override from API spawn position
	// Example usage:
	// const spawnData = await api.getSpawnPosition();
	// playerX.value = spawnData.x;
	// playerY.value = spawnData.y;
	// playerZ.value = spawnData.z;

	// Movement speed from config
	const moveSpeed = computed(() => config.character.moveSpeed);

	// VueUse: Keyboard input with preventDefault on WASD keys
	const { w, a, s, d } = useMagicKeys({
		passive: false,
		onEventFired(e) {
			// Don't capture keys when game controls are disabled or typing in input fields
			if (settings.gameControlsDisabled) return;
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
				return;
			}

			// Prevent default for WASD keys
			if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d" || e.key === "W" || e.key === "A" || e.key === "S" || e.key === "D") {
				e.preventDefault();
				e.stopPropagation();
				isMoving.value = e.type === "keydown";
			}
		},
	});

	/**
	 * Update movement (call every frame)
	 * @param delta - Delta time in seconds
	 * @param cameraAngleH - Horizontal camera angle for camera-relative movement
	 * @param joystickInputX - Joystick X input (-1 to 1), overrides keyboard if active
	 * @param joystickInputZ - Joystick Z input (-1 to 1), overrides keyboard if active
	 */
	function update(delta: number, cameraAngleH: number, joystickInputX: number, joystickInputZ: number) {
		let inputX = 0;
		let inputZ = 0;

		// Skip keyboard input when game controls are disabled
		if (!settings.gameControlsDisabled) {
			// Keyboard input (desktop)
			if (w.value) inputZ -= 1;
			if (s.value) inputZ += 1;
			if (a.value) inputX -= 1;
			if (d.value) inputX += 1;
		}

		// Joystick input (mobile) - overrides keyboard if active
		if (joystickInputX !== 0 || joystickInputZ !== 0) {
			inputX = joystickInputX;
			inputZ = joystickInputZ;
		}

		// Apply camera-relative movement
		if (inputX !== 0 || inputZ !== 0) {
			// Normalize input (for keyboard, may already be normalized for joystick)
			const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
			if (length > 1) {
				inputX /= length;
				inputZ /= length;
			}

			// Convert input to world space based on camera angle
			const moveX = inputX * Math.cos(cameraAngleH) + inputZ * Math.sin(cameraAngleH);
			const moveZ = -inputX * Math.sin(cameraAngleH) + inputZ * Math.cos(cameraAngleH);

			// Update player position
			playerX.value += moveX * moveSpeed.value * delta;
			playerZ.value += moveZ * moveSpeed.value * delta;

			// Update player rotation to face movement direction (world space)
			playerRotation.value = Math.atan2(moveX, moveZ);
		}
	}

	/**
	 * Reset position and rotation
	 */
	function reset() {
		playerX.value = 0;
		playerY.value = 0;
		playerZ.value = 0;
		playerRotation.value = 0;
	}

	return {
		position: {
			x: playerX,
			y: playerY,
			z: playerZ,
		},
		rotation: playerRotation,
		speed: moveSpeed,
		isMoving: isMoving,
		update,
		reset,
	};
}
