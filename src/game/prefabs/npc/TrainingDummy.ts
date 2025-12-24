import { GameObject } from "@/game/GameObject";
import { I_GameObjectConfig } from "@/game/common/gameobject.types";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { UnitsComponent } from "@/game/components/entities/UnitsComponent";
import { CollisionComponent } from "@/game/components/interactions/CollisionComponent";
import { HoverComponent } from "@/game/components/interactions/HoverComponent";
import { InteractionComponent } from "@/game/components/interactions/InteractionComponent";
import { MatchComponent } from "@/game/components/match/MatchComponent";
import { CollisionProxyComponent } from "@/game/components/physics/CollisionProxyComponent";
import { BillboardComponent } from "@/game/components/rendering/BillboardComponent";
import { SpriteComponent } from "@/game/components/rendering/SpriteComponent";
import { DirectionalSpriteAnimator, SpriteSheetRegistry } from "@/game/sprites";

export interface I_TrainingDummyConfig extends I_GameObjectConfig {
	id: string;
	position?: [number, number, number];
}

/**
 * TrainingDummy - NPC prefab for match creation testing
 *
 * Represents a training dummy NPC that players can double-click to start a PvE match.
 * Uses a goblin sprite with spherical billboarding.
 *
 * Components:
 * - TransformComponent: Position in world
 * - SpriteComponent: Goblin sprite texture
 * - BillboardComponent: Spherical billboarding (always faces camera)
 * - CollisionProxyComponent: Invisible cylinder for physics collision
 * - UnitsComponent: Distance measurement
 * - InteractionComponent: Click/double-click events
 * - HoverComponent: Hover detection events
 * - CollisionComponent: Static collision (uses CollisionProxyComponent)
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
		const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();
		const spriteConfig = registry.getSpriteConfig("slime");
		if (!spriteConfig) {
			console.error("[LocalPlayer] Sprite sheet 'local-player' not found. Make sure to call registerAllSpriteSheets() first.");
		} else {
			const animations = registry.buildAnimations("local-player");
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
					new DirectionalSpriteAnimator({
						animations,
						defaultAnimation: "idle",
						idleAnimation: "idle",
						nativeFacing: "right", // Sprite sheet faces left natively
					}),
				)
				.addComponent(
					new BillboardComponent({
						mode: "spherical", // Spherical keeps NPC always facing camera
					}),
				)

				// Collision proxy - invisible cylinder for physics
				// Sprite handles rendering, this cylinder handles collision
				.addComponent(
					new CollisionProxyComponent({
						shape: "cylinder",
						radius: 0.4,
						height: 2,
						offset: [0, 0.6, 0], // Center cylinder vertically on sprite
					}),
				)

				// System components
				.addComponent(new UnitsComponent()) // Distance measurement

				// Interaction components (order matters for dependencies)
				.addComponent(new InteractionComponent()) // Provides click/doubleclick events
				.addComponent(new HoverComponent()) // Provides hover events
				.addComponent(new CollisionComponent()) // Uses CollisionProxyComponent automatically via trait
				.addComponent(new MatchComponent()); // Orchestrates: hover glow when in range, doubleclick to start match
		}
	}
}
