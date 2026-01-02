import { I_GameObjectConfig } from "@/game/common/gameobject.types";
import { UnitsComponent } from "@/game/components/entities/UnitsComponent";
import { CollisionComponent } from "@/game/components/physics/CollisionComponent";
import { HoverComponent } from "@/game/components/interactions/HoverComponent";
import { InteractionComponent } from "@/game/components/interactions/InteractionComponent";
import { MatchComponent } from "@/game/components/match/MatchComponent";
import { SpriteGameObject } from "../SpriteGameObject";

export interface I_TrainingDummyConfig extends I_GameObjectConfig {
	id: string;
	position?: [number, number, number];
}

/**
 * TrainingDummy - NPC prefab for match creation testing
 *
 * Represents a training dummy NPC that players can double-click to start a PvE match.
 * Uses a slime sprite with cylindrical billboarding.
 *
 * Extends SpriteGameObject (provides Transform, Sprite, Billboard, Animator) and adds:
 * - CollisionComponent: Static capsule collision (inline shape)
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
 */
export class TrainingDummy extends SpriteGameObject {
	constructor(config: I_TrainingDummyConfig) {
		const position = config.position ?? [10, 0, 5];

		// Call SpriteGameObject constructor
		super({
			id: config.id || "training-dummy",
			type: config.type,
			spriteSheetId: "slime",
			position,
			billboardMode: "spherical",
			defaultAnimation: "idle",
		});

		// Add TrainingDummy-specific components
		this.addComponent(new UnitsComponent())
			.addComponent(new InteractionComponent())
			.addComponent(new HoverComponent())
			// Inline capsule collision - sized to match slime graphic (not full sprite cell)
			// Slime is a small, round creature in lower portion of sprite frame
			.addComponent(
				new CollisionComponent({
					type: "static",
					shape: {
						type: "capsule",
						radius: 0.6,
						height: 1.2,
						offset: [0, 0.6, 0], // Raise capsule to center on slime body
					},
				}),
			)
			.addComponent(new MatchComponent());
	}
}
