import { GameObject } from '@/game/GameObject';
import { I_GameObjectConfig } from '@/game/common/gameobject.types';
import { InteractionComponent } from '@/game/components/interactions/InteractionComponent';
import { MatchComponent } from '@/game/components/match/MatchComponent';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';

export interface I_TrainingDummyConfig extends I_GameObjectConfig {
  id: string;
  position?: [number, number, number];
  color?: number; // Hex color for material
}

/**
 * TrainingDummy - NPC prefab for match creation testing
 *
 * Represents a training dummy NPC that players can double-click to start a PvE match.
 *
 * Components:
 * - TransformComponent: Position in world
 * - GeometryComponent: Capsule shape (humanoid)
 * - MaterialComponent: Red color (indicates NPC/enemy)
 * - MeshComponent: Visual mesh
 * - InteractionComponent: Click/double-click events
 * - MatchComponent: Match creation logic
 *
 * Usage:
 * ```typescript
 * const dummy = new TrainingDummy({
 *   id: 'training-dummy-1',
 *   position: [10, 0, 5],
 *   color: 0xff0000, // Red
 * });
 *
 * gameObjects.register(dummy);
 * ```
 *
 * Behavior:
 * - Double-click → Creates PvE match
 * - Single-click → No action (can be extended later for dialogue/info)
 *
 * Future Extensions:
 * - DialogueComponent for NPC conversations
 * - AnimationComponent for idle/hit animations
 * - NPCLabelComponent for name tag display
 */
export class TrainingDummy extends GameObject {
  constructor(config: I_TrainingDummyConfig) {
    super({ id: config.id || 'training-dummy', type: config.type });

    const position = config.position || [10, 0.9, 5]; // Default position (0.9 = half capsule height)
    const color = config.color !== undefined ? config.color : 0xff0000; // Default red
    // Visual components
    this.addComponent(new TransformComponent({ position }))
      .addComponent(
        new GeometryComponent({
          type: 'capsule',
          params: [0.5, 1.8, 8, 16], // radius, height, capSegments, radialSegments
        }),
      )
      .addComponent(
        new MaterialComponent({
          color,
          roughness: 0.7,
          metalness: 0.2,
        }),
      )
      .addComponent(new MeshComponent())

      // Interaction components (order matters for dependencies)
      .addComponent(new InteractionComponent()) // Provides click/doubleclick events
      .addComponent(new MatchComponent()); // Listens to doubleclick, creates match
  }
}
