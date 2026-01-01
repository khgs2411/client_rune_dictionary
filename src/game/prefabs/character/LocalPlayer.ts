import type { I_CharacterControls } from "@/composables/composables.types";
import { KinematicCollisionComponent } from "@/game/components/physics/KinematicCollisionComponent";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { SyncMovementComponent } from "@/game/components/multiplayer/SyncMovementComponent";
import { KinematicMovementComponent } from "@/game/components/physics/KinematicMovementComponent";
import { SpriteGameObject } from "../SpriteGameObject";

/**
 * Configuration for LocalPlayer prefab
 */
export interface I_LocalPlayerConfig {
	playerId: string;
	characterController: I_CharacterControls; // Scene-owned controller (handles input)
	position?: [number, number, number];
	// Future: syncConfig for SyncMovementComponent when networking is ready
}

/**
 * LocalPlayer Prefab - Complete local player character GameObject
 *
 * This prefab represents the player controlled by this client.
 * Uses billboard sprite with animated sprite sheet for visual representation.
 *
 * Extends SpriteGameObject (provides Transform, Sprite, Billboard, Animator) and adds:
 * - KinematicCollisionComponent: Kinematic character controller (collision, auto-step, ground detection)
 * - KinematicMovementComponent: Movement logic (controller → physics → sync back)
 * - SyncMovementComponent: Network position/rotation sync
 *
 * The character controller (input handling) is owned by the scene and passed
 * to this GameObject. The controller holds DESIRED state from input, physics
 * computes ACTUAL state, and MovementComponent syncs them bidirectionally.
 *
 * Prerequisites:
 * - Call `SpriteSheetRegistry.RegisterAllSpriteSheets()` before creating LocalPlayer
 *
 * Usage:
 * ```typescript
 * const localPlayer = new LocalPlayer({
 *   playerId: 'local-player',
 *   characterController: this.character.controller,
 *   position: [0, 1, 0],
 * });
 */
export class LocalPlayer extends SpriteGameObject {
	private characterController: I_CharacterControls;

	constructor(config: I_LocalPlayerConfig) {
		// Calculate spawn position inline (can't call methods before super)
		const controllerPos = config.characterController.getPosition();
		const startPos: [number, number, number] = [controllerPos.x, controllerPos.y, controllerPos.z];

		// Override with config position if provided (for API spawn positions)
		if (config.position) {
			startPos[0] = config.position[0];
			startPos[2] = config.position[2];
			// Keep Y from controller unless explicitly overridden
			if (config.position[1] !== undefined) {
				startPos[1] = config.position[1];
			}
		}

		// Capture controller reference for resolver closure
		const controller = config.characterController;

		// Call SpriteGameObject constructor with animationResolver
		super({
			id: config.playerId,
			spriteSheetId: "local-player",
			position: startPos,
			billboardMode: "cylindrical",
			animatorConfig: {
				movementSource: controller, // For direction flip
				animationResolver: () => {
					// TODO: Add "jump" animation to registry, then: if (controller.isJumping.value) return "jump";
					return controller.isMoving.value ? "walk" : "idle";
				},
				nativeFacing: "right",
			},
		});

		// Store controller reference
		this.characterController = config.characterController;

		// Add LocalPlayer-specific components
		this.addCharacterControllerComponents(startPos, config);
	}

	private addCharacterControllerComponents(startPos: [number, number, number], config: I_LocalPlayerConfig) {
		// Inline capsule shape for collision
		this.addComponent(
			new KinematicCollisionComponent({
				type: "static", // Required by base, but overridden for kinematic
				shape: {
					type: "capsule",
					radius: 0.3,
					height: 1.5,
					offset: [0, 0.75, 0], // Center capsule vertically on sprite
				},
				initialPosition: startPos, // Physics body starts at correct position
				characterOptions: {
					enableAutostep: true,
					enableSnapToGround: true,
					maxStepHeight: 0.5,
					minStepWidth: 0.2,
					snapToGroundDistance: 0.5,
				},
			}),
		);

		// Add MovementComponent (movement logic, jumping, gravity)
		this.addComponent(
			new KinematicMovementComponent({
				characterController: config.characterController,
				enableJumping: true,
				enableGravity: true,
			}),
		);

		// SyncMovementComponent for network sync
		this.addComponent(new SyncMovementComponent({ playerId: this.id, syncRotation: true }));
	}

	/**
	 * Teleport player to new position (instant, no interpolation)
	 * Updates all systems: controller, transform, physics
	 */
	public teleport(x: number, y: number, z: number): void {
		// Update controller position
		this.characterController.setPosition(x, y, z);

		// Update TransformComponent (source of truth)
		const transform = this.getComponent(TransformComponent);
		if (transform) {
			transform.setPosition(x, y, z);
		}

		// Update physics body
		const physics = this.getComponent(KinematicCollisionComponent);
		if (physics) {
			physics.updatePosition(x, y, z);
		}

		// Reset vertical velocity
		const movementComp = this.getComponent(KinematicMovementComponent);
		if (movementComp) {
			movementComp.resetVerticalVelocity();
		}

		// Note: SpriteComponent will automatically sync from TransformComponent
	}

	/**
	 * Get current player position
	 */
	public getPosition() {
		return this.characterController.getPosition();
	}

	/**
	 * Check if player is currently jumping (in air)
	 */
	public isJumping(): boolean {
		return this.characterController.isJumping.value;
	}

	/**
	 * Get vertical velocity (useful for animations, fall damage, etc.)
	 */
	public getVerticalVelocity(): number {
		const movementComp = this.getComponent(KinematicMovementComponent);
		return movementComp ? movementComp.getVerticalVelocity() : 0;
	}
}
