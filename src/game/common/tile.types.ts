// ============================================================================
// TILE GRID TYPES
// ============================================================================

/**
 * Tile selection result - which tile from the sprite sheet to render
 */
export interface TileSelection {
	/** Row index (1-indexed) in sprite sheet */
	row: number;
	/** Column index (1-indexed) in sprite sheet */
	column: number;
	/** Optional rotation in degrees */
	rotation?: 0 | 90 | 180 | 270;
	/** Optional horizontal flip */
	flipX?: boolean;
}

/**
 * Context passed to tile selector function
 */
export interface TileSelectorContext {
	/** Total grid width in tiles */
	gridWidth: number;
	/** Total grid height in tiles */
	gridHeight: number;
	/** Neighbor information for auto-tiling (future) */
	neighbors?: NeighborInfo;
}

/**
 * Neighbor information for auto-tiling rules (future use)
 */
export interface NeighborInfo {
	north?: boolean;
	south?: boolean;
	east?: boolean;
	west?: boolean;
	northEast?: boolean;
	northWest?: boolean;
	southEast?: boolean;
	southWest?: boolean;
}

/**
 * Function type for selecting tiles at each grid position
 */
export type TileSelectorFn = (x: number, y: number, context: TileSelectorContext) => TileSelection;

// ============================================================================
// TILE GRID COMPONENT CONFIG
// ============================================================================

/**
 * Configuration for TileGridComponent
 *
 * @example Fixed tile
 * ```typescript
 * {
 *   tilesetId: "grass-tileset",
 *   size: [10, 10],
 *   defaultTile: { row: 1, column: 1 },
 * }
 * ```
 *
 * @example Random tiles
 * ```typescript
 * {
 *   tilesetId: "grass-tileset",
 *   gridWidth: 10,
 *   gridHeight: 10,
 *   tileSelector: (x, y) => ({
 *     row: 1,
 *     column: Math.floor(Math.random() * 4) + 1,
 *   }),
 * }
 * ```
 */
export interface I_TileGridConfig {
	// === Tileset Source ===

	/** Sprite sheet ID from registry containing tile textures */
	tilesetId: string;

	// === Grid Dimensions (choose one approach) ===

	/** Option 1: Explicit grid width in tiles */
	gridWidth?: number;
	/** Option 1: Explicit grid height in tiles */
	gridHeight?: number;

	/** Option 2: World size [width, height] - grid calculated as size/tileSize */
	size?: [number, number];

	/** Size of each tile in world units (default: 1) */
	tileSize?: number;

	// === Tile Selection ===

	/**
	 * Function to select which tile to render at each position.
	 * Called once per tile during initialization.
	 * Future: TileRuleset will provide this function.
	 */
	tileSelector?: TileSelectorFn;

	/** Default tile to use if no selector provided */
	defaultTile?: TileSelection;

	// === Rendering Options ===

	/** Y offset to prevent z-fighting (default: 0.01) */
	yOffset?: number;

	/** Render order for depth sorting - lower values render first/behind (default: 0) */
	renderOrder?: number;
}
