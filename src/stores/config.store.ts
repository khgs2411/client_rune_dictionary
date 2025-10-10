import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore('config', () => {

    const characterMoveSpeed = ref(10);

    // Jump configuration
    const jumpHeight = ref(3); // Maximum jump height
    const jumpInitialVelocity = ref(12); // Initial upward velocity
    const jumpGravity = ref(30); // Gravity acceleration (higher = heavier feel)
    const jumpMaxFallSpeed = ref(40); // Terminal velocity when falling

    return {
        characterMoveSpeed,
        jumpHeight,
        jumpInitialVelocity,
        jumpGravity,
        jumpMaxFallSpeed,
    }
});