import { useConfigStore } from '@/stores/config.store';
import { computed, onMounted, ref, type Ref } from 'vue';

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
  const { cameraAngleH } = options;
  // Player position and rotation
  const playerX = ref(0);
  const playerY = ref(0);
  const playerZ = ref(0);
  const playerRotation = ref(0);
  const config = useConfigStore()
  // Movement speed
  const moveSpeed = computed(() => options.moveSpeed || config.characterMoveSpeed);

  // Jump state
  const isJumping = ref(false);
  const verticalVelocity = ref(0);
  const groundLevel = 0;

  // Keyboard state using keycodes
  const keys = new Map<string, boolean>();

  // Key code constants for movement
  const KEY_W = 'KeyW';
  const KEY_S = 'KeyS';
  const KEY_A = 'KeyA';
  const KEY_D = 'KeyD';
  const KEY_SPACE = 'Space';

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
    if (e.code === KEY_W || e.code === KEY_S || e.code === KEY_A || e.code === KEY_D) {
      keys.set(e.code, true);
    }

    // Handle jump
    if (e.code === KEY_SPACE && !isJumping.value) {
      jump(e);
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.code === KEY_W || e.code === KEY_S || e.code === KEY_A || e.code === KEY_D) {
      keys.set(e.code, false);
    }
  }

  // Jump function
  function jump(e: KeyboardEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isJumping.value) return; // Already jumping

    isJumping.value = true;
    verticalVelocity.value = config.jumpInitialVelocity;
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
    if (keys.get(KEY_W)) inputZ -= 1;
    if (keys.get(KEY_S)) inputZ += 1;
    if (keys.get(KEY_A)) inputX -= 1;
    if (keys.get(KEY_D)) inputX += 1;

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

    // Handle jump physics
    if (isJumping.value) {
      // Apply gravity - increases over time for heavy feel
      verticalVelocity.value -= config.jumpGravity * delta;

      // Clamp falling speed to max fall velocity
      if (verticalVelocity.value < -config.jumpMaxFallSpeed) {
        verticalVelocity.value = -config.jumpMaxFallSpeed;
      }

      // Update Y position
      playerY.value += verticalVelocity.value * delta;

      // Check if landed
      if (playerY.value <= groundLevel) {
        playerY.value = groundLevel;
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

  // Cleanup event listeners
  function cleanup() {
    console.log('🧹 [Character] Starting cleanup...');

    console.log('  ↳ Removing event listeners');
    // Remove keyboard event listeners
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);

    // Remove touch event listeners
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);

    console.log('  ↳ Resetting character state');
    // Reset key states
    keys.clear();

    // Reset joystick state
    joystickActive.value = false;
    joystickX.value = 0;
    joystickY.value = 0;
    joystickTouchId.value = null;

    console.log('✅ [Character] Cleanup complete');
  }

  function startCharacter() {
    console.log('🎮 [Character] Initializing...');

    console.log('  ↳ Adding keyboard event listeners');
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    console.log('  ↳ Adding touch event listeners');
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    console.log('✅ [Character] Initialized');
  }

  onMounted(() => {
    console.log('🎬 [Character] Mounted');
    startCharacter();
  });

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
