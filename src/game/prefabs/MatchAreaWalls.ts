import { CollisionComponent } from '@/game/components/interactions/CollisionComponent';
import { GameObject } from '../GameObject';
import { TransformComponent } from '../components/rendering/TransformComponent';
import { I_SceneContext } from '../common/scenes.types';
import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';

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
 * - Faint glowing border lines at ground level for visual indication
 *
 * **Implementation**:
 * - Creates 4 wall segments (North, South, East, West)
 * - Each segment is a tall cuboid with collision only (invisible)
 * - Forms a rectangular arena around the center point
 * - Height is sufficient to prevent jumping over (default: 20 units)
 * - Adds faint orange glowing lines at ground level to mark borders
 *
 * **Components (per wall)**:
 * - TransformComponent: Position + rotation
 * - CollisionComponent: Static collision body (invisible, debug wireframes only)
 * - Visual border lines: Faint glowing lines at ground level (40% opacity, orange)
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
  private borderLines: Line[] = []; // Visual border indicators

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

    // Create visual border lines at ground level
    this.createBorderLines(context);

    console.log(
      `🛡️ [MatchAreaWalls] Initialized ${this.wallSegments.length} wall segments (invisible, collision wireframes: ${this.config.showDebug})`,
    );
  }

  /**
   * Create faint glowing lines at ground level to mark arena borders
   */
  private createBorderLines(context: I_SceneContext): void {
    const { center, width, depth } = this.config;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const groundY = center.y + 0.05; // Slightly above ground to prevent z-fighting

    // Define the 4 border lines (rectangle at ground level)
    const borders = [
      // North border (top edge)
      {
        start: new Vector3(center.x - halfWidth, groundY, center.z + halfDepth),
        end: new Vector3(center.x + halfWidth, groundY, center.z + halfDepth),
      },
      // South border (bottom edge)
      {
        start: new Vector3(center.x - halfWidth, groundY, center.z - halfDepth),
        end: new Vector3(center.x + halfWidth, groundY, center.z - halfDepth),
      },
      // East border (right edge)
      {
        start: new Vector3(center.x + halfWidth, groundY, center.z - halfDepth),
        end: new Vector3(center.x + halfWidth, groundY, center.z + halfDepth),
      },
      // West border (left edge)
      {
        start: new Vector3(center.x - halfWidth, groundY, center.z - halfDepth),
        end: new Vector3(center.x - halfWidth, groundY, center.z + halfDepth),
      },
    ];

    // Create glowing line for each border
    for (const border of borders) {
      const points = [border.start, border.end];
      const geometry = new BufferGeometry().setFromPoints(points);

      // Faint glowing material
      const material = new LineBasicMaterial({
        color: 0xff6b35, // Warm orange glow
        opacity: 0.4,
        transparent: true,
        linewidth: 2, // Note: linewidth > 1 only works with WebGLRenderer on Windows
      });

      const line = new Line(geometry, material);
      context.scene.add(line);
      // Lines are cleaned up manually in destroy() method, not via cleanupRegistry
      this.borderLines.push(line);
    }

    console.log(`🛡️ [MatchAreaWalls] Created ${this.borderLines.length} border lines`);
  }

  destroy(): void {
    console.log('🛡️ [MatchAreaWalls] Destroying walls and cleaning up collision');

    // Destroy all wall segments
    if (this.context) {
      const gameObjects = this.context.getService('gameObjectsManager');
      for (const segment of this.wallSegments) {
        gameObjects.unregister(segment.id);
      }

      // Manually remove and dispose border lines from scene
      console.log(`🛡️ [MatchAreaWalls] Removing ${this.borderLines.length} border lines from scene`);
      for (const line of this.borderLines) {
        this.context.scene.remove(line);
        line.geometry.dispose();
        if (Array.isArray(line.material)) {
          line.material.forEach((mat) => mat.dispose());
        } else {
          line.material.dispose();
        }
      }
    }

    this.wallSegments = [];
    this.borderLines = [];
    super.destroy();
  }
}
