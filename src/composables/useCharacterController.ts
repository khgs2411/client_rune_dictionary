import { ref, type Ref } from 'vue';

export interface CharacterControls {
  position: {
    x: Ref<number>;
    z: Ref<number>;
  };
  rotation: Ref<number>;
  speed: Ref<number>;

  update: (delta: number, cameraAngleH: number) => void;
  reset: () => void;
  cleanup: () => void;
}

export function useCharacterControls(): CharacterControls {
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

  // Keyboard handlers
  function onKeyDown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key as keyof typeof keys] = true;
  }

  function onKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key as keyof typeof keys] = false;
  }

  // Update player movement based on input and camera angle
  function update(delta: number, cameraAngleH: number) {
    // Calculate movement input
    let inputX = 0;
    let inputZ = 0;

    if (keys.w) inputZ -= 1;
    if (keys.s) inputZ += 1;
    if (keys.a) inputX -= 1;
    if (keys.d) inputX += 1;

    // Apply camera-relative movement
    if (inputX !== 0 || inputZ !== 0) {
      // Normalize input
      const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
      inputX /= length;
      inputZ /= length;

      // Convert input to world space based on camera angle
      const angle = cameraAngleH;
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
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);

    // Reset key states
    keys.w = false;
    keys.s = false;
    keys.a = false;
    keys.d = false;
  }

  // Initialize event listeners
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    position: {
      x: playerX,
      z: playerZ,
    },
    rotation: playerRotation,
    speed: moveSpeed,

    update,
    reset,
    cleanup,
  };
}
