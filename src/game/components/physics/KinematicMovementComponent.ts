import type { I_CharacterControls } from "@/composables/composables.types";
import { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent } from "@/game/GameComponent";
import { E_SceneState, type StateChangeCallback } from "@/game/systems/SceneState";
import { useGameConfigStore } from "@/stores/config.store";
import { KinematicCollisionComponent } from "../physics/KinematicCollisionComponent";
import { TransformComponent } from "./TransformComponent";

export interface I_KinematicMovementConfig {
	characterController: I_CharacterControls; // Scene-owned controller (handles input)
	enableJumping?: boolean; // Default: true
	enableGravity?: boolean; // Default: true
	enableMovement?: boolean; // Default: true (controlled by scene state)
}

/**
 * KinematicMovementComponent - Movement logic for kinematic characters
 *
 * Single responsibility: Handle movement calculations and apply them
 * - Reads DESIRED movement from character controller (input)
 * - Calculates vertical velocity (gravity + jumping)
 * - Uses KinematicPhysicsComponent for collision-aware movement
 * - Updates TransformComponent with final position
 * - Syncs position back to controller (bidirectional)
 * - Reacts to scene state changes to disable movement/jumping during matches
 *
 * Dependencies:
 * - Requires TransformComponent
 * - Requires KinematicPhysicsComponent
 * - Subscribes to SceneStateService for state changes
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new KinematicMovementComponent({
 *   characterController: this.character.controller,
 *   enableJumping: true,
 *   enableGravity: true,
 * }));
 * ```
 *
 * Priority: 300 (INTERACTION) - Runs after physics
 */
export class KinematicMovementComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION; // 300

	private characterController: I_CharacterControls;
	private enableJumping: boolean;
	private enableGravity: boolean;
	private enableMovement: boolean;
	private verticalVelocity = 5;
	private config = useGameConfigStore();
	private kinematicPhysics: KinematicCollisionComponent | null = null;
	private stateChangeCallback: StateChangeCallback | null = null;
	private context: I_SceneContext | null = null;

	constructor(config: I_KinematicMovementConfig) {
		super();
		this.characterController = config.characterController;
		this.enableJumping = config.enableJumping ?? true;
		this.enableGravity = config.enableGravity ?? true;
		this.enableMovement = config.enableMovement ?? true;
	}

	async init(context: I_SceneContext): Promise<void> {
		// Store context for cleanup
		this.context = context;

		// Verify required components
		this.requireComponent(TransformComponent);
		this.kinematicPhysics = this.requireComponent(KinematicCollisionComponent);

		// Register for scene state changes
		const stateService = context.getService("state");
		this.stateChangeCallback = this.onStateChange.bind(this);
		stateService.register(this.stateChangeCallback);
	}

	/**
	 * React to scene state changes - control movement and jumping based on state
	 *
	 * State-based movement rules:
	 * - OVERWORLD: enableMovement=true, enableJumping=true
	 * - MATCH_REQUEST: enableMovement=false, enableJumping=false
	 * - PVE_MATCH/PVP_MATCH: enableMovement=false, enableJumping=false (combat overlay handles visuals)
	 * - MENU: enableMovement=false, enableJumping=false
	 */
	private onStateChange(newState: E_SceneState, oldState: E_SceneState): void {
		switch (newState) {
			case E_SceneState.OVERWORLD:
				this.enableMovement = true;
				this.enableJumping = true;
				console.log("🏃 [KinematicMovementComponent] Movement: ✅ | Jumping: ✅");
				break;

			case E_SceneState.MATCH_REQUEST:
				this.enableMovement = false;
				this.enableJumping = false;
				console.log("🏃 [KinematicMovementComponent] Movement: 🚫 | Jumping: 🚫");
				break;
			case E_SceneState.PVE_MATCH:
			case E_SceneState.PVP_MATCH:
				this.enableMovement = false;
				this.enableJumping = false;
				console.log("🏃 [KinematicMovementComponent] Movement: 🚫 | Jumping: 🚫");
				break;

			case E_SceneState.MENU:
				this.enableMovement = false;
				this.enableJumping = false;
				console.log("🏃 [KinematicMovementComponent] Movement: 🚫 | Jumping: 🚫");
				break;
		}
	}

	update(delta: number): void {
		if (!this.kinematicPhysics) return;

		// Skip movement processing if movement is disabled (e.g., MENU state)
		if (!this.enableMovement) return;

		const currentPos = this.kinematicPhysics.getPosition();
		if (!currentPos) return;

		// Get collision offset (physics body center is at transform + offset)
		const offset = this.kinematicPhysics.getCollisionOffset();

		// Handle vertical velocity (gravity + jumping)
		if (this.enableJumping) {
			this.handleJumping(delta);
		}

		// Calculate desired horizontal movement (from character controller)
		// Character controller is at transform level, currentPos is at physics body level
		// So we need to add offset to get the desired physics body position
		const desiredMovement = {
			x: this.characterController.position.x.value + offset[0] - currentPos.x,
			y: this.verticalVelocity * delta,
			z: this.characterController.position.z.value + offset[2] - currentPos.z,
		};

		// Use KinematicCollisionComponent to compute collision-corrected movement
		const correctedMovement = this.kinematicPhysics.computeCollision(desiredMovement);
		if (!correctedMovement) return;

		// Calculate final position (current + corrected movement)
		const finalPosition = {
			x: currentPos.x + correctedMovement.x,
			y: currentPos.y + correctedMovement.y,
			z: currentPos.z + correctedMovement.z,
		};

		// Apply position to physics body
		this.kinematicPhysics.applyPosition(finalPosition);

		// Update TransformComponent (source of truth for position)
		// Subtract offset because physics body center is at transform + offset
		const transform = this.getComponent(TransformComponent);
		if (transform) {
			transform.setPosition(finalPosition.x - offset[0], finalPosition.y - offset[1], finalPosition.z - offset[2]);
			transform.setRotation(0, this.characterController.rotation.value, 0);
		}

		// Sync transform position to character controller (bidirectional!)
		// Use transform position (not physics body position)
		this.characterController.position.x.value = finalPosition.x - offset[0];
		this.characterController.position.y.value = finalPosition.y - offset[1];
		this.characterController.position.z.value = finalPosition.z - offset[2];

		// Handle grounded state
		const isGrounded = this.kinematicPhysics.isGrounded();
		if (isGrounded) {
			// Reset vertical velocity when grounded
			this.verticalVelocity = 0;

			// Update ground level for jump system (use transform Y, not physics body Y)
			this.config.character.groundLevel = finalPosition.y - offset[1];

			// Reset jump flag when landed
			if (this.characterController.isJumping.value) {
				this.characterController.isJumping.value = false;
			}
		}
	}

	private handleJumping(delta: number): void {
		// Apply jump force when jump triggered
		if (this.characterController.isJumping.value && this.verticalVelocity === 0) {
			this.verticalVelocity = this.config.character.jumpInitialVelocity;
		}

		// Apply gravity (negative because downward)
		if (this.enableGravity) {
			this.verticalVelocity -= this.config.character.jumpGravity * delta;
		}
	}

	/**
	 * Reset vertical velocity (useful for teleports, scene transitions)
	 */
	public resetVerticalVelocity(): void {
		this.verticalVelocity = 0;
	}

	/**
	 * Get current vertical velocity (useful for animations, debugging)
	 */
	public getVerticalVelocity(): number {
		return this.verticalVelocity;
	}

	destroy(): void {
		// Unregister from state change notifications
		if (this.stateChangeCallback && this.context) {
			const stateService = this.context.getService("state");
			stateService.unregister(this.stateChangeCallback);
			this.stateChangeCallback = null;
		}

		this.context = null;
		this.kinematicPhysics = null;
	}
}
