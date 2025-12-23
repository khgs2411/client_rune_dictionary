import { GameObject } from "@/game/GameObject";
import { I_GameObjectConfig } from "@/game/common/gameobject.types";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { UnitsComponent } from "@/game/components/entities/UnitsComponent";
import { CollisionComponent } from "@/game/components/interactions/CollisionComponent";
import { HoverComponent } from "@/game/components/interactions/HoverComponent";
import { InteractionComponent } from "@/game/components/interactions/InteractionComponent";
import { MatchComponent } from "@/game/components/match/MatchComponent";
import { BillboardComponent } from "@/game/components/rendering/BillboardComponent";
import { SpriteComponent } from "@/game/components/rendering/SpriteComponent";

export interface I_TrainingDummyConfig extends I_GameObjectConfig {
	id: string;
	position?: [number, number, number];
}

/**
 * TrainingDummy - NPC prefab for match creation testing
 *
 * Represents a training dummy NPC that players can double-click to start a PvE match.
 * Uses a goblin sprite with cylindrical billboarding.
 *
 * Components:
 * - TransformComponent: Position in world
 * - SpriteComponent: Goblin sprite texture
 * - BillboardComponent: Cylindrical billboarding (stays upright, faces camera)
 * - UnitsComponent: Distance measurement
 * - InteractionComponent: Click/double-click events
 * - HoverComponent: Hover detection events
 * - MatchComponent: Match creation logic (range checking + combat glow)
 *
 * Usage:
 * ```typescript
 * const dummy = new TrainingDummy({
 *   id: 'training-dummy-1',
 *   position: [10, 0, 5],
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
 * - SpriteAnimationComponent for idle/hit animations
 * - NPCLabelComponent for name tag display
 */
export class TrainingDummy extends GameObject {
	constructor(config: I_TrainingDummyConfig) {
		super({ id: config.id || "training-dummy", type: config.type });

		const position = config.position || [10, 0, 5]; // Default position (ground level for sprite)

		// Visual components
		this.addComponent(new TransformComponent({ position }))
			.addComponent(
				new SpriteComponent({
					texture: "/sprites/goblin_00.png",
					size: [1.2, 1.5], // Width, Height in world units
					anchor: [0.5, 0], // Bottom-center for standing character
				}),
			)
			.addComponent(
				new BillboardComponent({
					mode: "spherical", // Cylindrical keeps NPC upright while facing camera
				}),
			)

			// System components
			.addComponent(new UnitsComponent()) // Distance measurement

			// Interaction components (order matters for dependencies)
			.addComponent(new InteractionComponent()) // Provides click/doubleclick events
			.addComponent(new HoverComponent()) // Provides hover events
			.addComponent(new CollisionComponent())
			.addComponent(new MatchComponent()); // Orchestrates: hover glow when in range, doubleclick to start match
	}
}
