/**
 * AutoTiler - 4-bit bitmask calculation for auto-tiling
 *
 * Analyzes neighboring tiles to determine which tile variant to use,
 * enabling seamless terrain transitions (grass edges, water shores, etc.)
 */

import {
	ALL_NEIGHBORS,
	BITMASK_TO_TILE_OFFSET,
	DEFAULT_TERRAIN_CONFIG,
	type I_BitmaskTileMapping,
	type TerrainType,
} from "../common/autotile.types";

/**
 * Tile data for auto-tiling calculation
 */
export interface I_AutoTileTile {
	terrain: TerrainType;
	height: number;
}

/**
 * AutoTiler class - calculates tile indices based on neighbor analysis
 */
export class AutoTiler {
	private terrainMappings: Record<TerrainType, I_BitmaskTileMapping>;

	constructor(terrainMappings: Record<TerrainType, I_BitmaskTileMapping> = DEFAULT_TERRAIN_CONFIG) {
		this.terrainMappings = terrainMappings;
	}

	/**
	 * Calculate 4-bit bitmask for a tile based on its neighbors
	 *
	 * @param grid - 2D array of tiles [row][col]
	 * @param row - Row index of target tile
	 * @param col - Column index of target tile
	 * @returns Bitmask (0-15) representing neighbor configuration
	 */
	calculateBitmask(grid: I_AutoTileTile[][], row: number, col: number): number {
		const tile = grid[row]?.[col];
		if (!tile) return 0;

		const terrain = tile.terrain;
		let mask = 0;

		for (const neighbor of ALL_NEIGHBORS) {
			const neighborRow = row + neighbor.dz;
			const neighborCol = col + neighbor.dx;
			const neighborTile = grid[neighborRow]?.[neighborCol];

			// If neighbor exists and is same terrain type, set the bit
			if (neighborTile && neighborTile.terrain === terrain) {
				mask |= neighbor.bit;
			}
		}

		return mask;
	}

	/**
	 * Get tile index for a tile based on its bitmask
	 *
	 * @param terrain - Terrain type of the tile
	 * @param bitmask - 4-bit bitmask (0-15)
	 * @returns Tile index in tileset
	 */
	getTileIndex(terrain: TerrainType, bitmask: number): number {
		const mapping = this.terrainMappings[terrain];
		if (!mapping) {
			console.warn(`[AutoTiler] Unknown terrain type: ${terrain}`);
			return 0;
		}

		// Check for override first
		if (mapping.overrides && bitmask in mapping.overrides) {
			return mapping.overrides[bitmask]!;
		}

		// Use standard mapping
		return mapping.baseTileIndex + BITMASK_TO_TILE_OFFSET[bitmask];
	}

	/**
	 * Process entire grid and return tile indices
	 *
	 * @param grid - 2D array of tiles [row][col]
	 * @returns 2D array of tile indices
	 */
	processGrid(grid: I_AutoTileTile[][]): number[][] {
		const result: number[][] = [];

		for (let row = 0; row < grid.length; row++) {
			result[row] = [];
			for (let col = 0; col < grid[row].length; col++) {
				const tile = grid[row][col];
				const bitmask = this.calculateBitmask(grid, row, col);
				result[row][col] = this.getTileIndex(tile.terrain, bitmask);
			}
		}

		return result;
	}

	/**
	 * Process a single tile and return its tile index
	 *
	 * @param grid - 2D array of tiles
	 * @param row - Row index
	 * @param col - Column index
	 * @returns Tile index for the tile
	 */
	processTile(grid: I_AutoTileTile[][], row: number, col: number): number {
		const tile = grid[row]?.[col];
		if (!tile) return 0;

		const bitmask = this.calculateBitmask(grid, row, col);
		return this.getTileIndex(tile.terrain, bitmask);
	}

	/**
	 * Update terrain mappings
	 */
	setTerrainMapping(terrain: TerrainType, mapping: I_BitmaskTileMapping): void {
		this.terrainMappings[terrain] = mapping;
	}

	/**
	 * Get current terrain mappings
	 */
	getTerrainMappings(): Record<TerrainType, I_BitmaskTileMapping> {
		return { ...this.terrainMappings };
	}
}

/**
 * Singleton instance for convenience
 */
let defaultAutoTiler: AutoTiler | null = null;

export function getAutoTiler(): AutoTiler {
	if (!defaultAutoTiler) {
		defaultAutoTiler = new AutoTiler();
	}
	return defaultAutoTiler;
}
