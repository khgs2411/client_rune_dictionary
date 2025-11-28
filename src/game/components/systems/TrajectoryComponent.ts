import { ComponentPriority, GameComponent } from "@/game/GameComponent";
import type { I_SceneContext } from "@/game/common/scenes.types";
import { TransformComponent } from "@/game/components/rendering/TransformComponent";
import { Vector3 } from "three";

export interface I_TrajectoryConfig {
	startPosition: [number, number, number];
	endPosition: [number, number, number];

	// Movement timing (provide ONE of these)
	duration?: number; // Duration in seconds (auto-calculates speed)
	speed?: number; // Units per second (calculates duration based on distance)

	// Callbacks
	onComplete?: () => void; // Called when trajectory reaches end
	onProgress?: (progress: number) => void; // Called each frame with progress (0-1)

	// Options
	autoStart?: boolean; // Start moving immediately (default: true)
	loop?: boolean; // Loop back to start when complete (default: false)
	pingPong?: boolean; // Reverse direction when complete (default: false)
}

/**
 * TrajectoryComponent - Moves GameObject from point A to point B
 *
 * This component:
 * - Smoothly interpolates position over time
 * - Supports duration-based OR speed-based movement
 * - Provides progress callbacks
 * - Optional looping/ping-pong
 * - Does NOT handle collision (use CollisionComponent separately)
 *
 * Usage:
 * ```typescript
 * // Duration-based (3 seconds to travel)
 * gameObject.addComponent(new TrajectoryComponent({
 *   startPosition: [0, 1, 0],
 *   endPosition: [10, 1, 0],
 *   duration: 3, // 3 seconds
 *   onComplete: () => console.log('Arrived!')
 * }));
 *
 * // Speed-based (5 units/second)
 * gameObject.addComponent(new TrajectoryComponent({
 *   startPosition: [0, 1, 0],
 *   endPosition: [10, 1, 0],
 *   speed: 5, // Will take 2 seconds (distance 10 / speed 5)
 * }));
 * ```
 *
 * Dependencies:
 * - Requires TransformComponent
 */
export class TrajectoryComponent extends GameComponent {
	public readonly priority = ComponentPriority.DEFAULT;

	private config: I_TrajectoryConfig;

	// Internal state
	private startPos = new Vector3();
	private endPos = new Vector3();
	private currentPos = new Vector3();
	private direction = new Vector3();
	private distance = 0;
	private duration = 0;
	private speed = 0;

	// Progress tracking
	private elapsed = 0;
	private progress = 0; // 0 to 1
	private isActive = false;
	private isComplete = false;
	private isPingPongReverse = false;

	constructor(config: I_TrajectoryConfig) {
		super();
		this.config = config;

		// Validate config
		if (!config.duration && !config.speed) {
			throw new Error("[TrajectoryComponent] Must provide either duration OR speed in config");
		}

		if (config.duration && config.speed) {
			console.warn("[TrajectoryComponent] Both duration and speed provided. Using duration.");
		}
	}

	async init(context: I_SceneContext): Promise<void> {
		// Verify TransformComponent exists
		this.requireComponent(TransformComponent);

		// Calculate trajectory parameters
		this.calculateTrajectory();

		// Auto-start if enabled (default: true)
		if (this.config.autoStart !== false) {
			this.start();
		}
	}

	/**
	 * Calculate trajectory parameters based on config
	 * @private
	 */
	private calculateTrajectory(): void {
		// Set positions
		this.startPos.set(...this.config.startPosition);
		this.endPos.set(...this.config.endPosition);
		this.currentPos.copy(this.startPos);

		// Calculate distance and direction
		this.distance = this.startPos.distanceTo(this.endPos);
		this.direction.subVectors(this.endPos, this.startPos).normalize();

		// Calculate speed/duration
		if (this.config.duration) {
			// Duration provided → calculate speed
			this.duration = this.config.duration;
			this.speed = this.distance / this.duration;
		} else if (this.config.speed) {
			// Speed provided → calculate duration
			this.speed = this.config.speed;
			this.duration = this.distance / this.speed;
		}

		// Edge case: zero distance
		if (this.distance === 0) {
			console.warn("[TrajectoryComponent] Start and end positions are identical");
			this.isComplete = true;
		}
	}

	/**
	 * Start/resume trajectory movement
	 */
	public start(): void {
		if (this.isComplete && !this.config.loop && !this.config.pingPong) {
			console.warn("[TrajectoryComponent] Trajectory already complete");
			return;
		}

		this.isActive = true;
	}

	/**
	 * Pause trajectory movement
	 */
	public pause(): void {
		this.isActive = false;
	}

	/**
	 * Reset trajectory to start
	 */
	public reset(): void {
		this.elapsed = 0;
		this.progress = 0;
		this.isComplete = false;
		this.isPingPongReverse = false;
		this.currentPos.copy(this.startPos);

		const transform = this.getComponent(TransformComponent);
		if (transform) {
			transform.position.copy(this.currentPos);
		}
	}

	/**
	 * Set new target position (recalculates trajectory)
	 */
	public setTarget(x: number, y: number, z: number): void {
		this.config.endPosition = [x, y, z];
		this.config.startPosition = [this.currentPos.x, this.currentPos.y, this.currentPos.z];
		this.elapsed = 0;
		this.progress = 0;
		this.isComplete = false;
		this.calculateTrajectory();
	}

	update(delta: number): void {
		if (!this.isActive || this.isComplete) return;

		const transform = this.getComponent(TransformComponent);
		if (!transform) return;

		// Update elapsed time
		this.elapsed += delta;

		// Calculate progress (0 to 1)
		this.progress = Math.min(this.elapsed / this.duration, 1);

		// Determine positions based on ping-pong state
		const start = this.isPingPongReverse ? this.endPos : this.startPos;
		const end = this.isPingPongReverse ? this.startPos : this.endPos;

		// Interpolate position (lerp)
		this.currentPos.lerpVectors(start, end, this.progress);

		// Apply to transform
		transform.position.copy(this.currentPos);

		// Progress callback
		if (this.config.onProgress) {
			this.config.onProgress(this.progress);
		}

		// Check if reached end
		if (this.progress >= 1) {
			this.handleComplete();
		}
	}

	/**
	 * Handle trajectory completion
	 * @private
	 */
	private handleComplete(): void {
		// Ping-pong mode
		if (this.config.pingPong) {
			this.isPingPongReverse = !this.isPingPongReverse;
			this.elapsed = 0;
			this.progress = 0;
			// Keep active, don't mark complete
			return;
		}

		// Loop mode
		if (this.config.loop) {
			this.reset();
			this.isActive = true;
			return;
		}

		// Single trajectory - complete
		this.isComplete = true;
		this.isActive = false;

		// Completion callback
		if (this.config.onComplete) {
			this.config.onComplete();
		}
	}

	/**
	 * Check if trajectory is currently moving
	 */
	public isMoving(): boolean {
		return this.isActive && !this.isComplete;
	}

	/**
	 * Get current progress (0-1)
	 */
	public getProgress(): number {
		return this.progress;
	}

	/**
	 * Get current direction vector
	 */
	public getDirection(): Vector3 {
		return this.direction.clone();
	}

	/**
	 * Get remaining distance
	 */
	public getRemainingDistance(): number {
		return this.currentPos.distanceTo(this.isPingPongReverse ? this.startPos : this.endPos);
	}

	/**
	 * Get remaining time
	 */
	public getRemainingTime(): number {
		return (1 - this.progress) * this.duration;
	}

	destroy(): void {
		this.isActive = false;
		this.isComplete = true;
	}
}
