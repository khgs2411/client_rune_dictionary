import type {
	FillFunction,
	I_RelativeTilePosition,
	I_TileRule,
	I_TileRulesetConfig,
	I_TilesetBounds,
	NeighborInfo,
	TileSelection,
	TileSelectorContext,
	TileSelectorFn,
} from "@/game/common/tile.types";

/**
 * TileRuleset - Rule-based auto-tiling system
 *
 * Creates tile selection functions based on neighbor patterns,
 * similar to Unity's Rule Tiles.
 *
 * @example Factory method (standard 4-bit blob)
 * ```typescript
 * const ruleset = TileRuleset.createBlobRuleset({
 *   startRow: 1, endRow: 4,
 *   startColumn: 9, endColumn: 12,
 * });
 * ```
 *
 * @example Custom rules
 * ```typescript
 * const ruleset = new TileRuleset({
 *   bounds: { startRow: 1, endRow: 4, startColumn: 9, endColumn: 12 },
 *   rules: [
 *     { neighbors: { north: false, south: true }, tiles: [{ row: 1, column: 1 }] },
 *   ],
 *   defaultTile: { row: 2, column: 2 },
 * });
 * ```
 */
export class TileRuleset {
	private config: Required<Omit<I_TileRulesetConfig, "defaultTile" | "emptyTile">> & {
		defaultTile: I_RelativeTilePosition;
		emptyTile: I_RelativeTilePosition | null;
	};

	constructor(config: I_TileRulesetConfig) {
		// Calculate center tile as default
		const rows = config.bounds.endRow - config.bounds.startRow + 1;
		const cols = config.bounds.endColumn - config.bounds.startColumn + 1;
		const centerTile: I_RelativeTilePosition = {
			row: Math.ceil(rows / 2),
			column: Math.ceil(cols / 2),
		};

		this.config = {
			bounds: config.bounds,
			rules: config.rules,
			defaultTile: config.defaultTile ?? centerTile,
			emptyTile: config.emptyTile === undefined ? null : config.emptyTile,
			useDiagonals: config.useDiagonals ?? false,
		};
	}

	/**
	 * Create a TileSelectorFn for use with TileGridComponent
	 * @param fillFn Optional function to determine filled cells. Defaults to grid bounds.
	 */
	createSelector(fillFn?: FillFunction): TileSelectorFn {
		return (x: number, y: number, context: TileSelectorContext): TileSelection | null => {
			// Default fill function: entire grid is filled
			const fill: FillFunction =
				fillFn ?? ((px, py) => px >= 0 && px < context.gridWidth && py >= 0 && py < context.gridHeight);

			// Check if current cell is filled
			if (!fill(x, y)) {
				// Return emptyTile or null to hide
				return this.config.emptyTile ? this.toAbsolutePosition(this.config.emptyTile) : null;
			}

			// Get neighbor states
			const neighbors = this.getNeighbors(x, y, fill);

			// Match rules in priority order
			for (const rule of this.config.rules) {
				if (this.matchesRule(rule, neighbors)) {
					if (rule.tiles.length === 0) continue;

					// Pick tile deterministically based on position
					const index = this.seededRandom(x, y, rule.tiles.length);
					return this.toAbsolutePosition(rule.tiles[index]);
				}
			}

			// No rule matched, use default
			return this.toAbsolutePosition(this.config.defaultTile);
		};
	}

	/**
	 * Factory: Create standard 4-bit blob tileset (16 tiles in 4x4 layout)
	 *
	 * Layout follows standard blob pattern where each tile's position
	 * corresponds to its neighbor bitmask (N=1, E=2, S=4, W=8).
	 */
	static createBlobRuleset(bounds: I_TilesetBounds): TileRuleset {
		// Standard 4-bit blob layout maps bitmask to 4x4 position
		// Row 1: isolated, E, EW, W
		// Row 2: S, SE, SEW, SW
		// Row 3: NS, NSE, all, NSW
		// Row 4: N, NE, NEW, NW
		const rules: I_TileRule[] = [
			// Row 1: no north neighbors
			{ neighbors: { north: false, east: false, south: false, west: false }, tiles: [{ row: 1, column: 1 }] }, // isolated
			{ neighbors: { north: false, east: true, south: false, west: false }, tiles: [{ row: 1, column: 2 }] }, // E only
			{ neighbors: { north: false, east: true, south: false, west: true }, tiles: [{ row: 1, column: 3 }] }, // E+W
			{ neighbors: { north: false, east: false, south: false, west: true }, tiles: [{ row: 1, column: 4 }] }, // W only

			// Row 2: south neighbor, no north
			{ neighbors: { north: false, east: false, south: true, west: false }, tiles: [{ row: 2, column: 1 }] }, // S only
			{ neighbors: { north: false, east: true, south: true, west: false }, tiles: [{ row: 2, column: 2 }] }, // S+E
			{ neighbors: { north: false, east: true, south: true, west: true }, tiles: [{ row: 2, column: 3 }] }, // S+E+W
			{ neighbors: { north: false, east: false, south: true, west: true }, tiles: [{ row: 2, column: 4 }] }, // S+W

			// Row 3: north+south neighbors
			{ neighbors: { north: true, east: false, south: true, west: false }, tiles: [{ row: 3, column: 1 }] }, // N+S
			{ neighbors: { north: true, east: true, south: true, west: false }, tiles: [{ row: 3, column: 2 }] }, // N+S+E
			{ neighbors: { north: true, east: true, south: true, west: true }, tiles: [{ row: 3, column: 3 }] }, // all
			{ neighbors: { north: true, east: false, south: true, west: true }, tiles: [{ row: 3, column: 4 }] }, // N+S+W

			// Row 4: north neighbor, no south
			{ neighbors: { north: true, east: false, south: false, west: false }, tiles: [{ row: 4, column: 1 }] }, // N only
			{ neighbors: { north: true, east: true, south: false, west: false }, tiles: [{ row: 4, column: 2 }] }, // N+E
			{ neighbors: { north: true, east: true, south: false, west: true }, tiles: [{ row: 4, column: 3 }] }, // N+E+W
			{ neighbors: { north: true, east: false, south: false, west: true }, tiles: [{ row: 4, column: 4 }] }, // N+W
		];

		return new TileRuleset({
			bounds,
			rules,
			defaultTile: { row: 3, column: 3 }, // Center/all tile
			emptyTile: null,
			useDiagonals: false,
		});
	}

	/**
	 * Convert relative position (within tileset bounds) to absolute atlas position
	 */
	private toAbsolutePosition(relative: I_RelativeTilePosition): TileSelection {
		return {
			row: this.config.bounds.startRow + relative.row - 1,
			column: this.config.bounds.startColumn + relative.column - 1,
		};
	}

	/**
	 * Check if neighbors match a rule's conditions
	 */
	private matchesRule(rule: I_TileRule, neighbors: NeighborInfo): boolean {
		const { neighbors: conditions } = rule;

		// Check cardinal directions
		if (!this.matchesCondition(conditions.north, neighbors.north)) return false;
		if (!this.matchesCondition(conditions.south, neighbors.south)) return false;
		if (!this.matchesCondition(conditions.east, neighbors.east)) return false;
		if (!this.matchesCondition(conditions.west, neighbors.west)) return false;

		// Check diagonals only if enabled
		if (this.config.useDiagonals) {
			if (!this.matchesCondition(conditions.northEast, neighbors.northEast)) return false;
			if (!this.matchesCondition(conditions.northWest, neighbors.northWest)) return false;
			if (!this.matchesCondition(conditions.southEast, neighbors.southEast)) return false;
			if (!this.matchesCondition(conditions.southWest, neighbors.southWest)) return false;
		}

		return true;
	}

	/**
	 * Check if a single condition matches the actual value
	 * null/undefined condition = wildcard (matches any)
	 */
	private matchesCondition(condition: boolean | null | undefined, actual: boolean | undefined): boolean {
		if (condition === null || condition === undefined) return true; // Wildcard
		return condition === (actual ?? false);
	}

	/**
	 * Get neighbor fill states for a position
	 */
	private getNeighbors(x: number, y: number, fillFn: FillFunction): NeighborInfo {
		return {
			north: fillFn(x, y - 1),
			south: fillFn(x, y + 1),
			east: fillFn(x + 1, y),
			west: fillFn(x - 1, y),
			northEast: fillFn(x + 1, y - 1),
			northWest: fillFn(x - 1, y - 1),
			southEast: fillFn(x + 1, y + 1),
			southWest: fillFn(x - 1, y + 1),
		};
	}

	/**
	 * Deterministic random based on position (prevents flickering on re-render)
	 * Same (x, y) always returns same index
	 */
	private seededRandom(x: number, y: number, max: number): number {
		// Simple hash combining position using prime multipliers
		const hash = (x * 73856093) ^ (y * 19349663);
		return Math.abs(hash) % max;
	}
}
