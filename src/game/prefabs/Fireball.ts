import type { Vector3Like } from 'three';
import { GameObject } from '../GameObject';
import { CollisionComponent } from '../components/interactions/CollisionComponent';
import { GeometryComponent } from '../components/rendering/GeometryComponent';
import { MaterialComponent } from '../components/rendering/MaterialComponent';
import { MeshComponent } from '../components/rendering/MeshComponent';
import { TransformComponent } from '../components/rendering/TransformComponent';
import { TrajectoryComponent } from '../components/systems/TrajectoryComponent';

export interface I_FireballConfig {
  id?: string;
  position?: Vector3Like;
  direction?: Vector3Like; // Initial direction vector
  velocity?: number; // Speed (default: 10)
  lifetime?: number; // Auto-despawn after milliseconds (default: 5000)
  size?: number; // Fireball radius (default: 0.3)
  color?: number; // Fireball color (default: 0xff4500 - orange-red)
  onHit?: (targetId: string) => void; // Callback when hitting something
}

/**
 * Fireball Prefab - Projectile GameObject
 *
 * A spawnable projectile with:
 * - Sphere geometry with emissive material
 * - TrajectoryComponent for physics movement
 * - CollisionComponent for hit detection (trigger)
 * - Auto-despawn after lifetime
 *
 * Usage with Spawner:
 * ```typescript
 * spawner.registerFactory('fireball', (id, config) => {
 *   return new Fireball({ id, ...config });
 * });
 *
 * const fireball = spawner.spawn('fireball', {
 *   position: [0, 1, 0],
 *   direction: [1, 0, 0],
 *   velocity: 15
 * });
 * ```
 */
export class Fireball extends GameObject {
  constructor(config: I_FireballConfig = {}) {
    super({ id: config.id || `fireball-${Date.now()}` });

    const position = config.position ?? { x: 0, y: 1, z: 0 };
    const direction = config.direction ?? { x: 1, y: 0, z: 0 };
    const velocity = config.velocity ?? 10;
    const lifetime = config.lifetime ?? 5000;
    const size = config.size ?? 0.3;
    const color = config.color ?? 0xff4500; // Orange-red

    // Calculate trajectory: travel distance based on velocity and lifetime
    const travelDistance = velocity * (lifetime / 1000); // Convert ms to seconds
    const startPos: [number, number, number] = [position.x, position.y, position.z];
    const endPos: [number, number, number] = [
      position.x + direction.x * travelDistance,
      position.y + direction.y * travelDistance,
      position.z + direction.z * travelDistance,
    ];

    // Transform
    this.addComponent(
      new TransformComponent({
        position: startPos,
      }),
    );

    // Geometry (sphere)
    this.addComponent(
      new GeometryComponent({
        type: 'sphere',
        params: [size, 16, 16],
      }),
    );

    // Material (emissive for glow effect)
    this.addComponent(
      new MaterialComponent({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.1,
      }),
    );

    // Mesh
    this.addComponent(
      new MeshComponent({
        castShadow: true,
        receiveShadow: false,
      }),
    );

    // Trajectory (physics movement)
    this.addComponent(
      new TrajectoryComponent({
        startPosition: startPos,
        endPosition: endPos,
        duration: lifetime / 1000, // Convert ms to seconds
      }),
    );

    // Collision detection (trigger - doesn't block movement)
    this.addComponent(
      new CollisionComponent({
        type: 'trigger',
        shape: 'sphere',
        shapeParams: [size],
        onCollisionEnter: (targetId) => {
          console.log(`💥 [Fireball] Hit target: ${targetId}`);
          config.onHit?.(targetId);
        },
      }),
    );
  }
}
