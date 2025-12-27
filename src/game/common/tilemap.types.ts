/**
 * Core types for the Tiled Ground System
 *
 * This module defines interfaces for tile data, chunks, and configuration.
 * Designed to support:
 * - Large maps (256+ tiles) with chunking
 * - Height variation for platforming
 * - 3D collision volumes (walk under platforms)
 * - Future multi-layer support
 */

/**
 * Individual tile data within a chunk
 */
export interface I_TileData {
	/** Tile index in the tileset atlas (0-based) */
	tileIndex: number;
	/** Height/elevation of this tile in world units */
	height: number;
	/** Collision type for physics */
	collisionType: "walkable" | "blocked" | "trigger";
}

/**
 * Chunk data containing a grid of tiles
 */
export interface I_ChunkData {
	/** Chunk X coordinate in chunk space (not world space) */
	chunkX: number;
	/** Chunk Z coordinate in chunk space (not world space) */
	chunkZ: number;
	/** 2D array of tile data [row][column], size is chunkSize x chunkSize */
	tiles: I_TileData[][];
}

/**
 * Configuration for the tile map system
 */
export interface I_TileMapConfig {
	/** World units per tile (default: 1) */
	tileSize: number;
	/** Number of tiles per chunk dimension (default: 32) */
	chunkSize: number;
	/** Optional tileset configuration */
	tileset?: I_TilesetConfig;
}

/**
 * Tileset atlas configuration
 */
export interface I_TilesetConfig {
	/** Path to the tileset atlas texture */
	texturePath: string;
	/** Size of each tile in the atlas in pixels (e.g., 32 for 32x32) */
	tilePixelSize: number;
	/** Total number of tile columns in the full atlas */
	atlasColumns: number;
	/** Total number of tile rows in the full atlas */
	atlasRows: number;
	/** Starting column for our tile group (0-indexed) */
	startColumn: number;
	/** Starting row for our tile group (0-indexed) */
	startRow: number;
	/** Number of tile columns in our group (default: 4 for auto-tile) */
	groupColumns?: number;
	/** Number of tile rows in our group (default: 4 for auto-tile) */
	groupRows?: number;
}

/**
 * Configuration for TileChunk prefab
 */
export interface I_TileChunkConfig {
	/** Chunk X coordinate in chunk space */
	chunkX: number;
	/** Chunk Z coordinate in chunk space */
	chunkZ: number;
	/** Layer identifier for multi-layer support (default: 'ground') */
	layer?: string;
	/** World units per tile (default: 1) */
	tileSize?: number;
	/** Tiles per chunk dimension (default: 32) */
	chunkSize?: number;
	/** Optional initial tile data - if not provided, generates flat grass */
	tileData?: I_TileData[][];
	/** Whether to show debug wireframe (default: false) */
	debug?: boolean;
	/** Tileset configuration - if provided, renders with tileset shader */
	tileset?: I_TilesetConfig;
}

/**
 * 3D collision volume for elevated tiles
 * Supports walking under platforms at different elevations
 */
export interface I_TileCollision {
	/** World X position of collision center */
	x: number;
	/** World Z position of collision center */
	z: number;
	/** Bottom Y of the collision volume (elevation) */
	y: number;
	/** Thickness of the collision volume in Y */
	height: number;
	/** X extent after merging adjacent tiles */
	width: number;
	/** Z extent after merging adjacent tiles */
	depth: number;
}

/**
 * Default configuration values
 */
export const TILEMAP_DEFAULTS = {
	TILE_SIZE: 1,
	CHUNK_SIZE: 32,
	DEFAULT_LAYER: "ground",
	DEFAULT_HEIGHT: 0,
	DEFAULT_COLLISION: "walkable" as const,
} as const;

/**
 * Helper to create default tile data
 */
export function createDefaultTileData(tileIndex = 0, height = 0): I_TileData {
	return {
		tileIndex,
		height,
		collisionType: TILEMAP_DEFAULTS.DEFAULT_COLLISION,
	};
}

/**
 * Helper to create a chunk filled with default tiles
 */
export function createEmptyChunkData(
	chunkX: number,
	chunkZ: number,
	chunkSize = TILEMAP_DEFAULTS.CHUNK_SIZE,
	defaultTileIndex = 0,
): I_ChunkData {
	const tiles: I_TileData[][] = [];
	for (let row = 0; row < chunkSize; row++) {
		tiles[row] = [];
		for (let col = 0; col < chunkSize; col++) {
			tiles[row][col] = createDefaultTileData(defaultTileIndex, 0);
		}
	}
	return { chunkX, chunkZ, tiles };
}
