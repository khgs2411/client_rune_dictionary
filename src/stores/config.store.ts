import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useConfigStore = defineStore('config', () => {


    const character = reactive({
        moveSpeed: 10,

        // Jump configuration
        jumpHeight: 3, // Maximum jump height
        jumpInitialVelocity: 20, // Initial upward velocity
        jumpGravity: 50, // Gravity acceleration (higher = heavier feel)
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

    const camera = reactive({
        // Initial camera position
        initialDistance: 10, // Distance from target
        initialAngleH: 0, // Initial horizontal angle (radians)
        initialAngleV: 0.4, // Initial vertical angle (radians)

        // Camera rotation sensitivity
        mouseSensitivityH: 0.005, // Horizontal mouse sensitivity
        mouseSensitivityV: 0.005, // Vertical mouse sensitivity
        touchSensitivityMultiplier: 2, // Touch sensitivity multiplier (compared to mouse)

        // Camera zoom limits
        zoomMin: 5, // Minimum zoom distance
        zoomMax: 20, // Maximum zoom distance

        // Camera angle limits
        angleVMin: 0.1, // Minimum vertical angle (prevent looking straight down)
        angleVMax: Math.PI / 2 - 0.1, // Maximum vertical angle (prevent looking straight up)
    })

    const debug = reactive({
        enableConsoleLog: true, // Enable/disable console logs
        showStats: true, // Show/hide Three.js stats panel
        showWebSocketDebugger: false, // Show/hide WebSocket event debugger
    })

    return {
        character,
        camera,
        debug,
    }
},);