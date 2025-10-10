import { onMounted, ref, type Ref } from 'vue';

export interface CharacterControlsOptions {
  cameraAngleH: Ref<number>;
}

export interface CharacterControls {
  position: {
    x: Ref<number>;
    z: Ref<number>;
  };
  rotation: Ref<number>;
  speed: Ref<number>;
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
  const { cameraAngleH } = options;
  // Player position and rotation
  const playerX = ref(0);
  const playerZ = ref(0);
  const playerRotation = ref(0);

  // Movement speed
  const moveSpeed = ref(5);

  // Keyboard state
  const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
  };

  // Virtual joystick state for mobile
  const joystickActive = ref(false);
  const joystickX = ref(0);
  const joystickY = ref(0);
  const joystickStartX = ref(0);
  const joystickStartY = ref(0);
  const joystickTouchId = ref<number | null>(null);
  const joystickMaxDistance = 50; // Maximum joystick displacement in pixels

  // Keyboard handlers
  function onKeyDown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key as keyof typeof keys] = true;
  }

  function onKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key as keyof typeof keys] = false;
  }

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

    // Keyboard input (desktop)
    if (keys.w) inputZ -= 1;
    if (keys.s) inputZ += 1;
    if (keys.a) inputX -= 1;
    if (keys.d) inputX += 1;

    // Joystick input (mobile) - overrides keyboard if active
    if (joystickActive.value) {
      const dx = joystickX.value - joystickStartX.value;
      const dy = joystickY.value - joystickStartY.value;

      // Clamp to max distance
      const distance = Math.sqrt(dx * dx + dy * dy);
      const clampedDistance = Math.min(distance, joystickMaxDistance);

      if (distance > 5) {
        // Dead zone of 5 pixels
        const normalizedDx = (dx / distance) * clampedDistance;
        const normalizedDy = (dy / distance) * clampedDistance;

        // Convert joystick displacement to input (-1 to 1)
        inputX = normalizedDx / joystickMaxDistance;
        inputZ = normalizedDy / joystickMaxDistance;
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
  }

  // Reset player to origin
  function reset() {
    playerX.value = 0;
    playerZ.value = 0;
    playerRotation.value = 0;
  }

  // Cleanup event listeners
  function cleanup() {
    // Remove keyboard event listeners
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);

    // Remove touch event listeners
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);

    // Reset key states
    keys.w = false;
    keys.s = false;
    keys.a = false;
    keys.d = false;

    // Reset joystick state
    joystickActive.value = false;
    joystickX.value = 0;
    joystickY.value = 0;
    joystickTouchId.value = null;
  }




  function startCharacter() {
    // Initialize event listeners 
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Initialize touch event listeners for mobile joystick
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
  }


  onMounted(startCharacter)

  return {
    position: {
      x: playerX,
      z: playerZ,
    },
    rotation: playerRotation,
    speed: moveSpeed,
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
