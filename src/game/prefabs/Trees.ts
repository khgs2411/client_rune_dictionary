import { CollisionComponent } from "../components/interactions/CollisionComponent";
import { GeometryComponent } from "../components/rendering/GeometryComponent";
import { I_InstanceTransform, InstancedMeshComponent } from "../components/rendering/InstancedMeshComponent";
import { MaterialComponent } from "../components/rendering/MaterialComponent";
import { ToonMaterialComponent } from "../components/rendering/ToonMaterialComponent";
import { GameObject } from "../GameObject";

export interface I_TreePosition {
	x: number;
	y: number;
	z: number;
}

export interface I_TreesConfig {
	id?: string; // Base ID for tree GameObjects (default: 'trees')
	positions: I_TreePosition[]; // Base positions for trees
	trunkHeight?: number; // Height of trunk (default: 1.5)
	trunkRadius?: number; // Radius of trunk (default: 0.15-0.2)
	leavesHeight?: number; // Height of leaves cone (default: 1.5)
	leavesRadius?: number; // Radius of leaves cone (default: 0.8)
	trunkColor?: number; // Trunk color (default: 0x654321 - brown)
	leavesColor?: number; // Leaves color (default: 0x228b22 - green)
	enablePhysics?: boolean; // Enable physics for trunks (default: true)
	useToonShading?: boolean; // Use cel-shaded materials (default: false)
	vibrant?: boolean; // Boost color saturation for Genshin-style vibrancy (default: false)
}

/**
 * Trees Helper - Creates tree GameObjects (trunks + leaves)
 *
 * Returns an array of 2 GameObjects:
 * - [0]: Tree trunks (instanced cylinders)
 * - [1]: Tree leaves (instanced cones)
 *
 * Each GameObject uses InstancedMeshComponent for efficient rendering.
 *
 * Usage:
 * ```typescript
 * const [trunks, leaves] = Trees.create({
 *   positions: [
 *     { x: 10, y: 0, z: 0 },
 *     { x: 12, y: 0, z: 2 },
 *     { x: 14, y: 0, z: -1 }
 *   ]
 * });
 *
 * ```
 */
export class Trees {
	/**
	 * Create tree GameObjects from positions
	 * Returns [trunks, leaves]
	 */
	static create(config: I_TreesConfig): [GameObject, GameObject] {
		const id = config.id ?? "trees";
		const SIZE_MULTIPLIER = 8.0;
		const trunkHeight = config.trunkHeight ?? 1.5 * SIZE_MULTIPLIER;
		const trunkRadius = config.trunkRadius ?? 0.15 * SIZE_MULTIPLIER;
		const leavesHeight = config.leavesHeight ?? 1.5 * SIZE_MULTIPLIER;
		const leavesRadius = config.leavesRadius ?? 0.8 * SIZE_MULTIPLIER;
		const trunkColor = config.trunkColor ?? 0x8b5a2b; // Warmer brown
		const leavesColor = config.leavesColor ?? 0x2e8b57; // Sea green (vibrant)
		const enablePhysics = config.enablePhysics ?? true;
		const useToonShading = config.useToonShading ?? false;
		const vibrant = config.vibrant ?? false;

		// Create trunk instances
		const trunkInstances: I_InstanceTransform[] = config.positions.map((pos) => ({
			position: [pos.x, pos.y + trunkHeight / 2, pos.z], // Center at half height
			rotation: [0, 0, 0],
			scale: [1, 1, 1],
		}));

		// Create leaves instances (offset on top of trunks)
		const leavesInstances: I_InstanceTransform[] = config.positions.map((pos) => ({
			position: [pos.x, pos.y + trunkHeight + leavesHeight / 2, pos.z], // On top of trunk
			rotation: [0, 0, 0],
			scale: [1, 1, 1],
		}));

		// Choose material component based on toon shading option
		const createTrunkMaterial = () =>
			useToonShading
				? new ToonMaterialComponent({
						color: trunkColor,
						gradientSteps: 3,
						vibrant,
					})
				: new MaterialComponent({
						color: trunkColor,
						roughness: 0.9,
						metalness: 0,
					});

		const createLeavesMaterial = () =>
			useToonShading
				? new ToonMaterialComponent({
						color: leavesColor,
						gradientSteps: 4,
						vibrant,
					})
				: new MaterialComponent({
						color: leavesColor,
						roughness: 0.9,
						metalness: 0,
					});

		// Trunks GameObject
		const trunks = new GameObject({ id: `${id}-trunks` })
			.addComponent(
				new GeometryComponent({
					type: "cylinder",
					params: [trunkRadius, trunkRadius + 0.05, trunkHeight], // Slightly wider at base
				}),
			)
			.addComponent(createTrunkMaterial())
			.addComponent(
				new InstancedMeshComponent({
					instances: trunkInstances,
					castShadow: true,
					receiveShadow: true,
				}),
			);

		// Add physics to trunks
		if (enablePhysics) {
			trunks.addComponent(
				new CollisionComponent({
					type: "static",
					shape: "cylinder",
				}),
			);
		}

		// Leaves GameObject
		const leaves = new GameObject({ id: `${id}-leaves` })
			.addComponent(
				new GeometryComponent({
					type: "cone",
					params: [leavesRadius, leavesHeight, 8], // 8 segments for low-poly look
				}),
			)
			.addComponent(createLeavesMaterial())
			.addComponent(
				new InstancedMeshComponent({
					instances: leavesInstances,
					castShadow: true,
					receiveShadow: true,
				}),
			);

		return [trunks, leaves];
	}
}
