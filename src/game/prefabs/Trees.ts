import { OcclusionComponent } from "../components/rendering/OcclusionComponent";
import { GameObject } from "../GameObject";
import { SpriteGameObject } from "./SpriteGameObject";
import { I_BasePrefabConfig } from "./prefab.types";

export interface I_TreePosition {
	x: number;
	y: number;
	z: number;
	/** Optional spriteSheetId override for this tree */
	spriteSheetId?: string;
	/** Optional size override [width, height] */
	size?: [number, number];
}

export interface I_TreesConfig extends I_BasePrefabConfig {
	positions: I_TreePosition[];
	/** Default spriteSheetId for all trees (can be overridden per-position) */
	spriteSheetId?: string;
	/** Default size [width, height] override (registry default: [4, 5]) */
	size?: [number, number];
	/** Cycle through available tree variants (tree-00 through tree-03) */
	cycleTextures?: boolean;
}

/** Available tree sprite sheet IDs (registered in SpriteSheetRegistry) */
const TREE_SPRITE_IDS = ["tree-00", "tree-01", "tree-02", "tree-03"];

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
		const defaultSpriteId = config.spriteSheetId ?? TREE_SPRITE_IDS[0];
		const cycleTextures = config.cycleTextures ?? false;

		return config.positions.map((pos, index) => {
			// Determine spriteSheetId for this tree
			let spriteSheetId = pos.spriteSheetId ?? defaultSpriteId;
			if (cycleTextures && !pos.spriteSheetId) {
				spriteSheetId = TREE_SPRITE_IDS[index % TREE_SPRITE_IDS.length];
			}

			// Create sprite tree with billboard and occlusion
			const tree = new SpriteGameObject({
				id: `${id}-${index}`,
				position: [pos.x, pos.y, pos.z],
				spriteSheetId,
				size: pos.size ?? config.size, // Optional size override
				billboardMode: "cylindrical",
			}).addComponent(new OcclusionComponent());

			return tree;
		});
	}
}
