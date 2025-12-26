import { OcclusionComponent } from "../../components/rendering/OcclusionComponent";
import { GameObject } from "../../GameObject";
import { SpriteGameObject } from "../SpriteGameObject";
import { I_BasePrefabConfig } from "../prefab.types";

export interface I_RockPosition {
	x: number;
	y: number;
	z: number;
	scale?: number; // Scale multiplier for sprite size
	/** Optional texture override for this rock */
	texture?: string;
}

export interface I_RocksConfig extends I_BasePrefabConfig {
	positions: I_RockPosition[];
	/** Default texture for all rocks (can be overridden per-position) */
	texture?: string;
	/** Default size [width, height] for all rocks (default: [2, 1.5]) */
	size?: [number, number];
	/** Cycle through available rock textures */
	cycleTextures?: boolean;
}

/** Available rock texture variants */
const ROCK_TEXTURES = ["/sprites/rock_00.png", "/sprites/rock_01.png", "/sprites/rock_02.png"];

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
		const defaultTexture = config.texture ?? ROCK_TEXTURES[0];
		const defaultSize = config.size ?? [2, 1.5];
		const cycleTextures = config.cycleTextures ?? false;

		return config.positions.map((pos, index) => {
			// Determine texture for this rock
			let texture = pos.texture ?? defaultTexture;
			if (cycleTextures && !pos.texture) {
				texture = ROCK_TEXTURES[index % ROCK_TEXTURES.length];
			}

			// Apply scale to size
			const scale = pos.scale ?? 1;
			const size: [number, number] = [defaultSize[0] * scale, defaultSize[1] * scale];

			// Create sprite rock with billboard and occlusion
			const rock = new SpriteGameObject({
				id: `${id}-${index}`,
				position: [pos.x, pos.y, pos.z],
				texture,
				size,
				billboardMode: "cylindrical",
			}).addComponent(new OcclusionComponent());

			return rock;
		});
	}
}
