import { GameComponent, ComponentPriority } from '@/game/GameComponent';
import type { I_CharacterControls } from '@/composables/composables.types';
import { TransformComponent } from '../rendering/TransformComponent';
import { KinematicCollisionComponent } from './KinematicCollisionComponent';
import { useGameConfigStore } from '@/stores/config.store';
import { I_SceneContext } from '@/game/common/scenes.types';

export interface I_KinematicMovementConfig {
  characterController: I_CharacterControls; // Scene-owned controller (handles input)
  enableJumping?: boolean; // Default: true
  enableGravity?: boolean; // Default: true
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
 *
 * Dependencies:
 * - Requires TransformComponent
 * - Requires KinematicPhysicsComponent
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
  private verticalVelocity = 5;
  private config = useGameConfigStore();
  private kinematicPhysics: KinematicCollisionComponent | null = null;

  constructor(config: I_KinematicMovementConfig) {
    super();
    this.characterController = config.characterController;
    this.enableJumping = config.enableJumping ?? true;
    this.enableGravity = config.enableGravity ?? true;
  }

  async init(context: I_SceneContext): Promise<void> {
    // Verify required components
    this.requireComponent(TransformComponent);
    this.kinematicPhysics = this.requireComponent(KinematicCollisionComponent);

    console.log(
      `🏃 [KinematicMovementComponent] Initialized for "${this.gameObject.id}"`,
    );
  }

  update(delta: number): void {
    if (!this.kinematicPhysics) return;

    const currentPos = this.kinematicPhysics.getPosition();
    if (!currentPos) return;

    // Handle vertical velocity (gravity + jumping)
    if (this.enableJumping) {
      this.handleJumping(delta);
    }

    // Calculate desired horizontal movement (from character controller)
    const desiredMovement = {
      x: this.characterController.position.x.value - currentPos.x,
      y: this.verticalVelocity * delta,
      z: this.characterController.position.z.value - currentPos.z,
    };

    // Use KinematicCollisionComponent to compute collision-corrected movement
    const correctedMovement = this.kinematicPhysics.computeColliderMovement(desiredMovement);
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
    const transform = this.getComponent(TransformComponent);
    if (transform) {
      transform.setPosition(finalPosition.x, finalPosition.y, finalPosition.z);
      transform.setRotation(0, this.characterController.rotation.value, 0);
    }

    // Sync physics position back to character controller (bidirectional!)
    this.characterController.position.x.value = finalPosition.x;
    this.characterController.position.y.value = finalPosition.y;
    this.characterController.position.z.value = finalPosition.z;

    // Handle grounded state
    const isGrounded = this.kinematicPhysics.isGrounded();
    if (isGrounded) {
      // Reset vertical velocity when grounded
      this.verticalVelocity = 0;

      // Update ground level for jump system
      this.config.character.groundLevel = finalPosition.y;

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
    this.kinematicPhysics = null;
  }
}
