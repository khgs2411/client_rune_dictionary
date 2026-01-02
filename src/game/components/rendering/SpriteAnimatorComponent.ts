import type { I_SceneContext } from "../../common/scenes.types";
import type { AnimationClip, SpriteDirection } from "../../common/sprite.types";
import { ComponentPriority, GameComponent } from "../../GameComponent";
import { SpriteComponent } from "./SpriteComponent";

/**
 * Position provider interface for movement tracking
 */
export interface I_PositionProvider {
	getPosition: () => { x: number; y: number; z: number };
}

/**
 * Configuration for SpriteAnimatorComponent
 */
export interface I_SpriteAnimatorConfig {
	/** Animation clips (from SpriteSheetRegistry.buildAnimations or buildExtendedAnimations) */
	animations: AnimationClip[];

	/** Default animation name (without direction suffix) */
	defaultAnimation?: string;

	/** Initial direction */
	initialDirection?: SpriteDirection;

	/** Available directions in this sprite sheet */
	directions?: SpriteDirection[];

	/**
	 * Preload all textures on init (recommended for multi-texture)
	 * Default: true if any animation has texturePath
	 */
	preloadTextures?: boolean;

	// === Animation Selection ===

	/**
	 * Callback that returns the animation name to play each frame.
	 * Gives full control over animation selection logic.
	 *
	 * @example
	 * ```typescript
	 * animationResolver: () => {
	 *   if (controller.isJumping.value) return "jump";
	 *   if (controller.isCasting) return "cast";
	 *   return controller.isMoving() ? "walk" : "idle";
	 * }
	 * ```
	 */
	animationResolver?: () => string | null;

	// === Direction Auto-Detection (optional) ===

	/**
	 * Position provider for automatic sprite flip (facing direction).
	 * Tracks horizontal movement to flip sprite left/right.
	 * Does NOT control animation selection - use animationResolver for that.
	 */
	movementSource?: I_PositionProvider;

	/**
	 * @deprecated Use animationResolver instead.
	 * Animation to play when not moving (default: 'idle')
	 */
	idleAnimation?: string;

	/**
	 * @deprecated Use animationResolver instead.
	 * Animation to play when moving (default: 'walk')
	 */
	walkAnimation?: string;

	/** Movement threshold for detecting motion (default: 0.1) */
	movementThreshold?: number;

	/**
	 * Which direction the sprite natively faces.
	 * Used for automatic flip when moving opposite direction.
	 * Default: 'right' (flip when moving left)
	 */
	nativeFacing?: "left" | "right";
}

/**
 * SpriteAnimatorComponent - Enhanced animation component for sprite-based entities
 *
 * Handles both simple and direction-based animation switching.
 * Automatically switches between directional variants (e.g., 'walk-down', 'walk-left')
 * when direction changes.
 *
 * Features:
 * - Automatic direction suffixing ('walk' + 'down' = 'walk-down')
 * - Direction can be changed at runtime without restarting animation
 * - Falls back to base animation if directional variant not found
 * - Maintains animation progress when only direction changes
 * - Multi-texture support: automatically swaps textures when animation changes
 * - Optional movement tracking for auto idle/walk switching
 *
 * Simple usage (no directions):
 * ```typescript
 * new GameObject({ id: 'tree' })
 *   .addComponent(new SpriteComponent({ texture: '/tree.png', spriteSheet: { columns: 4, rows: 1 } }))
 *   .addComponent(new SpriteAnimatorComponent({
 *     animations: [{ name: 'sway', startFrame: 0, endFrame: 3, fps: 4, loop: true }],
 *     defaultAnimation: 'sway'
 *   }));
 * ```
 *
 * Directional usage:
 * ```typescript
 * new GameObject({ id: 'player' })
 *   .addComponent(new SpriteComponent({ texture: '/player.png', spriteSheet: { columns: 6, rows: 8 } }))
 *   .addComponent(new SpriteAnimatorComponent({
 *     animations: SpriteSheetRegistry.getInstance().buildAnimations('player'),
 *     defaultAnimation: 'idle',
 *     initialDirection: 'down'
 *   }));
 * ```
 *
 * With movement tracking:
 * ```typescript
 * new SpriteAnimatorComponent({
 *   animations,
 *   movementSource: characterController,
 *   idleAnimation: 'idle',
 *   walkAnimation: 'walk',
 *   nativeFacing: 'right'
 * });
 * ```
 */
export class SpriteAnimatorComponent extends GameComponent {
	public readonly priority = ComponentPriority.RENDERING + 2; // 102

	private config: I_SpriteAnimatorConfig;
	private spriteComponent: SpriteComponent | null = null;

	// Animation registry
	private animations: Map<string, AnimationClip> = new Map();
	private availableDirections: Set<SpriteDirection> = new Set();

	// Current state
	private currentBaseAnimation: string | null = null;
	private currentDirection: SpriteDirection = "down";
	private currentAnimation: AnimationClip | null = null;
	private currentFrame = 0;
	private isPlaying = false;
	private isPaused = false;

	// Timing
	private accumulator = 0;
	private frameDuration = 0;

	// Multi-texture tracking
	private currentTexturePath: string | null = null;
	private hasMultipleTextures = false;

	// Flip state for direction fallback (e.g., using 'right' sprite flipped for 'left')
	private currentFlipX = false;

	// Animation resolver (new way - full control)
	private animationResolver: (() => string | null) | null = null;
	private lastResolvedAnimation: string | null = null;

	// Movement tracking state (for direction flip)
	private movementSource: I_PositionProvider | null = null;
	private lastPositionX = 0;
	private lastPositionZ = 0;
	private nativeFacingLeft = false; // Default: sprite faces right
	private movementFlipState = false; // Separate flip state for movement tracking

	// Legacy movement tracking (deprecated - use animationResolver instead)
	private useLegacyMovementTracking = false;
	private isMoving = false;
	private idleAnimation = "idle";
	private walkAnimation = "walk";
	private movementThreshold = 0.1;

	constructor(config: I_SpriteAnimatorConfig) {
		super();
		this.config = config;
		this.currentDirection = config.initialDirection ?? "down";

		// Build animation lookup map
		for (const anim of config.animations) {
			this.animations.set(anim.name, anim);

			// Track if we have multiple textures
			if (anim.texturePath) {
				this.hasMultipleTextures = true;
			}

			// Extract direction from name if present
			const parts = anim.name.split("-");
			if (parts.length > 1) {
				const possibleDir = parts[parts.length - 1] as SpriteDirection;
				if (this.isValidDirection(possibleDir)) {
					this.availableDirections.add(possibleDir);
				}
			}
		}

		// Override with config directions if provided
		if (config.directions) {
			this.availableDirections = new Set(config.directions);
		}

		// Initialize animation resolver (new way)
		if (config.animationResolver) {
			this.animationResolver = config.animationResolver;
		}

		// Initialize movement source for direction flip
		if (config.movementSource) {
			this.movementSource = config.movementSource;
			this.nativeFacingLeft = config.nativeFacing === "left";
			this.movementThreshold = config.movementThreshold ?? 0.1;

			// Legacy mode: use movement for animation selection (when no resolver)
			if (!config.animationResolver) {
				this.useLegacyMovementTracking = true;
				this.idleAnimation = config.idleAnimation ?? "idle";
				this.walkAnimation = config.walkAnimation ?? "walk";
			}
		}
	}

	private isValidDirection(dir: string): dir is SpriteDirection {
		return ["down", "left", "right", "up", "down-left", "down-right", "up-left", "up-right"].includes(dir);
	}

	/**
	 * Find the best animation for a given base name and direction
	 * Implements smart direction fallback with flip support:
	 * 1. Try exact match: 'walk-{dir}'
	 * 2. If 'left' not found, try 'right' with flipX
	 * 3. If 'right' not found, try 'left' with flipX
	 * 4. Fall back to base animation name
	 *
	 * @returns { anim, flipX } or null if not found
	 */
	private resolveAnimation(baseName: string, direction: SpriteDirection): { anim: AnimationClip; flipX: boolean } | null {
		// 1. Try exact directional match
		const directionalName = `${baseName}-${direction}`;
		const exactMatch = this.animations.get(directionalName);
		if (exactMatch) {
			return { anim: exactMatch, flipX: false };
		}

		// 2. Try flip fallback for left/right
		if (direction === "left") {
			const rightAnim = this.animations.get(`${baseName}-right`);
			if (rightAnim) {
				return { anim: rightAnim, flipX: true };
			}
		} else if (direction === "right") {
			const leftAnim = this.animations.get(`${baseName}-left`);
			if (leftAnim) {
				return { anim: leftAnim, flipX: true };
			}
		}

		// 3. Try diagonal fallbacks
		if (direction === "down-left") {
			const downRight = this.animations.get(`${baseName}-down-right`);
			if (downRight) return { anim: downRight, flipX: true };
		} else if (direction === "down-right") {
			const downLeft = this.animations.get(`${baseName}-down-left`);
			if (downLeft) return { anim: downLeft, flipX: true };
		} else if (direction === "up-left") {
			const upRight = this.animations.get(`${baseName}-up-right`);
			if (upRight) return { anim: upRight, flipX: true };
		} else if (direction === "up-right") {
			const upLeft = this.animations.get(`${baseName}-up-left`);
			if (upLeft) return { anim: upLeft, flipX: true };
		}

		// 4. Fall back to base animation (no direction suffix)
		const baseAnim = this.animations.get(baseName);
		if (baseAnim) {
			return { anim: baseAnim, flipX: false };
		}

		return null;
	}

	async init(context: I_SceneContext): Promise<void> {
		this.spriteComponent = this.getComponent(SpriteComponent);
		if (!this.spriteComponent) {
			throw new Error(`[SpriteAnimatorComponent] SpriteComponent required on GameObject "${this.gameObject.id}"`);
		}

		// Preload all textures if multi-texture
		const shouldPreload = this.config.preloadTextures ?? this.hasMultipleTextures;
		if (shouldPreload) {
			await this.preloadAllTextures();
		}

		// Track initial texture
		this.currentTexturePath = this.spriteComponent.getCurrentTexturePath();

		// Initialize movement source position tracking (for direction flip)
		if (this.movementSource) {
			const pos = this.movementSource.getPosition();
			this.lastPositionX = pos.x;
			this.lastPositionZ = pos.z;
		}

		// Determine initial animation
		if (this.animationResolver) {
			// Let resolver decide the first animation
			const resolved = this.animationResolver();
			if (resolved) {
				this.lastResolvedAnimation = resolved;
				this.play(resolved);
			}
		} else if (this.useLegacyMovementTracking) {
			// Legacy mode: start with idle animation
			this.play(this.idleAnimation);
		} else if (this.config.defaultAnimation) {
			// Auto-play default animation
			this.play(this.config.defaultAnimation);
		}
	}

	/**
	 * Preload all unique textures used by animations
	 */
	private async preloadAllTextures(): Promise<void> {
		if (!this.spriteComponent) return;

		const uniquePaths = new Set<string>();
		for (const anim of this.animations.values()) {
			if (anim.texturePath) {
				uniquePaths.add(anim.texturePath);
			}
		}

		if (uniquePaths.size > 0) {
			await this.spriteComponent.preloadTextures(Array.from(uniquePaths));
		}
	}

	update(delta: number): void {
		// Handle animation resolver (new way - full control)
		if (this.animationResolver && this.spriteComponent) {
			const resolved = this.animationResolver();
			if (resolved && resolved !== this.lastResolvedAnimation) {
				this.lastResolvedAnimation = resolved;
				this.play(resolved);
			}
		}

		// Handle direction auto-detection from movement source
		if (this.movementSource && this.spriteComponent) {
			this.updateDirectionTracking(delta);
		}

		// Handle animation frame advancement
		if (!this.isPlaying || this.isPaused || !this.currentAnimation || !this.spriteComponent) {
			return;
		}

		this.accumulator += delta;

		while (this.accumulator >= this.frameDuration) {
			this.accumulator -= this.frameDuration;
			this.advanceFrame();
		}
	}

	/**
	 * Track position changes for direction flip (and legacy animation selection)
	 */
	private updateDirectionTracking(delta: number): void {
		if (!this.movementSource || !this.spriteComponent) return;

		const pos = this.movementSource.getPosition();

		// Calculate movement delta since last frame
		const deltaX = pos.x - this.lastPositionX;
		const deltaZ = pos.z - this.lastPositionZ;

		// Update last position for next frame
		this.lastPositionX = pos.x;
		this.lastPositionZ = pos.z;

		// Calculate movement magnitude
		const movementMagnitude = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
		const nowMoving = movementMagnitude > this.movementThreshold * delta;

		// Update desired flip state based on movement direction
		if (nowMoving && Math.abs(deltaX) > 0.01) {
			const movingLeft = deltaX < 0;
			// If sprite natively faces left: flip when moving right
			// If sprite natively faces right: flip when moving left
			this.movementFlipState = this.nativeFacingLeft ? !movingLeft : movingLeft;
		}

		// Legacy mode: update animation based on movement (deprecated)
		if (this.useLegacyMovementTracking && nowMoving !== this.isMoving) {
			this.isMoving = nowMoving;
			this.play(nowMoving ? this.walkAnimation : this.idleAnimation);
		}

		// Always apply movement-based flip AFTER play() to override direction-based flip
		// Use movementFlipState which is independent of play()'s flip logic
		if (this.movementFlipState !== this.currentFlipX) {
			this.currentFlipX = this.movementFlipState;
			this.spriteComponent.setFlipX(this.movementFlipState);
		}
	}

	private advanceFrame(): void {
		if (!this.currentAnimation) return;

		const { startFrame, endFrame, loop, onComplete } = this.currentAnimation;
		const frameCount = endFrame - startFrame + 1;

		this.currentFrame++;

		if (this.currentFrame >= frameCount) {
			if (loop !== false) {
				this.currentFrame = 0;
			} else {
				this.currentFrame = frameCount - 1;
				this.isPlaying = false;
				if (onComplete) onComplete();
				return;
			}
		}

		const actualFrame = startFrame + this.currentFrame;
		this.spriteComponent!.setFrame(actualFrame);
	}

	/**
	 * Play an animation by base name
	 *
	 * Automatically appends current direction to find the correct variant.
	 * Falls back to base animation if directional variant not found.
	 * Uses flip fallback for left/right mirroring when direction not available.
	 * For multi-texture sprites, automatically swaps texture if needed.
	 *
	 * @param baseName - Animation name without direction (e.g., 'walk', 'idle')
	 */
	play(baseName: string): void {
		// Resolve animation with direction and flip fallback
		const resolved = this.resolveAnimation(baseName, this.currentDirection);

		if (!resolved) {
			console.warn(`[SpriteAnimatorComponent] Animation "${baseName}" not found on "${this.gameObject.id}"`);
			return;
		}

		const { anim, flipX } = resolved;

		// Don't restart if already playing this exact animation with same flip state
		if (this.currentAnimation?.name === anim.name && this.currentFlipX === flipX && this.isPlaying && !this.isPaused) {
			return;
		}

		// Apply flip state if changed
		if (flipX !== this.currentFlipX) {
			this.currentFlipX = flipX;
			this.spriteComponent?.setFlipX(flipX);
		}

		// Swap texture if needed (multi-texture support)
		if (anim.texturePath && anim.texturePath !== this.currentTexturePath) {
			const swapped = this.spriteComponent!.swapTextureSync(anim.texturePath);
			if (swapped) {
				this.currentTexturePath = anim.texturePath;
			} else {
				// Texture not preloaded, try async swap
				this.spriteComponent!.swapTexture(anim.texturePath).then(() => {
					this.currentTexturePath = anim.texturePath!;
				});
			}
		}

		this.currentBaseAnimation = baseName;
		this.currentAnimation = anim;
		this.currentFrame = 0;
		this.accumulator = 0;
		this.frameDuration = 1 / anim.fps;
		this.isPlaying = true;
		this.isPaused = false;

		this.spriteComponent?.setFrame(anim.startFrame);
	}

	/**
	 * Set the current facing direction
	 *
	 * If an animation is playing, it will switch to the directional variant
	 * while attempting to maintain the current frame position.
	 * Uses flip fallback for left/right mirroring when direction not available.
	 * For multi-texture sprites, swaps texture if the new direction uses a different file.
	 *
	 * @param direction - New direction to face
	 */
	setDirection(direction: SpriteDirection): void {
		if (direction === this.currentDirection) return;

		this.currentDirection = direction;

		// If animation is playing, switch to new directional variant
		if (this.currentBaseAnimation && this.isPlaying) {
			const previousFrame = this.currentFrame;
			const previousAccumulator = this.accumulator;

			// Resolve new animation with flip fallback
			const resolved = this.resolveAnimation(this.currentBaseAnimation, direction);
			if (!resolved) return;

			const { anim, flipX } = resolved;

			// Apply flip state if changed
			if (flipX !== this.currentFlipX) {
				this.currentFlipX = flipX;
				this.spriteComponent?.setFlipX(flipX);
			}

			// Only update if animation changed
			if (anim.name !== this.currentAnimation?.name || flipX !== this.currentFlipX) {
				// Swap texture if needed
				if (anim.texturePath && anim.texturePath !== this.currentTexturePath) {
					const swapped = this.spriteComponent!.swapTextureSync(anim.texturePath);
					if (swapped) {
						this.currentTexturePath = anim.texturePath;
					}
				}

				this.currentAnimation = anim;
				this.frameDuration = 1 / anim.fps;

				// Try to maintain frame position if frame counts match
				const newFrameCount = anim.endFrame - anim.startFrame + 1;
				if (previousFrame < newFrameCount) {
					this.currentFrame = previousFrame;
					this.accumulator = previousAccumulator;
				} else {
					this.currentFrame = 0;
					this.accumulator = 0;
				}

				const actualFrame = anim.startFrame + this.currentFrame;
				this.spriteComponent?.setFrame(actualFrame);
			}
		}
	}

	/**
	 * Get current direction
	 */
	getDirection(): SpriteDirection {
		return this.currentDirection;
	}

	/**
	 * Get current flip state
	 */
	isFlippedX(): boolean {
		return this.currentFlipX;
	}

	/**
	 * Stop animation and reset
	 */
	stop(): void {
		this.isPlaying = false;
		this.isPaused = false;
		this.currentFrame = 0;
		this.accumulator = 0;

		if (this.currentAnimation) {
			this.spriteComponent?.setFrame(this.currentAnimation.startFrame);
		}
	}

	/**
	 * Pause animation
	 */
	pause(): void {
		this.isPaused = true;
	}

	/**
	 * Resume paused animation
	 */
	resume(): void {
		this.isPaused = false;
	}

	/**
	 * Check if currently playing
	 */
	getIsPlaying(): boolean {
		return this.isPlaying && !this.isPaused;
	}

	/**
	 * Get current base animation name (without direction)
	 */
	getCurrentAnimation(): string | null {
		return this.currentBaseAnimation;
	}

	/**
	 * Get current frame index within animation
	 */
	getCurrentFrame(): number {
		return this.currentFrame;
	}

	/**
	 * Check if animation exists (with any direction)
	 */
	hasAnimation(baseName: string): boolean {
		// Check base name
		if (this.animations.has(baseName)) return true;

		// Check directional variants
		for (const dir of this.availableDirections) {
			if (this.animations.has(`${baseName}-${dir}`)) return true;
		}

		return false;
	}

	/**
	 * Get all available base animation names (without direction suffixes)
	 */
	getAnimationNames(): string[] {
		const baseNames = new Set<string>();

		for (const name of this.animations.keys()) {
			const parts = name.split("-");
			const lastPart = parts[parts.length - 1];

			if (this.isValidDirection(lastPart) && parts.length > 1) {
				baseNames.add(parts.slice(0, -1).join("-"));
			} else {
				baseNames.add(name);
			}
		}

		return Array.from(baseNames);
	}

	/**
	 * Get available directions
	 */
	getAvailableDirections(): SpriteDirection[] {
		return Array.from(this.availableDirections);
	}

	/**
	 * Check if this animator uses multiple textures
	 */
	isMultiTexture(): boolean {
		return this.hasMultipleTextures;
	}

	/**
	 * Set direction from a movement vector
	 *
	 * Converts a 2D movement direction (x, z in world space) to
	 * the nearest cardinal or diagonal direction.
	 *
	 * @param x - Movement in X axis
	 * @param z - Movement in Z axis
	 * @param use8Directions - Use 8 directions instead of 4
	 */
	setDirectionFromVector(x: number, z: number, use8Directions = false): void {
		if (Math.abs(x) < 0.01 && Math.abs(z) < 0.01) return;

		// Add π to account for camera at -Z looking toward +Z
		const angle = Math.atan2(x, z) + Math.PI;

		if (use8Directions) {
			const segment = Math.round((angle + Math.PI) / (Math.PI / 4)) % 8;
			const directions: SpriteDirection[] = ["up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"];
			this.setDirection(directions[segment]);
		} else {
			const segment = Math.round((angle + Math.PI) / (Math.PI / 2)) % 4;
			const directions: SpriteDirection[] = ["up", "right", "down", "left"];
			this.setDirection(directions[segment]);
		}
	}

	// === Movement Tracking API ===

	/**
	 * Set movement source for auto idle/walk switching.
	 *
	 * @deprecated Pass movementSource via constructor config instead.
	 * Use SpriteGameObject's animatorConfig pass-through:
	 * ```typescript
	 * new SpriteGameObject({
	 *   spriteSheetId: "character",
	 *   animatorConfig: {
	 *     movementSource: controller,
	 *     idleAnimation: "idle",
	 *     walkAnimation: "walk",
	 *   },
	 * });
	 * ```
	 *
	 * @param source - Position provider to track (e.g., CharacterController)
	 * @param options - Optional configuration overrides
	 */
	public setMovementSource(
		source: I_PositionProvider,
		options?: {
			idleAnimation?: string;
			walkAnimation?: string;
			movementThreshold?: number;
			nativeFacing?: "left" | "right";
		},
	): void {
		console.warn("[SpriteAnimatorComponent] setMovementSource() is deprecated. Pass movementSource via constructor config instead.");
		this.movementSource = source;
		const pos = source.getPosition();
		this.lastPositionX = pos.x;
		this.lastPositionZ = pos.z;

		if (options?.idleAnimation) this.idleAnimation = options.idleAnimation;
		if (options?.walkAnimation) this.walkAnimation = options.walkAnimation;
		if (options?.movementThreshold) this.movementThreshold = options.movementThreshold;
		if (options?.nativeFacing) this.nativeFacingLeft = options.nativeFacing === "left";

		// Start with idle animation if not already playing something
		if (!this.isPlaying) {
			this.play(this.idleAnimation);
		}
	}

	/**
	 * Check if character is currently moving (only valid when movementSource is configured)
	 */
	getIsMoving(): boolean {
		return this.isMoving;
	}

	/**
	 * Check if movement tracking is enabled
	 */
	hasMovementTracking(): boolean {
		return this.movementSource !== null;
	}
}
