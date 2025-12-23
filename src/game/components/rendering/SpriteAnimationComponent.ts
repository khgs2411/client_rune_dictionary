import type { I_SceneContext } from "../../common/scenes.types";
import type { I_AnimationDefinition, I_SpriteAnimationComponentConfig } from "../../common/sprite.types";
import { ComponentPriority, GameComponent } from "../../GameComponent";
import { SpriteComponent } from "./SpriteComponent";

/**
 * SpriteAnimationComponent - Manages frame-based sprite animations
 *
 * Features:
 * - Multiple named animations per sprite (idle, walk, attack, etc.)
 * - Configurable FPS per animation
 * - Looping and one-shot modes
 * - Frame-rate independent timing using accumulator pattern
 * - Runtime animation switching
 *
 * Requires SpriteComponent with sprite sheet configuration.
 *
 * Usage:
 * ```typescript
 * new GameObject({ id: 'player' })
 *   .addComponent(new TransformComponent({ position: [0, 0, 0] }))
 *   .addComponent(new SpriteComponent({
 *     texture: '/player.png',
 *     spriteSheet: { columns: 8, rows: 4 },
 *     size: [1, 1.5]
 *   }))
 *   .addComponent(new BillboardComponent({ mode: 'cylindrical' }))
 *   .addComponent(new SpriteAnimationComponent({
 *     animations: [
 *       { name: 'idle', startFrame: 0, endFrame: 3, fps: 6 },
 *       { name: 'walk', startFrame: 8, endFrame: 15, fps: 12 },
 *       { name: 'attack', startFrame: 16, endFrame: 23, fps: 16, loop: false }
 *     ],
 *     defaultAnimation: 'idle'
 *   }));
 * ```
 */
export class SpriteAnimationComponent extends GameComponent {
	// Priority: runs after BillboardComponent (101)
	public readonly priority = ComponentPriority.RENDERING + 2; // 102

	private config: I_SpriteAnimationComponentConfig;
	private spriteComponent: SpriteComponent | null = null;

	// Animation state
	private animations: Map<string, I_AnimationDefinition> = new Map();
	private currentAnimation: I_AnimationDefinition | null = null;
	private currentFrame = 0;
	private isPlaying = false;
	private isPaused = false;

	// Timing
	private accumulator = 0;
	private frameDuration = 0; // Seconds per frame (1/fps)

	constructor(config: I_SpriteAnimationComponentConfig) {
		super();
		this.config = config;

		// Pre-populate animations map
		for (const anim of config.animations) {
			this.animations.set(anim.name, anim);
		}
	}

	async init(context: I_SceneContext): Promise<void> {
		// Get required SpriteComponent
		this.spriteComponent = this.getComponent(SpriteComponent);
		if (!this.spriteComponent) {
			throw new Error(`[SpriteAnimationComponent] SpriteComponent required on GameObject "${this.gameObject.id}"`);
		}

		// Auto-play default animation if specified
		if (this.config.defaultAnimation) {
			this.play(this.config.defaultAnimation);
		}
	}

	/**
	 * Update animation frame based on elapsed time
	 */
	update(delta: number): void {
		if (!this.isPlaying || this.isPaused || !this.currentAnimation || !this.spriteComponent) {
			return;
		}

		// Accumulate time
		this.accumulator += delta;

		// Check if we should advance frame
		while (this.accumulator >= this.frameDuration) {
			this.accumulator -= this.frameDuration;
			this.advanceFrame();
		}
	}

	/**
	 * Advance to next frame
	 */
	private advanceFrame(): void {
		if (!this.currentAnimation) return;

		const { startFrame, endFrame, loop, onComplete } = this.currentAnimation;
		const frameCount = endFrame - startFrame + 1;

		// Move to next frame
		this.currentFrame++;

		if (this.currentFrame >= frameCount) {
			if (loop !== false) {
				// Loop back to start
				this.currentFrame = 0;
			} else {
				// Stop at last frame
				this.currentFrame = frameCount - 1;
				this.isPlaying = false;

				// Fire completion callback
				if (onComplete) {
					onComplete();
				}
				return;
			}
		}

		// Apply frame to sprite
		const actualFrame = startFrame + this.currentFrame;
		this.spriteComponent!.setFrame(actualFrame);
	}

	/**
	 * Play an animation by name
	 */
	play(name: string): void {
		const anim = this.animations.get(name);
		if (!anim) {
			console.warn(`[SpriteAnimationComponent] Animation "${name}" not found on "${this.gameObject.id}"`);
			return;
		}

		// Don't restart if already playing this animation
		if (this.currentAnimation?.name === name && this.isPlaying && !this.isPaused) {
			return;
		}

		this.currentAnimation = anim;
		this.currentFrame = 0;
		this.accumulator = 0;
		this.frameDuration = 1 / anim.fps;
		this.isPlaying = true;
		this.isPaused = false;

		// Set initial frame
		this.spriteComponent?.setFrame(anim.startFrame);
	}

	/**
	 * Stop animation (resets to first frame of current animation)
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
	 * Pause animation (can be resumed)
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
	 * Get current animation name
	 */
	getCurrentAnimation(): string | null {
		return this.currentAnimation?.name ?? null;
	}

	/**
	 * Get current frame index within current animation
	 */
	getCurrentFrame(): number {
		return this.currentFrame;
	}

	/**
	 * Get absolute frame index (in sprite sheet)
	 */
	getAbsoluteFrame(): number {
		if (!this.currentAnimation) return 0;
		return this.currentAnimation.startFrame + this.currentFrame;
	}

	/**
	 * Add a new animation at runtime
	 */
	addAnimation(definition: I_AnimationDefinition): void {
		if (this.animations.has(definition.name)) {
			console.warn(`[SpriteAnimationComponent] Overwriting animation "${definition.name}"`);
		}
		this.animations.set(definition.name, definition);
	}

	/**
	 * Remove an animation
	 */
	removeAnimation(name: string): void {
		// Stop if currently playing this animation
		if (this.currentAnimation?.name === name) {
			this.stop();
			this.currentAnimation = null;
		}
		this.animations.delete(name);
	}

	/**
	 * Check if animation exists
	 */
	hasAnimation(name: string): boolean {
		return this.animations.has(name);
	}

	/**
	 * Get all animation names
	 */
	getAnimationNames(): string[] {
		return Array.from(this.animations.keys());
	}
}
