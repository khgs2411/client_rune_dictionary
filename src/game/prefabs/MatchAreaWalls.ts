import { CollisionComponent } from '@/game/components/interactions/CollisionComponent';
import { GameObject } from '../GameObject';
import { TransformComponent } from '../components/rendering/TransformComponent';
import { I_SceneContext } from '../common/scenes.types';

export interface I_MatchAreaWallsConfig {
  id: string;
  center: { x: number; y: number; z: number };
  width: number; // Arena width (X axis)
  depth: number; // Arena depth (Z axis)
  height?: number; // Wall height (default: 20)
  showDebug?: boolean;
}

/**
 * MatchAreaWalls - Rectangular arena walls that prevent players from leaving match area
 *
 * **Purpose**:
 * - Creates physical boundary around match area using 4 walls (rectangle)
 * - Prevents escape from match area during PVE_MATCH state
 * - Simple, reliable collision boundary
 * - Completely invisible (collision-only, no visual mesh)
 *
 * **Implementation**:
 * - Creates 4 wall segments (North, South, East, West)
 * - Each segment is a tall cuboid with collision only
 * - Forms a rectangular arena around the center point
 * - Height is sufficient to prevent jumping over (default: 20 units)
 *
 * **Components (per wall)**:
 * - TransformComponent: Position + rotation
 * - CollisionComponent: Static collision body (invisible, debug wireframes only)
 *
 * **Lifecycle**:
 * - Created: When match starts (MATCH_INSTANTIATING state)
 * - Destroyed: When match ends (return to OVERWORLD)
 *
 * **Usage**:
 * ```typescript
 * const walls = new MatchAreaWalls({
 *   id: 'match-walls',
 *   center: { x: centerX, y: 0, z: centerZ },
 *   width: 40,  // X axis
 *   depth: 25,  // Z axis
 *   height: 20,
 *   showDebug: gameConfig.debug.showPhysicsDebug
 * });
 * ```
 */
export class MatchAreaWalls extends GameObject {
  private config: I_MatchAreaWallsConfig;
  private wallSegments: GameObject[] = [];

  constructor(config: I_MatchAreaWallsConfig) {
    super({ id: config.id });
    this.config = config;

    const height = config.height ?? 20;
    const width = config.width; // X axis
    const depth = config.depth; // Z axis
    const thickness = 0.5;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    console.log(
      `🛡️ [MatchAreaWalls] Creating 4 walls - Width: ${width}, Depth: ${depth}, Height: ${height}`,
    );

    // Create 4 walls forming a rectangle
    const walls = [
      // North wall (top, along X axis)
      {
        id: 'north',
        position: [config.center.x, config.center.y + height / 2, config.center.z + halfDepth],
        rotation: [0, 0, 0], // Facing along X axis
        dimensions: [width, height, thickness], // wide along X, tall, thin along Z
      },
      // South wall (bottom, along X axis)
      {
        id: 'south',
        position: [config.center.x, config.center.y + height / 2, config.center.z - halfDepth],
        rotation: [0, 0, 0], // Facing along X axis
        dimensions: [width, height, thickness],
      },
      // East wall (right, along Z axis)
      {
        id: 'east',
        position: [config.center.x + halfWidth, config.center.y + height / 2, config.center.z],
        rotation: [0, Math.PI / 2, 0], // Rotated 90° to face along Z axis
        dimensions: [depth, height, thickness], // wide along Z, tall, thin along X
      },
      // West wall (left, along Z axis)
      {
        id: 'west',
        position: [config.center.x - halfWidth, config.center.y + height / 2, config.center.z],
        rotation: [0, Math.PI / 2, 0], // Rotated 90° to face along Z axis
        dimensions: [depth, height, thickness], // wide along Z, tall, thin along X
      },
    ];

    for (const wall of walls) {
      const wallSegment = new GameObject({ id: `${config.id}-${wall.id}` });

      wallSegment
        .addComponent(
          new TransformComponent({
            position: wall.position as [number, number, number],
            rotation: wall.rotation as [number, number, number],
          }),
        )
        // NO visual components - walls are invisible, collision only
        // GeometryComponent, MaterialComponent, and MeshComponent removed
        .addComponent(
          new CollisionComponent({
            type: 'static',
            shape: 'cuboid',
            shapeParams: [
              wall.dimensions[0] / 2,
              wall.dimensions[1] / 2,
              wall.dimensions[2] / 2,
            ], // Half-extents: [halfWidth, halfHeight, halfDepth]
            showDebug: config.showDebug,
          }),
        );

      this.wallSegments.push(wallSegment);
    }

    console.log(
      `🛡️ [MatchAreaWalls] Created 4 walls at (${config.center.x.toFixed(1)}, ${config.center.y.toFixed(1)}, ${config.center.z.toFixed(1)}) - ${width}x${depth} rectangle`,
    );
  }

  async init(context: I_SceneContext): Promise<void> {
    await super.init(context);

    // Initialize all wall segments (collision only, no visual meshes)
    const gameObjects = context.getService('gameObjectsManager');
    for (const segment of this.wallSegments) {
      gameObjects.register(segment);
    }

    console.log(
      `🛡️ [MatchAreaWalls] Initialized ${this.wallSegments.length} wall segments (invisible, collision wireframes: ${this.config.showDebug})`,
    );
  }

  destroy(): void {
    console.log('🛡️ [MatchAreaWalls] Destroying walls and cleaning up collision');

    // Destroy all wall segments
    if (this.context) {
      const gameObjects = this.context.getService('gameObjectsManager');
      for (const segment of this.wallSegments) {
        gameObjects.unregister(segment.id);
      }
    }

    this.wallSegments = [];
    super.destroy();
  }
}
