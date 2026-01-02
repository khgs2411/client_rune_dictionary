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
	 * Factory: Create visual-layout tileset (corners in corners, edges on edges)
	 *
	 * This layout matches how artists typically arrange tiles visually:
	 * - Row 1: top-left corner, top edges, top-right corner
	 * - Row 2-3: left edge, center tiles, right edge
	 * - Row 4: bottom-left corner, bottom edges, bottom-right corner
	 *
	 * The neighbor logic: tile shows EDGE where there's NO neighbor.
	 */
	static createRuleset(bounds: I_TilesetBounds): TileRuleset {
		// Visual layout: corners in corners, edges on edges, centers in middle
		// "Has neighbor" means grass continues (no edge drawn)
		// "No neighbor" means edge is drawn on that side
		const rules: I_TileRule[] = [
			// 4 Corners (2 neighbors each, on adjacent sides)
			// Tile shows EDGE on sides with NO neighbor
			{ neighbors: { north: false, east: true, south: true, west: false }, tiles: [{ row: 1, column: 1 }] }, // top-left corner (has S+E)
			{ neighbors: { north: false, east: false, south: true, west: true }, tiles: [{ row: 1, column: 4 }] }, // top-right corner (has S+W)
			{ neighbors: { north: true, east: true, south: false, west: false }, tiles: [{ row: 4, column: 1 }] }, // bottom-left corner (has N+E)
			{ neighbors: { north: true, east: false, south: false, west: true }, tiles: [{ row: 4, column: 4 }] }, // bottom-right corner (has N+W)

			// 4 Edges (3 neighbors each) - single tile per edge, no variance
			// Row 1 = north edge visible, Row 4 = south edge visible
			// Col 1 = west edge visible, Col 4 = east edge visible
			{ neighbors: { north: false, south: true, east: true, west: true }, tiles: [{ row: 1, column: 3 }] }, // top edge (no N)
			{ neighbors: { north: true, south: false, east: true, west: true }, tiles: [{ row: 4, column: 2 }] }, // bottom edge (no S)
			{ neighbors: { north: true, south: true, east: true, west: false }, tiles: [{ row: 2, column: 1 }] }, // left edge (no W)
			{ neighbors: { north: true, south: true, east: false, west: true }, tiles: [{ row: 3, column: 4 }] }, // right edge (no E)

			// Center (all 4 neighbors)
			{ neighbors: { north: true, south: true, east: true, west: true }, tiles: [/* { row: 2, column: 2 }, { row: 2, column: 3 },  */{ row: 3, column: 2 }, /* { row: 3, column: 3 } */] },

			// Isolated (no neighbors) - use center as fallback
			{ neighbors: { north: false, south: false, east: false, west: false }, tiles: [{ row: 2, column: 2 }] },

			// Peninsulas (1 neighbor only) - use edge tiles as fallback
			{ neighbors: { north: false, south: true, east: false, west: false }, tiles: [{ row: 1, column: 2 }] }, // only S -> top edge
			{ neighbors: { north: true, south: false, east: false, west: false }, tiles: [{ row: 4, column: 2 }] }, // only N -> bottom edge
			{ neighbors: { north: false, south: false, east: true, west: false }, tiles: [{ row: 2, column: 1 }] }, // only E -> left edge
			{ neighbors: { north: false, south: false, east: false, west: true }, tiles: [{ row: 2, column: 4 }] }, // only W -> right edge

			// Corridors (2 neighbors on opposite sides) - use edge as fallback
			{ neighbors: { north: true, south: true, east: false, west: false }, tiles: [{ row: 2, column: 1 }] }, // N+S vertical -> left edge
			{ neighbors: { north: false, south: false, east: true, west: true }, tiles: [{ row: 1, column: 2 }] }, // E+W horizontal -> top edge
		];

		return new TileRuleset({
			bounds,
			rules,
			defaultTile: { row: 2, column: 2 }, // Center tile as default
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
		// Grid Y+ = world north (away from camera)
		return {
			north: fillFn(x, y + 1),
			south: fillFn(x, y - 1),
			east: fillFn(x + 1, y),
			west: fillFn(x - 1, y),
			northEast: fillFn(x + 1, y + 1),
			northWest: fillFn(x - 1, y + 1),
			southEast: fillFn(x + 1, y - 1),
			southWest: fillFn(x - 1, y - 1),
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
