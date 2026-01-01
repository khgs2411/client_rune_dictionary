import type { GameObjectType } from "../common/gameobject.types";
import type { AnimationClip, BillboardMode, SpriteDirection } from "../common/sprite.types";
import { TransformComponent } from "../components/entities/TransformComponent";
import { BillboardComponent } from "../components/rendering/BillboardComponent";
import { type I_SpriteAnimatorConfig, SpriteAnimatorComponent } from "../components/rendering/SpriteAnimatorComponent";
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
	animations?: AnimationClip[];

	// === Shared options ===

	/** Default animation to play on init */
	defaultAnimation?: string;
	/** Initial sprite direction */
	direction?: SpriteDirection;
	/** Which direction the sprite natively faces */
	nativeFacing?: "left" | "right";
	/** Billboard mode (default: 'cylindrical') */
	billboardMode?: BillboardMode;

	// === Pass-through to SpriteAnimatorComponent ===

	/**
	 * Additional animator config (passed through to SpriteAnimatorComponent).
	 * Use this for movement tracking, custom animation mapping, etc.
	 *
	 * @example Movement tracking
	 * ```typescript
	 * animatorConfig: {
	 *   movementSource: characterController,
	 *   idleAnimation: "idle",
	 *   walkAnimation: "walk",
	 *   nativeFacing: "right",
	 * }
	 * ```
	 */
	animatorConfig?: Partial<I_SpriteAnimatorConfig>;
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
/** Resolved sprite configuration used internally */
interface I_ResolvedSpriteConfig {
	texture: string;
	spriteSheet?: { columns: number; rows: number };
	size: [number, number];
	anchor: [number, number];
	animations?: AnimationClip[];
}

export class SpriteGameObject extends GameObject {
	constructor(config: I_SpriteGameObjectConfig) {
		super({ id: config.id, type: config.type });
		let resolved: I_ResolvedSpriteConfig | null = null;

		// Resolve sprite configuration from registry or direct config
		if (config.spriteSheetId) {
			resolved = this.buildFromSpriteSheetRegistry(config);
		} else if (config.texture) {
			resolved = this.buildFromTexture(config);
		}

		if (!resolved) {
			throw new Error(`[SpriteGameObject] Either "spriteSheetId" or "texture" is required.`);
		}

		// Transform
		this.addComponent(
			new TransformComponent({
				position: config.position ?? [0, 0, 0],
			}),
		);

		// Sprite
		this.addComponent(
			new SpriteComponent({
				texture: resolved.texture,
				spriteSheet: resolved.spriteSheet,
				size: resolved.size,
				anchor: resolved.anchor,
			}),
		);

		// Billboard
		this.addComponent(
			new BillboardComponent({
				mode: config.billboardMode ?? "cylindrical",
			}),
		);

		// Animation (only add if animations exist - skip for static sprites)
		if (resolved.animations && resolved.animations.length > 0) {
			this.addComponent(
				new SpriteAnimatorComponent({
					animations: resolved.animations,
					defaultAnimation: config.defaultAnimation,
					initialDirection: config.direction,
					nativeFacing: config.nativeFacing,
					...config.animatorConfig,
				}),
			);
		}
	}

	/** Build sprite config from SpriteSheetRegistry (preferred) */
	private buildFromSpriteSheetRegistry(config: I_SpriteGameObjectConfig): I_ResolvedSpriteConfig {
		const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();
		const spriteConfig = registry.getSpriteConfig(config.spriteSheetId!);

		if (!spriteConfig) {
			throw new Error(`[SpriteGameObject] Sprite sheet "${config.spriteSheetId}" not found. ` + `Available: [${registry.getIds().join(", ")}]`);
		}

		const builtAnimations = registry.buildAnimations(config.spriteSheetId!, config.direction);

		return {
			texture: spriteConfig.texture,
			spriteSheet: spriteConfig.spriteSheet,
			size: config.size ?? spriteConfig.size,
			anchor: spriteConfig.anchor,
			animations: builtAnimations.length > 0 ? builtAnimations : undefined,
		};
	}

	/** Build sprite config from direct texture path (fallback) */
	private buildFromTexture(config: I_SpriteGameObjectConfig): I_ResolvedSpriteConfig {
		return {
			texture: config.texture!,
			spriteSheet: config.spriteSheet,
			size: config.size ?? [1, 1],
			anchor: config.anchor ?? [0.5, 0],
			animations: config.animations,
		};
	}
}
