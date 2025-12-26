import { OcclusionComponent } from "@/game/components/rendering/OcclusionComponent";
import { GameObject } from "../../GameObject";
import { SpriteCharacter } from "../SpriteCharacter";
import { I_BasePrefabConfig } from "../prefab.types";

export interface I_HousePosition {
	x: number;
	y: number;
	z: number;
	scale?: number; // Scale multiplier for sprite size
	/** Optional texture override for this house */
	texture?: string;
	/** Optional size override [width, height] */
	size?: [number, number];
}

export interface I_HouseConfig extends I_BasePrefabConfig {
	/** Single house position (legacy API) */
	position?: [number, number, number];
	/** Multiple house positions (new API) */
	positions?: I_HousePosition[];
	/** Default texture for all houses (can be overridden per-position) */
	texture?: string;
	/** Default size [width, height] for all houses (default: [6, 5]) */
	size?: [number, number];
	/** Cycle through available house textures */
	cycleTextures?: boolean;
	/** Scale multiplier (legacy API, for single house) */
	scale?: number;
}

/** Available house texture variants */
const HOUSE_TEXTURES = ["/sprites/house_00.png", "/sprites/shop_01.png"];

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
		const defaultTexture = config.texture ?? HOUSE_TEXTURES[0];
		const defaultSize = config.size ?? [6, 5];
		const cycleTextures = config.cycleTextures ?? false;

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
			// Determine texture for this house
			let texture = pos.texture ?? defaultTexture;
			if (cycleTextures && !pos.texture) {
				texture = HOUSE_TEXTURES[index % HOUSE_TEXTURES.length];
			}

			// Apply scale to size
			const scale = pos.scale ?? 1;
			const size: [number, number] = pos.size ?? [defaultSize[0] * scale, defaultSize[1] * scale];

			// Create sprite house with billboard and occlusion
			const house = new SpriteCharacter({
				id: `${id}-${index}`,
				position: [pos.x, pos.y, pos.z],
				texture,
				size,
				billboardMode: "cylindrical",
			}).addComponent(new OcclusionComponent());

			return house;
		});
	}
}
