import type { GameObjectType } from "../common/gameobject.types";
import type { BillboardMode, I_AnimationDefinition } from "../common/sprite.types";
import type { SpriteDirection } from "../common/spritesheet.types";
import { TransformComponent } from "../components/entities/TransformComponent";
import { BillboardComponent } from "../components/rendering/BillboardComponent";
import { SpriteAnimatorComponent } from "../components/rendering/SpriteAnimatorComponent";
import { SpriteComponent } from "../components/rendering/SpriteComponent";
import { GameObject } from "../GameObject";
import { SpriteSheetRegistry } from "../SpriteSheetRegistry";

/**
 * Configuration for SpriteGameObject prefab
 */
export interface I_SpriteGameObjectConfig {
	id: string;
	type?: GameObjectType;
	position?: [number, number, number];

	// === Sprite Source (choose one) ===

	/** Registry-based sprite (preferred) - looks up config from SpriteSheetRegistry */
	spriteSheetId?: string;

	/** Direct texture path (fallback for non-registry sprites) */
	texture?: string;

	// === Override options (used with either mode) ===
	/** Size override [width, height]. With spriteSheetId: overrides registry size. */
	size?: [number, number];

	// === Only used with direct texture mode ===
	spriteSheet?: { columns: number; rows: number };
	anchor?: [number, number];
	animations?: I_AnimationDefinition[];

	// === Shared options ===

	/** Default animation to play on init */
	defaultAnimation?: string;
	/** Initial sprite direction */
	direction?: SpriteDirection;
	/** Which direction the sprite natively faces */
	nativeFacing?: "left" | "right";
	/** Billboard mode (default: 'cylindrical') */
	billboardMode?: BillboardMode;
}

/**
 * SpriteGameObject - Base prefab for all sprite-based game entities
 *
 * Combines TransformComponent, SpriteComponent, BillboardComponent,
 * and optionally SpriteAnimatorComponent for a complete sprite entity.
 *
 * Supports two modes:
 * 1. Registry-based (preferred): Use `spriteSheetId` to lookup config from SpriteSheetRegistry
 * 2. Direct config (fallback): Provide `texture` and other sprite config directly
 *
 * Usage with registry (preferred):
 * ```typescript
 * const tree = new SpriteGameObject({
 *   id: 'tree-1',
 *   position: [5, 0, 3],
 *   spriteSheetId: 'tree-00',
 * });
 * ```
 *
 * Usage with direct config:
 * ```typescript
 * const sprite = new SpriteGameObject({
 *   id: 'custom-sprite',
 *   position: [0, 0, 0],
 *   texture: '/assets/sprites/custom.png',
 *   size: [1, 1.5],
 * });
 * ```
 *
 * For animated sprites, control via SpriteAnimatorComponent:
 * ```typescript
 * const anim = sprite.getComponent(SpriteAnimatorComponent);
 * anim?.play('walk');
 * ```
 */
export class SpriteGameObject extends GameObject {
	constructor(config: I_SpriteGameObjectConfig) {
		super({ id: config.id, type: config.type });

		// Resolve sprite configuration from registry or direct config
		let texture: string;
		let spriteSheet: { columns: number; rows: number } | undefined;
		let size: [number, number];
		let anchor: [number, number];
		let animations: I_AnimationDefinition[] | undefined;

		if (config.spriteSheetId) {
			// Registry-based (preferred)
			const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();
			const spriteConfig = registry.getSpriteConfig(config.spriteSheetId);

			if (!spriteConfig) {
				throw new Error(`[SpriteGameObject] Sprite sheet "${config.spriteSheetId}" not found. ` + `Available: [${registry.getIds().join(", ")}]`);
			}

			texture = spriteConfig.texture;
			spriteSheet = spriteConfig.spriteSheet;
			size = config.size ?? spriteConfig.size; // Allow size override
			anchor = spriteConfig.anchor;

			// buildAnimations returns empty array for static sprites
			const builtAnimations = registry.buildAnimations(config.spriteSheetId, config.direction);
			animations = builtAnimations.length > 0 ? builtAnimations : undefined;
		} else if (config.texture) {
			// Direct config (fallback)
			texture = config.texture;
			spriteSheet = config.spriteSheet;
			size = config.size ?? [1, 1];
			anchor = config.anchor ?? [0.5, 0];
			animations = config.animations;
		} else {
			throw new Error(`[SpriteGameObject] Either "spriteSheetId" or "texture" is required.`);
		}

		const billboardMode = config.billboardMode ?? "cylindrical";

		// Transform
		this.addComponent(
			new TransformComponent({
				position: config.position ?? [0, 0, 0],
			}),
		);

		// Sprite
		this.addComponent(
			new SpriteComponent({
				texture,
				spriteSheet,
				size,
				anchor,
			}),
		);

		// Billboard
		this.addComponent(
			new BillboardComponent({
				mode: billboardMode,
			}),
		);

		// Animation (only add if animations exist - skip for static sprites)
		if (animations && animations.length > 0) {
			this.addComponent(
				new SpriteAnimatorComponent({
					animations,
					defaultAnimation: config.defaultAnimation,
					initialDirection: config.direction,
					nativeFacing: config.nativeFacing,
				}),
			);
		}
	}
}
