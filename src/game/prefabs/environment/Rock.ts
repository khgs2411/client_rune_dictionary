import { OcclusionComponent } from "../../components/rendering/OcclusionComponent";
import { GameObject } from "../../GameObject";
import { SpriteSheetRegistry } from "../../SpriteSheetRegistry";
import { SpriteGameObject } from "../SpriteGameObject";
import { I_BasePrefabConfig } from "../prefab.types";

export interface I_RockPosition {
	x: number;
	y: number;
	z: number;
	scale?: number; // Scale multiplier for sprite size
	/** Optional spriteSheetId override for this rock */
	spriteSheetId?: string;
}

export interface I_RocksConfig extends I_BasePrefabConfig {
	positions: I_RockPosition[];
	/** Default spriteSheetId for all rocks (can be overridden per-position) */
	spriteSheetId?: string;
	/** Base size [width, height] before scaling (uses registry default if not specified) */
	size?: [number, number];
	/** Cycle through available rock variants */
	cycleTextures?: boolean;
}

/** Available rock sprite sheet IDs (registered in SpriteSheetRegistry) */
const ROCK_SPRITE_IDS = ["rock-00", "rock-01", "rock-02"];

/**
 * Rocks Helper - Creates sprite billboard rock GameObjects
 *
 * Returns an array of GameObjects, one per rock position.
 * Each rock is a billboard sprite that faces the camera.
 *
 * Usage:
 * ```typescript
 * const rocks = Rocks.create({
 *   id: "rocks",
 *   positions: [
 *     { x: 5, y: 0, z: 5 },
 *     { x: 7, y: 0, z: 3, scale: 1.5 },
 *     { x: 6, y: 0, z: 8, scale: 0.7 }
 *   ],
 *   cycleTextures: true,
 * });
 *
 * rocks.forEach(rock => gom.register(rock));
 * ```
 */
export class Rocks {
	/**
	 * Create rock GameObjects from positions
	 * Returns GameObject[] - one per rock
	 */
	static create(config: I_RocksConfig): GameObject[] {
		const id = config.id ?? "rocks";
		const defaultSpriteId = config.spriteSheetId ?? ROCK_SPRITE_IDS[0];
		const cycleTextures = config.cycleTextures ?? false;

		// Get base size from config or registry
		const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();
		const registryConfig = registry.getSpriteConfig(defaultSpriteId);
		const baseSize = config.size ?? registryConfig?.size ?? [2, 1.5];

		return config.positions.map((pos, index) => {
			// Determine spriteSheetId for this rock
			const defaultSpriteId = config.spriteSheetId ?? ROCK_SPRITE_IDS[Math.floor(Math.random() * ROCK_SPRITE_IDS.length)];
			let spriteSheetId = pos.spriteSheetId ?? defaultSpriteId;
			if (cycleTextures && !pos.spriteSheetId) {
				spriteSheetId = ROCK_SPRITE_IDS[index % ROCK_SPRITE_IDS.length];
			}

			// Apply scale to size
			const scale = pos.scale ?? 1;
			const size: [number, number] = scale !== 1 ? [baseSize[0] * scale, baseSize[1] * scale] : undefined!;

			// Create sprite rock with billboard and occlusion
			const rock = new SpriteGameObject({
				id: `${id}-${index}`,
				position: [pos.x, pos.y, pos.z],
				spriteSheetId,
				size: scale !== 1 ? size : undefined, // Only override if scaled
				billboardMode: "cylindrical",
			}).addComponent(new OcclusionComponent());

			return rock;
		});
	}
}
