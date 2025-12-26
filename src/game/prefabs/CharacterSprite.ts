import type { BillboardMode } from "../common/sprite.types";
import type { SpriteDirection } from "../common/spritesheet.types";
import { TransformComponent } from "../components/entities/TransformComponent";
import { BillboardComponent } from "../components/rendering/BillboardComponent";
import { DirectionalSpriteAnimator } from "../components/rendering/DirectionalSpriteAnimator";
import { SpriteComponent } from "../components/rendering/SpriteComponent";
import { GameObject } from "../GameObject";
import { SpriteSheetRegistry } from "../SpriteSheetRegistry";

/**
 * Configuration for CharacterSprite prefab
 */
export interface I_CharacterSpriteConfig {
	/** Unique GameObject ID */
	id: string;

	/** Sprite sheet definition ID (must be registered in SpriteSheetRegistry) */
	spriteSheetId: string;

	/** Initial position in world space */
	position?: [number, number, number];

	/** Initial facing direction */
	direction?: SpriteDirection;

	/** Override default animation */
	defaultAnimation?: string;

	/** Billboard mode (default: 'cylindrical') */
	billboardMode?: BillboardMode;
}

/**
 * CharacterSprite - Create a character from a registered sprite sheet
 *
 * The easiest way to create animated sprite characters. Register your
 * sprite sheet once, then create as many characters as needed with minimal config.
 *
 * Supports both single-texture and multi-texture sprite sheets automatically.
 *
 * Setup (do once at game init):
 * ```typescript
 * import { registerSpriteSheet } from '../game/sprites';
 *
 * // Single texture (all animations in one file)
 * registerSpriteSheet({
 *   id: 'knight',
 *   texture: '/sprites/knight.png',
 *   framesPerRow: 6,
 *   totalRows: 8,
 *   size: [1, 1.5],
 *   directional: true,
 *   animations: [
 *     { name: 'idle', frameCount: 4, fps: 6 },
 *     { name: 'walk', frameCount: 6, fps: 10 }
 *   ],
 *   defaultAnimation: 'idle'
 * });
 *
 * // Multi-texture (each animation in separate file)
 * registerSpriteSheet({
 *   id: 'mage',
 *   texture: [
 *     { id: 'idle', src: '/sprites/mage_idle.png' },
 *     { id: 'walk', src: '/sprites/mage_walk.png' },
 *     { id: 'attack', src: '/sprites/mage_attack.png' },
 *   ],
 *   framesPerRow: 6,
 *   totalRows: 4,  // 4 directions per file
 *   size: [1, 1.5],
 *   directional: true,
 *   animations: [
 *     { textureId: 'idle', name: 'idle', frameCount: 4, fps: 6 },
 *     { textureId: 'walk', name: 'walk', frameCount: 6, fps: 10 },
 *     { textureId: 'attack', name: 'attack', frameCount: 8, fps: 14, loop: false },
 *   ],
 *   defaultAnimation: 'idle'
 * });
 * ```
 *
 * Usage (create characters):
 * ```typescript
 * const knight = new CharacterSprite({
 *   id: 'knight-1',
 *   spriteSheetId: 'knight',
 *   position: [5, 0, 3],
 *   direction: 'down'
 * });
 *
 * await gameObjectsManager.add(knight);
 *
 * // Control the character
 * const animator = knight.getComponent(DirectionalSpriteAnimator);
 * animator.play('walk');
 * animator.setDirection('left');
 * ```
 */
export class CharacterSprite extends GameObject {
	constructor(config: I_CharacterSpriteConfig) {
		super({ id: config.id });

		const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();
		const definition = registry.get(config.spriteSheetId);

		if (!definition) {
			throw new Error(`[CharacterSprite] Sprite sheet "${config.spriteSheetId}" not found. ` + `Did you forget to register it? Available: [${registry.getIds().join(", ")}]`);
		}

		const spriteConfig = registry.getSpriteConfig(config.spriteSheetId);
		if (!spriteConfig) {
			throw new Error(`[CharacterSprite] Could not build sprite config for "${config.spriteSheetId}"`);
		}

		// Use extended animations for multi-texture support
		const animations = registry.buildAnimations(config.spriteSheetId);
		const position = config.position ?? [0, 0, 0];
		const direction = config.direction ?? "down";
		const defaultAnimation = config.defaultAnimation ?? definition.defaultAnimation ?? "idle";
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
				texture: spriteConfig.texture,
				spriteSheet: spriteConfig.spriteSheet,
				size: spriteConfig.size,
				anchor: spriteConfig.anchor,
			}),
		);

		// Billboard
		this.addComponent(
			new BillboardComponent({
				mode: billboardMode,
			}),
		);

		// Directional Animation (with multi-texture support)
		this.addComponent(
			new DirectionalSpriteAnimator({
				animations,
				defaultAnimation,
				initialDirection: direction,
				preloadTextures: registry.isMultiTexture(config.spriteSheetId),
			}),
		);
	}
}
