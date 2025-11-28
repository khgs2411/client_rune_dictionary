import { defineStore } from "pinia";
import { reactive } from "vue";

export type GameConfig = ReturnType<typeof useGameConfigStore>;

// Metadata for customizing how config values are displayed and edited
export interface ConfigFieldMetadata {
	label?: string; // Display label (defaults to humanized key)
	description?: string; // Help text shown below control
	min?: number; // For numeric values
	max?: number; // For numeric values
	step?: number; // For numeric sliders
	hidden?: boolean; // Hide from UI
	group?: string; // Group name for organizing UI
	order?: number; // Sort order within group
}

export interface ConfigMetadata {
	[category: string]: {
		[field: string]: ConfigFieldMetadata;
	};
}

// Helper to convert camelCase to Title Case
function humanizeKey(key: string): string {
	return key
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim();
}

// Define custom metadata for specific fields
// Fields not listed here will use automatic defaults based on their value type
const metadata: ConfigMetadata = {
	character: {
		moveSpeed: {
			label: "Movement Speed",
			min: 1,
			max: 20,
			step: 1,
			group: "Character",
		},
		jumpInitialVelocity: {
			label: "Jump Power",
			description: "Initial upward velocity when jumping",
			min: 5,
			max: 20,
			step: 0.5,
			group: "Jump Settings",
		},
		jumpGravity: {
			label: "Gravity (Weight)",
			description: "Higher values make character fall faster",
			min: 10,
			max: 70,
			step: 1,
			group: "Jump Settings",
		},
		jumpMaxFallSpeed: {
			label: "Max Fall Speed",
			description: "Terminal velocity when falling",
			min: 10,
			max: 40,
			step: 1,
			group: "Jump Settings",
		},
		jumpHeight: {
			hidden: true, // Not directly user-configurable
		},
		groundLevel: {
			hidden: true,
		},
		joystickMaxDistance: {
			label: "Joystick Max Distance",
			min: 30,
			max: 100,
			step: 5,
			group: "Mobile Controls",
		},
		joystickDeadZone: {
			label: "Joystick Dead Zone",
			min: 0,
			max: 20,
			step: 1,
			group: "Mobile Controls",
		},
		characterRadius: {
			label: "Character Radius",
			min: 0.1,
			max: 2,
			step: 0.1,
			group: "Physics",
		},
		planeBoundary: {
			label: "Plane Boundary",
			min: 10,
			max: 100,
			step: 5,
			group: "Physics",
		},
		respawnThreshold: {
			label: "Respawn Threshold",
			min: -50,
			max: 0,
			step: 1,
			group: "Physics",
		},
		respawnPosition: {
			hidden: true, // Complex object, not easily editable with simple controls
		},
	},
	camera: {
		initialDistance: {
			label: "Initial Distance",
			min: 5,
			max: 30,
			step: 1,
			group: "Camera Position",
		},
		initialAngleH: {
			label: "Initial Horizontal Angle",
			min: -Math.PI,
			max: Math.PI,
			step: 0.1,
			group: "Camera Position",
		},
		initialAngleV: {
			label: "Initial Vertical Angle",
			min: 0,
			max: Math.PI / 2,
			step: 0.1,
			group: "Camera Position",
		},
		mouseSensitivityH: {
			label: "Mouse Sensitivity (Horizontal)",
			min: 0.001,
			max: 0.05,
			step: 0.001,
			group: "Camera Sensitivity",
		},
		mouseSensitivityV: {
			label: "Mouse Sensitivity (Vertical)",
			min: 0.001,
			max: 0.05,
			step: 0.001,
			group: "Camera Sensitivity",
		},
		touchSensitivityMultiplier: {
			label: "Touch Sensitivity Multiplier",
			min: 0.5,
			max: 5,
			step: 0.5,
			group: "Camera Sensitivity",
		},
		zoomMin: {
			label: "Zoom Min",
			min: 1,
			max: 10,
			step: 1,
			group: "Camera Zoom",
		},
		zoomMax: {
			label: "Zoom Max",
			min: 10,
			max: 50,
			step: 1,
			group: "Camera Zoom",
		},
		angleVMin: {
			label: "Min Vertical Angle",
			min: 0.01,
			max: 1,
			step: 0.01,
			group: "Camera Limits",
		},
		angleVMax: {
			label: "Max Vertical Angle",
			min: 1,
			max: Math.PI / 2,
			step: 0.1,
			group: "Camera Limits",
		},
	},
	editor: {
		enabled: {
			hidden: true,
		},
		showGrid: {
			hidden: true,
		},
		snapToGrid: {
			hidden: true,
		},
		dragOpacity: {
			hidden: true,
		},
	},
	interaction: {
		hoverGlowIntensity: {
			label: "Hover Glow Intensity",
			min: 0,
			max: 1,
			step: 0.1,
			group: "Interaction Settings",
		},
		cameraShakeIntensity: {
			label: "Camera Shake Intensity",
			min: 0,
			max: 0.5,
			step: 0.05,
			group: "Interaction Settings",
		},
		particleCount: {
			label: "Particle Burst Count",
			min: 0,
			max: 50,
			step: 5,
			group: "Interaction Settings",
		},
	},
};

export const useGameConfigStore = defineStore(
	"gameConfig",
	() => {
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
		});

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
		});

		const interaction = reactive({
			hoverGlowIntensity: 0.3, // Hover glow emissive intensity (0 = off, 1 = max)
			cameraShakeIntensity: 0.1, // Camera shake intensity (0 = off, 0.5 = max)
			particleCount: 20, // Particle burst count (0 = off, 50 = max)
		});

		const editor = reactive({
			enabled: false, // Toggle editor mode (enables object dragging, disables click behaviors)
			showGrid: true, // Show grid when dragging objects
			snapToGrid: 0.5, // Grid snap size in world units (0 = no snapping)
			dragOpacity: 0.5, // Object opacity while dragging (0 = invisible, 1 = opaque)
		});

		// Helper to get metadata for a field with smart defaults
		function getFieldMetadata(category: string, field: string, value: any): ConfigFieldMetadata {
			const customMeta = metadata[category]?.[field] || {};

			// If explicitly hidden, return as-is
			if (customMeta.hidden) return customMeta;

			// Auto-generate defaults based on value type
			const defaults: ConfigFieldMetadata = {
				label: customMeta.label ?? humanizeKey(field),
				group: customMeta.group ?? humanizeKey(category),
				description: customMeta.description,
				order: customMeta.order,
			};

			if (typeof value === "number") {
				// Smart defaults for numeric values
				const absValue = Math.abs(value);

				// Min: either custom, or 10% of value (but at least 0 for positive values, allow negatives)
				if (customMeta.min !== undefined) {
					defaults.min = customMeta.min;
				} else if (value >= 0) {
					defaults.min = 0;
				} else {
					defaults.min = Math.floor(value * 2); // Allow range below negative values
				}

				// Max: either custom, or 10× value, or 100 (whichever is larger)
				if (customMeta.max !== undefined) {
					defaults.max = customMeta.max;
				} else if (value === 0) {
					defaults.max = 100; // Default range for zero values
				} else if (value > 0) {
					defaults.max = Math.max(Math.ceil(value * 10), 100);
				} else {
					defaults.max = 0; // Negative values: range from negative to 0
				}

				// Step: either custom, or based on magnitude of value
				if (customMeta.step !== undefined) {
					defaults.step = customMeta.step;
				} else if (absValue === 0) {
					defaults.step = 1;
				} else if (absValue < 0.01) {
					defaults.step = 0.001; // Very small numbers
				} else if (absValue < 0.1) {
					defaults.step = 0.01;
				} else if (absValue < 1) {
					defaults.step = 0.1;
				} else if (absValue < 10) {
					defaults.step = 0.5;
				} else {
					defaults.step = 1; // Larger numbers
				}
			}

			return defaults;
		}

		return {
			character,
			camera,
			interaction,
			editor,
			getFieldMetadata,
		};
	},
	{ persist: true },
);

// Export helper for use in components
export function getConfigFieldMetadata(config: GameConfig, category: string, field: string, value: any): ConfigFieldMetadata {
	const customMeta = metadata[category]?.[field] || {};

	// If explicitly hidden, return as-is
	if (customMeta.hidden) return customMeta;

	// Auto-generate defaults based on value type
	const defaults: ConfigFieldMetadata = {
		label: customMeta.label ?? humanizeKey(field),
		group: customMeta.group ?? humanizeKey(category),
		description: customMeta.description,
		order: customMeta.order,
	};

	if (typeof value === "number") {
		// Smart defaults for numeric values
		const absValue = Math.abs(value);

		// Min: either custom, or 10% of value (but at least 0 for positive values, allow negatives)
		if (customMeta.min !== undefined) {
			defaults.min = customMeta.min;
		} else if (value >= 0) {
			defaults.min = 0;
		} else {
			defaults.min = Math.floor(value * 2); // Allow range below negative values
		}

		// Max: either custom, or 10× value, or 100 (whichever is larger)
		if (customMeta.max !== undefined) {
			defaults.max = customMeta.max;
		} else if (value === 0) {
			defaults.max = 100; // Default range for zero values
		} else if (value > 0) {
			defaults.max = Math.max(Math.ceil(value * 10), 100);
		} else {
			defaults.max = 0; // Negative values: range from negative to 0
		}

		// Step: either custom, or based on magnitude of value
		if (customMeta.step !== undefined) {
			defaults.step = customMeta.step;
		} else if (absValue === 0) {
			defaults.step = 1;
		} else if (absValue < 0.01) {
			defaults.step = 0.001; // Very small numbers
		} else if (absValue < 0.1) {
			defaults.step = 0.01;
		} else if (absValue < 1) {
			defaults.step = 0.1;
		} else if (absValue < 10) {
			defaults.step = 0.5;
		} else {
			defaults.step = 1; // Larger numbers
		}
	}

	return defaults;
}
