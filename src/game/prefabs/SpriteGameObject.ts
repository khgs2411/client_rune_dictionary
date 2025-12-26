import type { BillboardMode, I_AnimationDefinition } from "../common/sprite.types";
import { DebugLabelComponent } from "../components/debug/DebugLabelComponent";
import { TransformComponent } from "../components/entities/TransformComponent";
import { BillboardComponent } from "../components/rendering/BillboardComponent";
import { SpriteAnimatorComponent } from "../components/rendering/SpriteAnimatorComponent";
import { SpriteComponent } from "../components/rendering/SpriteComponent";
import { GameObject } from "../GameObject";

/**
 * Configuration for SpriteGameObject prefab
 */
export interface I_SpriteGameObjectConfig {
	id: string;
	position?: [number, number, number];

	// Sprite configuration
	texture: string;
	spriteSheet?: {
		columns: number;
		rows: number;
	};
	size?: [number, number]; // [width, height] in world units

	// Billboard configuration
	billboardMode?: BillboardMode; // Default: 'cylindrical'

	// Optional animations
	animations?: I_AnimationDefinition[];
	defaultAnimation?: string;
}

/**
 * SpriteGameObject - Prefab for sprite-based game entities
 *
 * Combines TransformComponent, SpriteComponent, BillboardComponent,
 * and optionally SpriteAnimatorComponent for a complete sprite entity.
 *
 * Usage with static sprite:
 * ```typescript
 * const tree = new SpriteGameObject({
 *   id: 'tree-1',
 *   position: [5, 0, 3],
 *   texture: '/assets/sprites/tree.png',
 *   size: [2, 3],
 * });
 * gameObjects.register(tree);
 * ```
 *
 * Usage with animated sprite:
 * ```typescript
 * const npc = new SpriteGameObject({
 *   id: 'npc-1',
 *   position: [0, 0, 0],
 *   texture: '/assets/sprites/npc.png',
 *   spriteSheet: { columns: 8, rows: 4 },
 *   size: [1, 1.5],
 *   animations: [
 *     { name: 'idle', startFrame: 0, endFrame: 3, fps: 6 },
 *     { name: 'walk', startFrame: 8, endFrame: 15, fps: 12 },
 *   ],
 *   defaultAnimation: 'idle',
 * });
 *
 * // Control animation
 * const anim = npc.getComponent(SpriteAnimatorComponent);
 * anim?.play('walk');
 * ```
 */
export class SpriteGameObject extends GameObject {
	constructor(config: I_SpriteGameObjectConfig) {
		super({ id: config.id });

		const position = config.position ?? [0, 0, 0];
		const size = config.size ?? [1, 1];
		const billboardMode = config.billboardMode ?? "cylindrical";

		// Transform
		this.addComponent(
			new TransformComponent({
				position,
			}),
		);

		// Sprite
		this.addComponent(
			new SpriteComponent({
				texture: config.texture,
				spriteSheet: config.spriteSheet,
				size,
				anchor: [0.5, 0], // Bottom-center for standing characters
			}),
		);

		// Billboard
		this.addComponent(
			new BillboardComponent({
				mode: billboardMode,
			}),
		);

		this.addComponent(new DebugLabelComponent());

		// this.addComponent(new OcclusionComponent())

		// Animation (optional)
		if (config.animations && config.animations.length > 0) {
			this.addComponent(
				new SpriteAnimatorComponent({
					animations: config.animations,
					defaultAnimation: config.defaultAnimation,
				}),
			);
		}
	}
}
