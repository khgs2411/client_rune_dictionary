import { CollisionComponent } from "../../components/interactions/CollisionComponent";
import { GeometryComponent } from "../../components/rendering/GeometryComponent";
import { I_InstanceTransform, InstancedMeshComponent } from "../../components/rendering/InstancedMeshComponent";
import { MaterialComponent } from "../../components/rendering/MaterialComponent";
import { ToonMaterialComponent } from "../../components/rendering/ToonMaterialComponent";
import { GameObject } from "../../GameObject";

export interface I_RockPosition {
	x: number;
	y: number;
	z: number;
	scale?: number; // Individual rock scale (default: 1)
	rotationY?: number; // Y rotation for variety (default: random)
}

export interface I_RocksConfig {
	positions: I_RockPosition[];
	baseScale?: number; // Base scale multiplier (default: 1)
	color?: number; // Rock color (default: 0x708090 - slate gray)
	useToonShading?: boolean; // Use cel-shaded materials (default: false)
	vibrant?: boolean; // Boost saturation (default: false)
	enablePhysics?: boolean; // Enable collision (default: true)
}

/**
 * Rocks Prefab - Low-poly rocks using icosahedron geometry
 *
 * Creates instanced rocks for efficient rendering.
 * Icosahedron with low detail gives a nice chunky rock look.
 *
 * Usage:
 * ```typescript
 * const rocks = Rocks.create({
 *   positions: [
 *     { x: 5, y: 0, z: 5 },
 *     { x: 7, y: 0, z: 3, scale: 1.5 },
 *     { x: 6, y: 0, z: 8, scale: 0.7 }
 *   ],
 *   useToonShading: true,
 *   vibrant: true
 * });
 * ```
 */
export class Rocks {
	static create(config: I_RocksConfig): GameObject {
		const baseScale = config.baseScale ?? 2;
		const color = config.color ?? 0x708090; // Slate gray
		const useToonShading = config.useToonShading ?? false;
		const vibrant = config.vibrant ?? false;
		const enablePhysics = config.enablePhysics ?? true;

		// Create instances with random rotation for variety
		const instances: I_InstanceTransform[] = config.positions.map((pos) => {
			const scale = (pos.scale ?? 1) * baseScale;
			const rotationY = pos.rotationY ?? Math.random() * Math.PI * 2;

			return {
				position: [pos.x, pos.y + scale / 2, pos.z], // Offset by half height
				rotation: [0, rotationY, 0],
				scale: [scale, scale * 0.7, scale], // Slightly flattened
			};
		});

		// Material factory
		const createMaterial = () =>
			useToonShading
				? new ToonMaterialComponent({
						color,
						gradientSteps: 3,
						vibrant,
					})
				: new MaterialComponent({
						color,
						roughness: 0.95,
						metalness: 0,
					});

		// Rocks GameObject using icosahedron for chunky low-poly look
		const rocks = new GameObject({ id: "rocks" })
			.addComponent(
				new GeometryComponent({
					type: "sphere", // Will use low segments for rock-like appearance
					params: [1, 6, 4], // radius, widthSegments, heightSegments (low = chunky)
				}),
			)
			.addComponent(createMaterial())
			.addComponent(
				new InstancedMeshComponent({
					instances,
					castShadow: true,
					receiveShadow: true,
				}),
			);

		if (enablePhysics) {
			rocks.addComponent(
				new CollisionComponent({
					type: "static",
					shape: "ball", // Approximate with sphere collision
				}),
			);
		}

		return rocks;
	}
}
