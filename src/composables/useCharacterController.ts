import { useConfigStore } from '@/stores/config.store';
import { computed, ref, type Ref } from 'vue';
import { useEventListener, useMagicKeys, whenever } from '@vueuse/core';

export interface CharacterControlsOptions {
  cameraAngleH: Ref<number>;
  moveSpeed?: number;
}

export interface CharacterControls {
  position: {
    x: Ref<number>;
    y: Ref<number>;
    z: Ref<number>;
  };
  rotation: Ref<number>;
  speed: Ref<number>;
  isJumping: Ref<boolean>;
  joystick: {
    active: Ref<boolean>;
    x: Ref<number>;
    y: Ref<number>;
    startX: Ref<number>;
    startY: Ref<number>;
  };

  update: (delta: number) => void;
  reset: () => void;
  cleanup: () => void;
}

export function useCharacterControls(options: CharacterControlsOptions): CharacterControls {
  const config = useConfigStore()

  const { cameraAngleH } = options;
  // Player position and rotation
  const playerX = ref(0);
  const playerY = ref(0);
  const playerZ = ref(0);
  const playerRotation = ref(0);
  // Movement speed
  const moveSpeed = computed(() => config.character.moveSpeed);

  // Jump state
  const isJumping = ref(false);
  const verticalVelocity = ref(0);

  // VueUse: Reactive keyboard state (replaces manual Map)
  const { w, a, s, d, space } = useMagicKeys();

  // Virtual joystick state for mobile
  const joystickActive = ref(false);
  const joystickX = ref(0);
  const joystickY = ref(0);
  const joystickStartX = ref(0);
  const joystickStartY = ref(0);
  const joystickTouchId = ref<number | null>(null);

  // VueUse: Watch for space key to trigger jump (replaces onKeyDown handler)
  whenever(space, () => {
    if (!isJumping.value) {
      isJumping.value = true;
      verticalVelocity.value = config.character.jumpInitialVelocity;
    }
  });

  // Touch handlers for virtual joystick (mobile)
  function onTouchStart(e: TouchEvent) {
    // Only activate joystick if touch is in the left half of the screen (for movement)
    const touch = e.touches[0];
    if (touch.clientX < window.innerWidth / 2 && joystickTouchId.value === null) {
      joystickTouchId.value = touch.identifier;
      joystickActive.value = true;
      joystickStartX.value = touch.clientX;
      joystickStartY.value = touch.clientY;
      joystickX.value = touch.clientX;
      joystickY.value = touch.clientY;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (joystickTouchId.value === null) return;

    // Find the touch that matches our joystick
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.identifier === joystickTouchId.value) {
        joystickX.value = touch.clientX;
        joystickY.value = touch.clientY;
        break;
      }
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (joystickTouchId.value === null) return;

    // Check if our joystick touch ended
    let touchEnded = true;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === joystickTouchId.value) {
        touchEnded = false;
        break;
      }
    }

    if (touchEnded) {
      joystickActive.value = false;
      joystickX.value = 0;
      joystickY.value = 0;
      joystickTouchId.value = null;
    }
  }

  // Update player movement based on input and camera angle
  function update(delta: number) {
    // Calculate movement input
    let inputX = 0;
    let inputZ = 0;

    // VueUse keyboard input (desktop) - reactive refs from useMagicKeys
    if (w.value) inputZ -= 1;
    if (s.value) inputZ += 1;
    if (a.value) inputX -= 1;
    if (d.value) inputX += 1;

    // Joystick input (mobile) - overrides keyboard if active
    if (joystickActive.value) {
      const dx = joystickX.value - joystickStartX.value;
      const dy = joystickY.value - joystickStartY.value;

      // Clamp to max distance
      const distance = Math.sqrt(dx * dx + dy * dy);
      const clampedDistance = Math.min(distance, config.character.joystickMaxDistance);

      if (distance > config.character.joystickDeadZone) {
        // Apply dead zone threshold
        const normalizedDx = (dx / distance) * clampedDistance;
        const normalizedDy = (dy / distance) * clampedDistance;

        // Convert joystick displacement to input (-1 to 1)
        inputX = normalizedDx / config.character.joystickMaxDistance;
        inputZ = normalizedDy / config.character.joystickMaxDistance;
      }
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
      const angle = cameraAngleH.value;
      const moveX = inputX * Math.cos(angle) + inputZ * Math.sin(angle);
      const moveZ = -inputX * Math.sin(angle) + inputZ * Math.cos(angle);

      // Update player position
      playerX.value += moveX * moveSpeed.value * delta;
      playerZ.value += moveZ * moveSpeed.value * delta;

      // Update player rotation to face movement direction (world space)
      playerRotation.value = Math.atan2(moveX, moveZ);
    }

    // Handle jump physics
    if (isJumping.value) {
      // Apply gravity - increases over time for heavy feel
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
  }

  // Reset player to origin
  function reset() {
    playerX.value = 0;
    playerY.value = 0;
    playerZ.value = 0;
    playerRotation.value = 0;
    isJumping.value = false;
    verticalVelocity.value = 0;
  }

  // Cleanup (VueUse handles keyboard cleanup automatically)
  function cleanup() {
    console.log('🧹 [Character] Starting cleanup...');

    console.log('  ↳ Resetting character state');
    // Reset joystick state
    joystickActive.value = false;
    joystickX.value = 0;
    joystickY.value = 0;
    joystickTouchId.value = null;

    console.log('✅ [Character] Cleanup complete');
  }

  // VueUse: Setup touch event listeners (auto-cleanup on unmount)
  console.log('🎮 [Character] Initializing...');
  console.log('  ↳ Adding touch event listeners');
  useEventListener('touchstart', onTouchStart, { passive: true });
  useEventListener('touchmove', onTouchMove, { passive: true });
  useEventListener('touchend', onTouchEnd, { passive: true });
  console.log('✅ [Character] Initialized');

  return {
    position: {
      x: playerX,
      y: playerY,
      z: playerZ,
    },
    rotation: playerRotation,
    speed: moveSpeed,
    isJumping,
    joystick: {
      active: joystickActive,
      x: joystickX,
      y: joystickY,
      startX: joystickStartX,
      startY: joystickStartY,
    },

    update,
    reset,
    cleanup,
  };
}
