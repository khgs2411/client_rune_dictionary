import { TransformComponent } from "../components/entities/TransformComponent";
import { CollisionComponent } from "../components/interactions/CollisionComponent";
import { GeometryComponent } from "../components/rendering/GeometryComponent";
import { GridHelperComponent } from "../components/rendering/GridHelperComponent";
import { MaterialComponent } from "../components/rendering/MaterialComponent";
import { MeshComponent } from "../components/rendering/MeshComponent";
import { GameObject } from "../GameObject";

import { useSettingsStore } from "@/stores/settings.store";

export interface I_GroundConfig {
	size?: number; // Width and depth of the ground plane (default: 100)
	gridDivisions?: number; // Number of grid divisions (default: 50)
	position?: [number, number, number]; // World position (default: [0, 0, 0])
	useTheme?: boolean; // Use theme color for ground (default: true)
	staticColor?: number; // Static color if not using theme
	showGrid?: boolean; // Show grid helper (default: true)
	enablePhysics?: boolean; // Enable physics collider (default: true)
}

/**
 * Ground Prefab - Complete ground plane GameObject
 *
 * This is a complete GameObject with all necessary components:
 * - TransformComponent (position)
 * - GeometryComponent (plane geometry)
 * - MaterialComponent (themed or static color)
 * - MeshComponent (creates Three.js mesh)
 * - GridHelperComponent (optional grid visualization)
 * - PhysicsComponent (optional static physics collider)
 *
 * Usage:
 * ```typescript
 * const ground = new Ground({
 *   size: 100,
 *   gridDivisions: 50,
 *   position: [0, 0, 0],
 *   useTheme: true,
 *   showGrid: true,
 *   enablePhysics: true
 * });
 * ```
 */
export class Ground extends GameObject {
	constructor(config: I_GroundConfig = {}) {
		// Create GameObject with unique ID
		super({ id: "ground" });

		const settings = useSettingsStore();

		// Configuration with defaults
		const size = config.size ?? 100;
		const gridDivisions = config.gridDivisions ?? 50;
		const position = config.position ?? [0, 0, 0];
		const useTheme = config.useTheme ?? false;
		const staticColor = config.staticColor ?? 0x808080;
		const showGrid = config.showGrid ?? true;
		const enablePhysics = config.enablePhysics ?? true;

		// Determine material color
		const color = useTheme ? settings.theme.primaryForeground : staticColor;

		// Add small Y offset to prevent z-fighting and initial clipping
		const groundPosition: [number, number, number] = [position[0], position[1] - 0.05, position[2]];

		// Add all components in fluent style
		this.addComponent(
			new TransformComponent({
				position: groundPosition,
				rotation: [-Math.PI / 2, 0, 0], // Rotate plane to be horizontal
			}),
		)
			.addComponent(
				new GeometryComponent({
					type: "plane",
					params: [size, size],
				}),
			)
			.addComponent(
				new MaterialComponent({
					color: 0x55aa55, // Fantasy Grass Green
					roughness: 0.9, // Matte surface
					metalness: 0,
				}),
			)
			.addComponent(
				new MeshComponent({
					castShadow: false, // Ground doesn't cast shadow
					receiveShadow: true, // Ground receives shadows
				}),
			);

		// Optional grid helper
		if (showGrid) {
			this.addComponent(
				new GridHelperComponent({
					size: size,
					divisions: gridDivisions,
					centerColor: 0x444444,
					gridColor: 0x888888,
					yOffset: 0.01, // Prevent z-fighting
				}),
			);
		}

		// Optional physics collider
		if (enablePhysics) {
			this.addComponent(
				new CollisionComponent({
					type: "static",
					shape: "cuboid",
					shapeParams: [size / 2, 0.1, size / 2], // Half-extents for cuboid collider
				}),
			);
		}
	}
}
