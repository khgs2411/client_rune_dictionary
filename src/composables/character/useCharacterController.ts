import { I_CharacterControlsOptions } from "@/common/types";
import { useGameConfigStore } from "@/stores/config.store";
import { Vector3 } from "three";
import { I_CharacterControls } from "../composables.types";
import { useJoystick } from "../useJoystick";
import { useCharacterJump } from "./useCharacterJump";
import { useCharacterMovement } from "./useCharacterMovement";

/**
 * Main character controls composable
 * Orchestrates movement, jump, and joystick composables
 */
export function useCharacterController(options: I_CharacterControlsOptions): I_CharacterControls {
	const config = useGameConfigStore();
	const { cameraAngleH } = options;

	// Compose smaller, focused composables
	const joystick = useJoystick();
	const jump = useCharacterJump();
	const movement = useCharacterMovement();

	/**
	 * Update character state (call every frame)
	 */
	function update(delta: number) {
		// Update movement with keyboard + joystick input
		movement.update(delta, cameraAngleH.value, joystick.inputX.value, joystick.inputZ.value);

		// Update jump physics
		jump.update(movement.position.y, delta);
	}

	/**
	 * Returns the current position of the character as a `Vector3`.
	 * Uses actual Y position from movement state.
	 *
	 * @returns {Vector3} The position vector.
	 */
	function getPosition(): Vector3 {
		return new Vector3(
			movement.position.x.value,
			movement.position.y.value, // Use actual Y position
			movement.position.z.value,
		);
	}

	function setPosition(x: number, y: number, z: number) {
		movement.position.x.value = x;
		movement.position.y.value = y;
		movement.position.z.value = z;
	}

	/**
	 * Reset all character state
	 */
	function reset() {
		movement.reset();
		jump.reset();
	}

	/**
	 * Cleanup (VueUse composables handle auto-cleanup)
	 */
	function destroy() {
		reset();
	}

	return {
		position: movement.position,
		rotation: movement.rotation,
		speed: movement.speed,
		isJumping: jump.isJumping,
		joystick: {
			active: joystick.active,
			x: joystick.x,
			y: joystick.y,
			startX: joystick.startX,
			startY: joystick.startY,
		},

		getPosition,
		setPosition,
		update,
		reset,
		destroy,
	};
}
