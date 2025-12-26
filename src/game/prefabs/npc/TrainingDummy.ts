import { GameObject } from "@/game/GameObject";
import { I_GameObjectConfig } from "@/game/common/gameobject.types";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { UnitsComponent } from "@/game/components/entities/UnitsComponent";
import { CollisionComponent } from "@/game/components/physics/CollisionComponent";
import { HoverComponent } from "@/game/components/interactions/HoverComponent";
import { InteractionComponent } from "@/game/components/interactions/InteractionComponent";
import { MatchComponent } from "@/game/components/match/MatchComponent";
import { BillboardComponent } from "@/game/components/rendering/BillboardComponent";
import { SpriteAnimatorComponent } from "@/game/components/rendering/SpriteAnimatorComponent";
import { SpriteComponent } from "@/game/components/rendering/SpriteComponent";
import { SpriteSheetRegistry } from "@/game/SpriteSheetRegistry";

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
 * Components:
 * - TransformComponent: Position in world
 * - SpriteComponent: Slime sprite texture
 * - SpriteAnimatorComponent: Handles animation playback
 * - BillboardComponent: Cylindrical billboarding (stays upright, faces camera)
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
export class TrainingDummy extends GameObject {
	constructor(config: I_TrainingDummyConfig) {
		super({ id: config.id || "training-dummy", type: config.type });

		const position = config.position || [10, 0, 5]; // Default position (ground level for sprite)
		const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();
		const spriteConfig = registry.getSpriteConfig("slime");
		if (!spriteConfig) {
			console.error("[TrainingDummy] Sprite sheet 'slime' not found. Make sure to call SpriteSheetRegistry.RegisterAllSpriteSheets() first.");
		} else {
			const animations = registry.buildAnimations("slime");
			// Visual components
			this.addComponent(new TransformComponent({ position }))
				.addComponent(
					new SpriteComponent({
						texture: spriteConfig.texture,
						spriteSheet: spriteConfig.spriteSheet,
						size: spriteConfig.size,
						anchor: spriteConfig.anchor,
					}),
				)
				.addComponent(
					new SpriteAnimatorComponent({
						animations,
						defaultAnimation: "idle",
						idleAnimation: "idle",
						nativeFacing: "right", // Sprite sheet faces left natively
					}),
				)
				.addComponent(
					new BillboardComponent({
						mode: "cylindrical", // Cylindrical stays upright while facing camera (like LocalPlayer)
					}),
				)

				// System components
				.addComponent(new UnitsComponent()) // Distance measurement

				// Interaction components (order matters for dependencies)
				.addComponent(new InteractionComponent()) // Provides click/doubleclick events
				.addComponent(new HoverComponent()) // Provides hover events
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
				.addComponent(new MatchComponent()); // Orchestrates: hover glow when in range, doubleclick to start match
		}
	}
}
