import { GameObject } from '../GameObject';
import { GridHelperComponent } from '../components/rendering/GridHelperComponent';
import { TransformComponent } from '../components/rendering/TransformComponent';

export interface I_MatchGridConfig {
  id: string;
  center: { x: number; y: number; z: number };
  diameter: number;
  cellSize?: number;
  visible?: boolean;
}

/**
 * MatchGrid - Tactical grid overlay for match area
 *
 * **Purpose**:
 * - Visual grid for tactical positioning during matches
 * - Provides world ↔ grid coordinate conversion
 * - Calculates grid distance for ability ranges
 * - Only visible during PVE_MATCH state
 *
 * **Components**:
 * - TransformComponent: Position at ground level
 * - GridHelperComponent: Three.js GridHelper visualization
 *
 * **Coordinate System**:
 * - Grid origin: Center of dome = (0, 0) in grid space
 * - Cell coordinates: Integer-based (e.g., [3, -2])
 * - World-to-Grid: gridX = floor((worldX - originX) / cellSize)
 * - Grid-to-World: worldX = (gridX * cellSize) + originX
 *
 * **Lifecycle**:
 * - Created: When match starts (spawned with MatchAreaDome)
 * - Destroyed: When match ends (destroyed with dome)
 *
 * **Usage**:
 * ```typescript
 * const grid = new MatchGrid({
 *   id: 'match-grid',
 *   center: { x: centerX, y: 0, z: centerZ },
 *   diameter: domeRadius * 2,
 *   cellSize: 1,
 *   visible: true
 * });
 *
 * // Convert world position to grid coordinates
 * const gridPos = grid.worldToGrid(worldX, worldZ);
 *
 * // Calculate grid distance (Manhattan distance)
 * const distance = grid.getGridDistance(pos1, pos2);
 * ```
 */
export class MatchGrid extends GameObject {
  private centerX: number;
  private centerZ: number;
  private cellSize: number;

  constructor(config: I_MatchGridConfig) {
    super({ id: config.id });

    this.centerX = config.center.x;
    this.centerZ = config.center.z;
    this.cellSize = config.cellSize ?? 1;

    // Grid size (number of divisions = diameter / cellSize)
    const divisions = Math.ceil(config.diameter / this.cellSize);

    // Add components
    this.addComponent(
      new TransformComponent({
        position: [config.center.x, config.center.y, config.center.z],
      }),
    ).addComponent(
      new GridHelperComponent({
        size: config.diameter,
        divisions: divisions,
        centerColor: 0x888888,
        gridColor: 0x444444,
        yOffset: 0.01,
      }),
    );

    console.log(
      `🎯 [MatchGrid] Created grid at (${config.center.x.toFixed(1)}, ${config.center.y.toFixed(1)}, ${config.center.z.toFixed(1)}) - Size: ${config.diameter}x${config.diameter}, Cell: ${this.cellSize}`,
    );
  }

  /**
   * Convert world position to grid coordinates
   *
   * @param worldX - World space X coordinate
   * @param worldZ - World space Z coordinate
   * @returns Grid coordinates { gridX, gridZ }
   */
  worldToGrid(worldX: number, worldZ: number): { gridX: number; gridZ: number } {
    const gridX = Math.floor((worldX - this.centerX) / this.cellSize);
    const gridZ = Math.floor((worldZ - this.centerZ) / this.cellSize);
    return { gridX, gridZ };
  }

  /**
   * Convert grid coordinates to world position
   *
   * @param gridX - Grid X coordinate
   * @param gridZ - Grid Z coordinate
   * @returns World position { worldX, worldZ } (cell center)
   */
  gridToWorld(gridX: number, gridZ: number): { worldX: number; worldZ: number } {
    const worldX = gridX * this.cellSize + this.centerX + this.cellSize / 2;
    const worldZ = gridZ * this.cellSize + this.centerZ + this.cellSize / 2;
    return { worldX, worldZ };
  }

  /**
   * Calculate grid distance between two positions (Manhattan distance)
   *
   * @param pos1 - First position { x, z } in world or grid coordinates
   * @param pos2 - Second position { x, z } in world or grid coordinates
   * @param isWorldCoords - If true, converts world coords to grid first
   * @returns Manhattan distance in grid cells
   */
  getGridDistance(
    pos1: { x: number; z: number },
    pos2: { x: number; z: number },
    isWorldCoords = true,
  ): number {
    let grid1, grid2;

    if (isWorldCoords) {
      grid1 = this.worldToGrid(pos1.x, pos1.z);
      grid2 = this.worldToGrid(pos2.x, pos2.z);
    } else {
      grid1 = { gridX: pos1.x, gridZ: pos1.z };
      grid2 = { gridX: pos2.x, gridZ: pos2.z };
    }

    // Manhattan distance for tactical grid
    return Math.abs(grid2.gridX - grid1.gridX) + Math.abs(grid2.gridZ - grid1.gridZ);
  }

  /**
   * Get grid cell size
   */
  getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Get grid origin (center point in world coordinates)
   */
  getOrigin(): { x: number; z: number } {
    return { x: this.centerX, z: this.centerZ };
  }
}
