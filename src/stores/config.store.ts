import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore('config', () => {

    const characterMoveSpeed = ref(10);

    // Jump configuration
    const jumpHeight = ref(3); // Maximum jump height
    const jumpInitialVelocity = ref(12); // Initial upward velocity
    const jumpGravity = ref(30); // Gravity acceleration (higher = heavier feel)
    const jumpMaxFallSpeed = ref(40); // Terminal velocity when falling

    // Collision and boundary configuration
    const characterRadius = ref(0.5); // Character collision radius
    const planeBoundary = ref(50); // Plane size (100x100, so boundary is ±50)
    const respawnThreshold = ref(-10); // Y position below which to respawn
    const respawnPosition = { x: 0, y: 0, z: 0 }; // Position to respawn at

    return {
        characterMoveSpeed,
        jumpHeight,
        jumpInitialVelocity,
        jumpGravity,
        jumpMaxFallSpeed,
        characterRadius,
        planeBoundary,
        respawnThreshold,
        respawnPosition,
    }
});