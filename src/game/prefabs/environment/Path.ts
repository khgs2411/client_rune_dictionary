import { GeometryComponent } from '../../components/rendering/GeometryComponent';
import { MaterialComponent } from '../../components/rendering/MaterialComponent';
import { MeshComponent } from '../../components/rendering/MeshComponent';
import { ToonMaterialComponent } from '../../components/rendering/ToonMaterialComponent';
import { TransformComponent } from '../../components/rendering/TransformComponent';
import { GameObject } from '../../GameObject';

export interface I_PathSegment {
  x: number;
  z: number;
  width?: number; // Width of this segment (default: uses config width)
  length?: number; // Length of this segment (default: uses config length)
  rotation?: number; // Y rotation in radians (default: 0)
}

export interface I_PathConfig {
  id?: string; // Base ID for path segments (default: 'path')
  segments: I_PathSegment[];
  width?: number; // Default path width (default: 4)
  length?: number; // Default segment length (default: 8)
  color?: number; // Path color (default: 0xc2b280 - sand/dirt)
  yOffset?: number; // Height offset to prevent z-fighting (default: 0.02)
  useToonShading?: boolean; // Use cel-shaded materials (default: false)
  vibrant?: boolean; // Boost saturation (default: false)
}

/**
 * Path Prefab - Creates dirt/stone path segments
 *
 * Creates individual path segment GameObjects.
 * Useful for creating winding roads, town squares, etc.
 *
 * Usage:
 * ```typescript
 * const paths = Path.create({
 *   segments: [
 *     { x: 0, z: 0 },
 *     { x: 0, z: 8 },
 *     { x: 4, z: 16, rotation: Math.PI / 4 }, // Diagonal segment
 *   ],
 *   width: 4,
 *   length: 8,
 *   useToonShading: true
 * });
 * ```
 */
export class Path {
  static create(config: I_PathConfig): GameObject[] {
    const id = config.id ?? 'path';
    const defaultWidth = config.width ?? 4;
    const defaultLength = config.length ?? 8;
    const color = config.color ?? 0xc2b280; // Sand/dirt color
    const yOffset = config.yOffset ?? 0.02;
    const useToonShading = config.useToonShading ?? false;
    const vibrant = config.vibrant ?? false;

    // Material factory
    const createMaterial = () =>
      useToonShading
        ? new ToonMaterialComponent({
            color,
            gradientSteps: 3,
            vibrant,
          })
        : new MaterialComponent({
            color,
            roughness: 0.95,
            metalness: 0,
          });

    // Create a GameObject for each segment
    const segments: GameObject[] = config.segments.map((segment, index) => {
      const width = segment.width ?? defaultWidth;
      const length = segment.length ?? defaultLength;
      const rotation = segment.rotation ?? 0;

      return new GameObject({ id: `${id}-segment-${index}` })
        .addComponent(
          new TransformComponent({
            position: [segment.x, yOffset, segment.z],
            rotation: [-Math.PI / 2, 0, rotation], // Flat on ground + Y rotation
          }),
        )
        .addComponent(
          new GeometryComponent({
            type: 'plane',
            params: [width, length],
          }),
        )
        .addComponent(createMaterial())
        .addComponent(
          new MeshComponent({
            castShadow: false,
            receiveShadow: true,
          }),
        );
    });

    return segments;
  }

  /**
   * Create a straight path from start to end position
   * Automatically calculates segments needed
   */
  static createStraight(config: {
    id?: string; // Base ID for path segments (default: 'path')
    start: [number, number]; // [x, z]
    end: [number, number]; // [x, z]
    width?: number;
    segmentLength?: number;
    color?: number;
    useToonShading?: boolean;
    vibrant?: boolean;
  }): GameObject[] {
    const width = config.width ?? 4;
    const segmentLength = config.segmentLength ?? 8;

    const dx = config.end[0] - config.start[0];
    const dz = config.end[1] - config.start[1];
    const totalLength = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const numSegments = Math.ceil(totalLength / segmentLength);
    const segments: I_PathSegment[] = [];

    for (let i = 0; i < numSegments; i++) {
      const t = (i + 0.5) / numSegments; // Center of each segment
      segments.push({
        x: config.start[0] + dx * t,
        z: config.start[1] + dz * t,
        width,
        length: segmentLength,
        rotation: angle,
      });
    }

    return Path.create({
      id: config.id,
      segments,
      width,
      length: segmentLength,
      color: config.color,
      useToonShading: config.useToonShading,
      vibrant: config.vibrant,
    });
  }
}
