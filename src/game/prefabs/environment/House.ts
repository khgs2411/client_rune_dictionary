import { CollisionComponent } from "@/game/components/physics/CollisionComponent";
import { OcclusionComponent } from "@/game/components/rendering/OcclusionComponent";
import { GameObject } from "../../GameObject";
import { SpriteSheetRegistry } from "../../SpriteSheetRegistry";
import { SpriteGameObject } from "../SpriteGameObject";
import { I_BasePrefabConfig } from "../prefab.types";

export interface I_HousePosition {
	x: number;
	y: number;
	z: number;
	scale?: number; // Scale multiplier for sprite size
	/** Optional spriteSheetId override for this house */
	spriteSheetId?: string;
	/** Optional size override [width, height] */
	size?: [number, number];
}

export interface I_HouseConfig extends I_BasePrefabConfig {
	/** Single house position (legacy API) */
	position?: [number, number, number];
	/** Multiple house positions (new API) */
	positions?: I_HousePosition[];
	/** Default spriteSheetId for all houses (can be overridden per-position) */
	spriteSheetId?: string;
	/** Base size [width, height] before scaling (uses registry default if not specified) */
	size?: [number, number];
	/** Cycle through available house variants */
	cycleTextures?: boolean;
	/** Scale multiplier (legacy API, for single house) */
	scale?: number;
	/** Enable collision (default: true) */
	enableCollision?: boolean;
}

/** Available house sprite sheet IDs (registered in SpriteSheetRegistry) */
const HOUSE_SPRITE_IDS = ["house-00", "shop-01"];

/**
 * House Helper - Creates sprite billboard house GameObjects
 *
 * Returns an array of GameObjects, one per house position.
 * Each house is a billboard sprite that faces the camera.
 *
 * Usage:
 * ```typescript
 * // New API - multiple houses
 * const houses = House.create({
 *   id: "town-houses",
 *   positions: [
 *     { x: 30, y: 0, z: 0 },
 *     { x: 45, y: 0, z: -10, scale: 1.2 },
 *   ],
 *   cycleTextures: true,
 * });
 * houses.forEach(house => gom.register(house));
 *
 * // Legacy API - single house (returns array with one element)
 * const [house] = House.create({
 *   id: "single-house",
 *   position: [10, 0, 10],
 * });
 * gom.register(house);
 * ```
 */
export class House {
	/**
	 * Create house GameObjects from positions
	 * Returns GameObject[] - one per house
	 */
	static create(config: I_HouseConfig = {}): GameObject[] {
		const id = config.id ?? "house";
		const defaultSpriteId = config.spriteSheetId ?? HOUSE_SPRITE_IDS[0];
		const cycleTextures = config.cycleTextures ?? false;
		const enableCollision = config.enableCollision ?? true;

		// Get base size from config or registry
		const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();
		const registryConfig = registry.getSpriteConfig(defaultSpriteId);
		const baseSize = config.size ?? registryConfig?.size ?? [6, 5];

		// Support both new positions[] API and legacy position API
		let positions: I_HousePosition[];
		if (config.positions && config.positions.length > 0) {
			positions = config.positions;
		} else if (config.position) {
			// Legacy single-house API
			positions = [
				{
					x: config.position[0],
					y: config.position[1],
					z: config.position[2],
					scale: config.scale,
				},
			];
		} else {
			// Default to origin
			positions = [{ x: 0, y: 0, z: 0 }];
		}

		return positions.map((pos, index) => {
			// Determine spriteSheetId for this house
			let spriteSheetId = pos.spriteSheetId ?? defaultSpriteId;
			if (cycleTextures && !pos.spriteSheetId) {
				spriteSheetId = HOUSE_SPRITE_IDS[index % HOUSE_SPRITE_IDS.length];
			}

			// Apply scale to size (pos.size overrides scaling)
			const scale = pos.scale ?? 1;
			const size: [number, number] | undefined = pos.size ?? (scale !== 1 ? [baseSize[0] * scale, baseSize[1] * scale] : undefined);

			// Calculate actual size for collision
			const actualSize = size ?? baseSize;
			const collisionWidth = actualSize[0]; // Slightly narrower than visual
			const collisionHeight = actualSize[1];
			const collisionDepth = 2; // Depth for the building

			// Create sprite house with billboard and occlusion
			const house = new SpriteGameObject({
				id: `${id}-${index}`,
				position: [pos.x, pos.y, pos.z],
				spriteSheetId,
				size, // Only override if pos.size or scaled
				billboardMode: "spherical",
			}).addComponent(new OcclusionComponent());

			// Add collision if enabled
			// Cuboid collision - physics body is world-aligned (no rotation needed)
			if (enableCollision) {
				house.addComponent(
					new CollisionComponent({
						type: "static",
						shape: {
							type: "cuboid",
							width: collisionWidth,
							height: collisionHeight,
							depth: collisionDepth,
							offset: [0, collisionHeight / 2, 0], // Center vertically
						},
						debugShape: true, // Use our debug mesh (world-aligned), not physics engine's
					}),
				);
			}

			return house;
		});
	}
}
