import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useConfigStore = defineStore('config', () => {


    const character = reactive({
        moveSpeed: 10,

        // Jump configuration
        jumpHeight: 3, // Maximum jump height
        jumpInitialVelocity: 12, // Initial upward velocity
        jumpGravity: 30, // Gravity acceleration (higher = heavier feel)
        jumpMaxFallSpeed: 40, // Terminal velocity when falling

        // Ground and physics
        groundLevel: 0, // Default ground height

        // Mobile joystick configuration
        joystickMaxDistance: 50, // Maximum joystick displacement in pixels
        joystickDeadZone: 5, // Dead zone threshold in pixels (ignore small movements)

        // Collision and boundary configuration
        characterRadius: 0.5, // Character collision radius
        planeBoundary: 50, // Plane size (100x100, so boundary is ±50)
        respawnThreshold: -10, // Y position below which to respawn
        respawnPosition: { x: 0, y: 0, z: 0 }, // Position to respawn at
    })



    return {
        character: character,

    }
});