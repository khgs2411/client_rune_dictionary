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
 * Returns null to hide the tile (scale to zero in InstancedMesh)
 */
export type TileSelectorFn = (x: number, y: number, context: TileSelectorContext) => TileSelection | null;

// ============================================================================
// TILE RULESET TYPES
// ============================================================================

/** Neighbor condition: true=filled, false=empty, null=don't care */
export type NeighborCondition = boolean | null;

/** Neighbor conditions for rule matching */
export interface I_TileRuleNeighbors {
	north?: NeighborCondition;
	south?: NeighborCondition;
	east?: NeighborCondition;
	west?: NeighborCondition;
	// Diagonals (only checked if useDiagonals: true)
	northEast?: NeighborCondition;
	northWest?: NeighborCondition;
	southEast?: NeighborCondition;
	southWest?: NeighborCondition;
}

/** Relative tile position within tileset bounds */
export interface I_RelativeTilePosition {
	/** Row index (1-indexed relative to bounds start) */
	row: number;
	/** Column index (1-indexed relative to bounds start) */
	column: number;
}

/**
 * Rule for matching neighbor patterns
 */
export interface I_TileRule {
	/** Neighbor conditions (null = any, true = filled, false = empty) */
	neighbors: I_TileRuleNeighbors;
	/** Tiles are 1-indexed relative to bounds (1,1 = top-left of tileset region) */
	tiles: I_RelativeTilePosition[];
}

/** Tileset region bounds in the atlas */
export interface I_TilesetBounds {
	/** Starting row (1-indexed, inclusive) */
	startRow: number;
	/** Ending row (1-indexed, inclusive) */
	endRow: number;
	/** Starting column (1-indexed, inclusive) */
	startColumn: number;
	/** Ending column (1-indexed, inclusive) */
	endColumn: number;
}

/**
 * Configuration for a TileRuleset
 */
export interface I_TileRulesetConfig {
	/** Tileset region bounds in the atlas (1-indexed, inclusive) */
	bounds: I_TilesetBounds;
	/** Rules in priority order (first match wins) */
	rules: I_TileRule[];
	/** Default tile if no rules match (1-indexed relative to bounds) */
	defaultTile?: I_RelativeTilePosition;
	/** Tile for cells where fillFn returns false, or null to hide */
	emptyTile?: I_RelativeTilePosition | null;
	/** Enable diagonal neighbor checks (default: false) */
	useDiagonals?: boolean;
}

/** Function to determine if a cell is "filled" */
export type FillFunction = (x: number, y: number) => boolean;

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
