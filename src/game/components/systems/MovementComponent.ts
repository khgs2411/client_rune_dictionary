import { GameComponent, ComponentPriority } from '@/game/GameComponent';
import type { I_GameContext } from '@/game/common/gameobject.types';
import type { I_CharacterControls } from '@/composables/composables.types';
import { CharacterMeshComponent } from '../rendering/CharacterMeshComponent';
import { useGameConfigStore } from '@/stores/gameConfig.store';

export interface I_MovementConfig {
  characterController: I_CharacterControls; // Scene-owned controller (handles input)
  enableJumping?: boolean; // Default: true
  enableGravity?: boolean; // Default: true
}

/**
 * MovementComponent - Handles character movement, jumping, and gravity
 *
 * This component:
 * - Reads DESIRED movement from character controller (input)
 * - Calculates vertical velocity (gravity + jumping)
 * - Asks PhysicsService to compute ACTUAL collision-corrected movement
 * - Syncs ACTUAL position back to controller (bidirectional sync)
 * - Updates CharacterMeshComponent visual position
 *
 * Dependencies:
 * - Requires CharacterMeshComponent (for visual updates)
 * - Requires PhysicsComponent with kinematic character controller
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new MovementComponent({
 *   characterController: this.character.controller, // From scene
 *   enableJumping: true,
 *   enableGravity: true,
 * }));
 * ```
 *
 * Priority: 300 (INTERACTION) - Runs after physics, before sync
 */
export class MovementComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION; // 300

  private characterController: I_CharacterControls;
  private enableJumping: boolean;
  private enableGravity: boolean;
  private verticalVelocity = 5;
  private config = useGameConfigStore();
  private context: I_GameContext | null = null;

  constructor(config: I_MovementConfig) {
    super();
    this.characterController = config.characterController;
    this.enableJumping = config.enableJumping ?? true;
    this.enableGravity = config.enableGravity ?? true;
  }

  async init(context: I_GameContext): Promise<void> {
    this.context = context;

    // Verify required components
    this.requireComponent(CharacterMeshComponent);

    // Verify physics service is ready
    if (!context.services.physics.isReady()) {
      throw new Error(
        `[MovementComponent] Physics service not ready for GameObject "${this.gameObject.id}"`,
      );
    }

    // Verify physics body exists
    const currentPos = context.services.physics.getPosition(this.gameObject.id);
    if (!currentPos) {
      throw new Error(
        `[MovementComponent] Physics body not found for GameObject "${this.gameObject.id}". Did you add PhysicsComponent with kinematic character controller?`,
      );
    }

    console.log(`[MovementComponent] Initialized for GameObject "${this.gameObject.id}"`);
  }

  update(delta: number): void {
    if (!this.context) return;

    const currentPos = this.context.services.physics.getPosition(this.gameObject.id);
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

    // Let PhysicsService compute collision-corrected movement
    const result = this.context.services.physics.moveKinematic(this.gameObject.id, desiredMovement);

    // Update visual mesh
    const meshComp = this.getComponent(CharacterMeshComponent);
    if (meshComp) {
      meshComp.updateTransform(
        result.x,
        result.y,
        result.z,
        this.characterController.rotation.value,
      );
    }

    // Sync physics position back to character controller (bidirectional!)
    this.characterController.position.x.value = result.x;
    this.characterController.position.y.value = result.y;
    this.characterController.position.z.value = result.z;

    // Handle grounded state
    if (result.isGrounded) {
      // Reset vertical velocity when grounded
      this.verticalVelocity = 0;

      // Update ground level for jump system
      this.config.character.groundLevel = result.y;

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
    this.context = null;
  }
}
