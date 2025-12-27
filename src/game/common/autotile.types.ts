/**
 * Auto-tiling types and bitmask definitions
 *
 * Uses 4-bit bitmasking for cardinal neighbors (N/E/S/W).
 * Each bit represents whether the neighboring tile is the same terrain type.
 *
 * Bitmask layout:
 *   N = 1 (bit 0)
 *   E = 2 (bit 1)
 *   S = 4 (bit 2)
 *   W = 8 (bit 3)
 *
 * This gives 16 possible combinations (0-15), each mapping to a tile variant.
 */

/**
 * Cardinal direction bits for bitmask calculation
 */
export const DIRECTION_BIT = {
	NORTH: 1, // bit 0
	EAST: 2, // bit 1
	SOUTH: 4, // bit 2
	WEST: 8, // bit 3
} as const;

/**
 * Terrain type identifiers
 */
export type TerrainType = "grass" | "dirt" | "water" | "stone" | "sand";

/**
 * Bitmask tile mapping - maps 4-bit bitmask (0-15) to tile index in tileset
 *
 * Visual representation of each bitmask:
 *
 *  0 = Isolated (no neighbors)         8 = W only
 *  1 = N only                          9 = N + W (corner)
 *  2 = E only                         10 = E + W (horizontal)
 *  3 = N + E (corner)                 11 = N + E + W (T-junction)
 *  4 = S only                         12 = S + W (corner)
 *  5 = N + S (vertical)               13 = N + S + W (T-junction)
 *  6 = E + S (corner)                 14 = E + S + W (T-junction)
 *  7 = N + E + S (T-junction)         15 = All neighbors (center)
 */
export interface I_BitmaskTileMapping {
	/** Terrain type this mapping applies to */
	terrain: TerrainType;
	/** Base tile index in tileset for this terrain (bitmask 0 = isolated) */
	baseTileIndex: number;
	/** Optional per-bitmask overrides (if tileset layout differs from standard) */
	overrides?: Partial<Record<number, number>>;
}

/**
 * Standard bitmask to tile offset mapping
 * Assumes tileset has 16 consecutive tiles per terrain type
 *
 * Usage: actualTileIndex = baseTileIndex + BITMASK_TO_TILE_OFFSET[bitmask]
 */
export const BITMASK_TO_TILE_OFFSET: Record<number, number> = {
	0: 0, // Isolated
	1: 1, // N
	2: 2, // E
	3: 3, // N + E
	4: 4, // S
	5: 5, // N + S
	6: 6, // E + S
	7: 7, // N + E + S
	8: 8, // W
	9: 9, // N + W
	10: 10, // E + W
	11: 11, // N + E + W
	12: 12, // S + W
	13: 13, // N + S + W
	14: 14, // E + S + W
	15: 15, // All (center)
};

/**
 * Default terrain configuration
 * Maps terrain types to their base tile indices in the tileset
 */
export const DEFAULT_TERRAIN_CONFIG: Record<TerrainType, I_BitmaskTileMapping> = {
	grass: { terrain: "grass", baseTileIndex: 0 },
	dirt: { terrain: "dirt", baseTileIndex: 16 },
	water: { terrain: "water", baseTileIndex: 32 },
	stone: { terrain: "stone", baseTileIndex: 48 },
	sand: { terrain: "sand", baseTileIndex: 64 },
};

/**
 * Auto-tile configuration for procedural generation
 */
export interface I_AutoTileConfig {
	/** Terrain type mappings */
	terrainMappings: Record<TerrainType, I_BitmaskTileMapping>;
	/** Default terrain for empty/unset tiles */
	defaultTerrain: TerrainType;
}

/**
 * Neighbor offset directions for bitmask calculation
 */
export const NEIGHBOR_OFFSETS = {
	NORTH: { dx: 0, dz: -1, bit: DIRECTION_BIT.NORTH },
	EAST: { dx: 1, dz: 0, bit: DIRECTION_BIT.EAST },
	SOUTH: { dx: 0, dz: 1, bit: DIRECTION_BIT.SOUTH },
	WEST: { dx: -1, dz: 0, bit: DIRECTION_BIT.WEST },
} as const;

/**
 * All neighbor offsets as array for iteration
 */
export const ALL_NEIGHBORS = Object.values(NEIGHBOR_OFFSETS);
