import { GameObject } from '@/game/GameObject';
import { PhysicsComponent } from '@/game/components/interactions/PhysicsComponent';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';

/**
 * Configuration for base character creation
 */
export interface I_BaseCharacterConfig {
  id: string;
  position?: [number, number, number];
  color?: number;
  enablePhysics?: boolean; // Default: true
  enableCharacterController?: boolean; // Default: false (true for LocalPlayer, false for RemotePlayer)
  enableShadows?: boolean; // Default: true
}

/**
 * Factory function to create a base character GameObject
 *
 * This function creates a GameObject with all common character components:
 * - TransformComponent (position, rotation)
 * - GeometryComponent (capsule shape for humanoid)
 * - MaterialComponent (color, roughness, metalness)
 * - MeshComponent (Three.js mesh with shadows)
 * - PhysicsComponent (optional kinematic body)
 *
 * Usage:
 * ```typescript
 * const baseChar = createBaseCharacter({
 *   id: 'player-123',
 *   position: [0, 1, 0],
 *   color: 0x00ff00,
 *   enablePhysics: true,
 *   enableCharacterController: true,
 * });
 * ```
 *
 * @param config - Configuration for the character
 * @returns GameObject with base character components
 */
export function createCharacterObject(config: I_BaseCharacterConfig): GameObject {
  // Configuration with defaults
  const position = config.position ?? [0, 1, 0];
  const color = config.color ?? 0x00ff00;
  const enablePhysics = config.enablePhysics ?? true;
  const enableCharacterController = config.enableCharacterController ?? false;
  const enableShadows = config.enableShadows ?? true;
  // Create GameObject
  const character = new GameObject({ id: config.id });

  // Add Transform component
  character.addComponent(
    new TransformComponent({
      position: position,
      rotation: [0, 0, 0],
    }),
  );

  // Add Geometry component (capsule for humanoid shape)
  character.addComponent(
    new GeometryComponent({
      type: 'capsule',
      params: [0.5, 1, 8, 16], // radius, height, radialSegments, heightSegments
    }),
  );

  // this is missing..
 /*  character.addComponent(new GeometryComponent({
    type: 'cone',
    params: [0.2, 0.4, 8, 16]
  })) */

  // Add Material component
  character.addComponent(
    new MaterialComponent({
      color: color,
      roughness: 0.8,
      metalness: 0.2,
    }),
  );

  // Add Mesh component
  character.addComponent(
    new MeshComponent({
      castShadow: enableShadows,
      receiveShadow: true,
    }),
  );

  // Add Physics component (optional)
  if (enablePhysics) {
    character.addComponent(
      new PhysicsComponent({
        type: 'kinematic',
        shape: 'capsule',
      }),
    );
  }

  return character;
}
