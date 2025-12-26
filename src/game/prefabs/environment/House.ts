import { OcclusionComponent } from "@/game/components/rendering/OcclusionComponent";
import { TransformComponent } from "../../components/entities/TransformComponent";
import { CollisionComponent } from "../../components/physics/CollisionComponent";
import { GeometryComponent } from "../../components/rendering/GeometryComponent";
import { MaterialComponent } from "../../components/rendering/MaterialComponent";
import { MeshComponent } from "../../components/rendering/MeshComponent";
import { ToonMaterialComponent } from "../../components/rendering/ToonMaterialComponent";
import { GameObject } from "../../GameObject";
import { I_BasePrefabConfig } from "../prefab.types";

export interface I_HouseConfig extends I_BasePrefabConfig {
	position?: [number, number, number];
	rotation?: [number, number, number];
	scale?: number; // Uniform scale multiplier (default: 1)
	wallColor?: number; // Wall color (default: 0xdeb887 - burlywood)
	roofColor?: number; // Roof color (default: 0x8b4513 - saddle brown)
}

/**
 * House Prefab - Simple low-poly house with walls and roof
 *
 * Creates two GameObjects:
 * - [0]: Walls (box geometry)
 * - [1]: Roof (cone/pyramid geometry)
 *
 * Usage:
 * ```typescript
 * const [walls, roof] = House.create({
 *   position: [10, 0, 10],
 *   useToonShading: true,
 *   vibrant: true
 * });
 * ```
 */
export class House {
	static create(config: I_HouseConfig = {}): [GameObject, GameObject] {
		const id = config.id ?? "house";
		const position = config.position ?? [0, 0, 0];
		const rotation = config.rotation ?? [0, 0, 0];
		const scale = config.scale ?? 1;
		const wallColor = config.wallColor ?? 0xdeb887; // Burlywood
		const roofColor = config.roofColor ?? 0x8b4513; // Saddle brown
		const useToonShading = config.useToonShading ?? false;
		const vibrant = config.vibrant ?? false;
		const enablePhysics = config.enablePhysics ?? true;

		// House dimensions (OSRS-inspired low-poly)
		const wallWidth = 8 * scale;
		const wallHeight = 6 * scale;
		const wallDepth = 8 * scale;
		const roofHeight = 4 * scale;
		const roofRadius = 6 * scale; // Slightly wider than walls

		// Material factories
		const createWallMaterial = () =>
			useToonShading
				? new ToonMaterialComponent({
						color: wallColor,
						gradientSteps: 3,
						vibrant,
					})
				: new MaterialComponent({
						color: wallColor,
						roughness: 0.9,
						metalness: 0,
					});

		const createRoofMaterial = () =>
			useToonShading
				? new ToonMaterialComponent({
						color: roofColor,
						gradientSteps: 3,
						vibrant,
					})
				: new MaterialComponent({
						color: roofColor,
						roughness: 0.8,
						metalness: 0,
					});

		// Walls GameObject
		const walls = new GameObject({ id: `${id}-walls` })
			.addComponent(
				new TransformComponent({
					position: [position[0], position[1] + wallHeight / 2, position[2]],
					rotation,
				}),
			)
			.addComponent(
				new GeometryComponent({
					type: "box",
					params: [wallWidth, wallHeight, wallDepth],
				}),
			)
			.addComponent(createWallMaterial())
			.addComponent(
				new MeshComponent({
					castShadow: true,
					receiveShadow: true,
				}),
			)
			.addComponent(new OcclusionComponent());

		if (enablePhysics) {
			walls.addComponent(
				new CollisionComponent({
					type: "static",
					shape: "cuboid",
					shapeParams: [wallWidth / 2, wallHeight / 2, wallDepth / 2],
				}),
			);
		}

		// Roof GameObject (pyramid using cone with 4 segments)
		const roof = new GameObject({ id: `${id}-roof` })
			.addComponent(
				new TransformComponent({
					position: [position[0], position[1] + wallHeight + roofHeight / 2, position[2]],
					rotation,
				}),
			)
			.addComponent(
				new GeometryComponent({
					type: "cone",
					params: [roofRadius, roofHeight, 4], // 4 segments = pyramid shape
				}),
			)
			.addComponent(createRoofMaterial())
			.addComponent(
				new MeshComponent({
					castShadow: true,
					receiveShadow: true,
				}),
			)
			.addComponent(new OcclusionComponent());;

		// Rotate roof 45 degrees to align with walls
		const roofTransform = roof.getComponent(TransformComponent);
		if (roofTransform) {
			roofTransform.setRotation(rotation[0], rotation[1] + Math.PI / 4, rotation[2]);
		}

		return [walls, roof];
	}
}
