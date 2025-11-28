import { useGameConfigStore } from "@/stores/config.store";
import { ref, type Ref } from "vue";
import { useMagicKeys, whenever } from "@vueuse/core";

export interface CharacterJump {
	isJumping: Ref<boolean>;
	verticalVelocity: Ref<number>;
	update: (playerY: Ref<number>, delta: number) => void;
	reset: () => void;
}

/**
 * Character jump mechanics composable
 * Handles jump physics, gravity, and space key input
 */
export function useCharacterJump(): CharacterJump {
	const config = useGameConfigStore();

	const isJumping = ref(false);
	const verticalVelocity = ref(0);

	// VueUse: Watch for space key to trigger jump with preventDefault
	const { space } = useMagicKeys({
		passive: false,
		onEventFired(e) {
			// Prevent default for Space key
			if (e.key === " " || e.code === "Space") {
				e.preventDefault();
				e.stopPropagation();
			}
		},
	});

	whenever(space, () => {
		if (!isJumping.value) {
			isJumping.value = true;
			verticalVelocity.value = config.character.jumpInitialVelocity;
		}
	});

	/**
	 * Update jump physics (call every frame)
	 */
	function update(playerY: Ref<number>, delta: number) {
		if (!isJumping.value) return;

		// Apply gravity
		verticalVelocity.value -= config.character.jumpGravity * delta;

		// Clamp falling speed to max fall velocity
		if (verticalVelocity.value < -config.character.jumpMaxFallSpeed) {
			verticalVelocity.value = -config.character.jumpMaxFallSpeed;
		}

		// Update Y position
		playerY.value += verticalVelocity.value * delta;

		// Check if landed
		if (playerY.value <= config.character.groundLevel) {
			playerY.value = config.character.groundLevel;
			isJumping.value = false;
			verticalVelocity.value = 0;
		}
	}

	/**
	 * Reset jump state
	 */
	function reset() {
		isJumping.value = false;
		verticalVelocity.value = 0;
	}

	return {
		isJumping,
		verticalVelocity,
		update,
		reset,
	};
}
