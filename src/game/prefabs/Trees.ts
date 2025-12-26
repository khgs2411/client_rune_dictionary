import { OcclusionComponent } from "../components/rendering/OcclusionComponent";
import { GameObject } from "../GameObject";
import { SpriteCharacter } from "./SpriteCharacter";
import { I_BasePrefabConfig } from "./prefab.types";

export interface I_TreePosition {
	x: number;
	y: number;
	z: number;
	/** Optional texture override for this tree */
	texture?: string;
	/** Optional size override [width, height] */
	size?: [number, number];
}

export interface I_TreesConfig extends I_BasePrefabConfig {
	positions: I_TreePosition[];
	/** Default texture for all trees (can be overridden per-position) */
	texture?: string;
	/** Default size [width, height] for all trees (default: [4, 5]) */
	size?: [number, number];
	/** Cycle through available tree textures (tree_00 through tree_03) */
	cycleTextures?: boolean;
}

/** Available tree texture variants */
const TREE_TEXTURES = [
	"/sprites/tree_00.png",
	"/sprites/tree_01.png",
	"/sprites/tree_02.png",
	"/sprites/tree_03.png",
];

/**
 * Trees Helper - Creates sprite billboard tree GameObjects
 *
 * Returns an array of GameObjects, one per tree position.
 * Each tree is a billboard sprite that faces the camera.
 *
 * Usage:
 * ```typescript
 * const trees = Trees.create({
 *   id: "forest",
 *   positions: [
 *     { x: 10, y: 0, z: 0 },
 *     { x: 12, y: 0, z: 2 },
 *     { x: 14, y: 0, z: -1 }
 *   ],
 *   cycleTextures: true, // Use different tree variants
 * });
 *
 * trees.forEach(tree => gom.register(tree));
 * ```
 */
export class Trees {
	/**
	 * Create tree GameObjects from positions
	 * Returns GameObject[] - one per tree
	 */
	static create(config: I_TreesConfig): GameObject[] {
		const id = config.id ?? "trees";
		const defaultTexture = config.texture ?? TREE_TEXTURES[0];
		const defaultSize = config.size ?? [4, 5];
		const cycleTextures = config.cycleTextures ?? false;

		return config.positions.map((pos, index) => {
			// Determine texture for this tree
			let texture = pos.texture ?? defaultTexture;
			if (cycleTextures && !pos.texture) {
				texture = TREE_TEXTURES[index % TREE_TEXTURES.length];
			}

			// Determine size for this tree
			const size = pos.size ?? defaultSize;

			// Create sprite tree with billboard and occlusion
			const tree = new SpriteCharacter({
				id: `${id}-${index}`,
				position: [pos.x, pos.y, pos.z],
				texture,
				size,
				billboardMode: "cylindrical",
			}).addComponent(new OcclusionComponent());

			return tree;
		});
	}
}
