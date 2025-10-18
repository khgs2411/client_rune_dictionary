import { CollisionComponent, I_CollisionConfig } from '@/game/components/interactions/CollisionComponent';
import type { I_SceneContext } from '@/game/common/scenes.types';
import { CharacterMeshComponent } from '@/game/components/rendering/CharacterMeshComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';

export interface I_KinematicPhysicsConfig extends I_CollisionConfig {
  initialPosition?: [number, number, number]; // Starting position for physics body
  characterOptions?: {
    enableAutostep?: boolean;
    enableSnapToGround?: boolean;
    maxStepHeight?: number;
    minStepWidth?: number;
    snapToGroundDistance?: number;
  };
}

/**
 * KinematicPhysicsComponent - Kinematic character controller with collision detection
 *
 * Extends CollisionComponent to add kinematic movement capabilities:
 * - Ground detection (isGrounded)
 * - Collision-aware movement computation
 * - Auto-step and ground snapping
 *
 * Used by KinematicMovementComponent for collision-aware movement.
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new KinematicPhysicsComponent({
 *   type: 'static', // Not used for kinematic, but required by base
 *   initialPosition: [0, 1, 0],
 *   characterOptions: {
 *     enableAutostep: true,
 *     maxStepHeight: 0.5
 *   }
 * }));
 * ```
 *
 * Dependencies:
 * - Requires CharacterMeshComponent OR MeshComponent
 */
export class KinematicPhysicsComponent extends CollisionComponent {
  private kinematicConfig: I_KinematicPhysicsConfig;

  constructor(config: I_KinematicPhysicsConfig) {
    super({ ...config, type: 'static' }); // Base class needs type, but we override registration
    this.kinematicConfig = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.context = context;

    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[KinematicPhysicsComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`,
      );
      return;
    }

    // Get mesh for physics body
    const characterMeshComp = this.getComponent(CharacterMeshComponent);
    const meshComp = this.getComponent(MeshComponent);

    let physicsBody;
    if (characterMeshComp) {
      physicsBody = characterMeshComp.bodyMesh;
    } else if (meshComp) {
      physicsBody = meshComp.mesh;
    } else {
      throw new Error(
        `[KinematicPhysicsComponent] GameObject "${this.gameObject.id}" requires CharacterMeshComponent or MeshComponent`,
      );
    }

    // Use provided initial position or default to [0, 1, 0]
    const initialPos = this.kinematicConfig.initialPosition || [0, 1, 0];

    // Register kinematic character with PhysicsService (not static!)
    context.services.physics.registerKinematicFromMesh(
      this.gameObject.id,
      physicsBody,
      initialPos,
      this.kinematicConfig.characterOptions || {
        enableAutostep: true,
        enableSnapToGround: true,
        maxStepHeight: 0.5,
        minStepWidth: 0.2,
        snapToGroundDistance: 0.5,
      },
    );

    // Register collision callbacks
    this.registerCallbacks();

    this.isRegistered = true;
    console.log(
      `🎮 [KinematicPhysicsComponent] Registered kinematic controller for "${this.gameObject.id}"`,
    );
  }

  /**
   * Compute collision-aware movement
   * @param desiredMovement Desired movement delta {x, y, z}
   * @returns Actual movement after collision correction + grounded state
   */
  public computeMovement(desiredMovement: {
    x: number;
    y: number;
    z: number;
  }): { x: number; y: number; z: number; isGrounded: boolean } {
    if (!this.isRegistered || !this.context) {
      return { ...desiredMovement, isGrounded: false };
    }

    return this.context.services.physics.moveKinematic(this.gameObject.id, desiredMovement);
  }

  /**
   * Check if character is on the ground
   */
  public isGrounded(): boolean {
    if (!this.isRegistered || !this.context) return false;
    return this.context.services.physics.isGrounded(this.gameObject.id);
  }
}
