import type { I_SceneContext } from '@/game/common/scenes.types';
import {
  CollisionComponent,
  I_CollisionConfig,
} from '@/game/components/interactions/CollisionComponent';
import type { Mesh, Object3D } from 'three';

export interface I_KinematicPhysicsConfig extends I_CollisionConfig {
  getMesh: () => Mesh | Object3D; // Lazy getter for physics body mesh (called during init)
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
 *   type: 'static', // Required by base, overridden for kinematic
 *   getMesh: () => this.getComponent(CharacterMeshComponent)!.bodyMesh,
 *   initialPosition: [0, 1, 0],
 *   characterOptions: {
 *     enableAutostep: true,
 *     maxStepHeight: 0.5
 *   }
 * }));
 * ```
 *
 * Dependencies:
 * - None! Mesh is resolved via lazy getter (decoupled, flexible)
 */
export class KinematicCollisionComponent extends CollisionComponent {
  private kinematicConfig: I_KinematicPhysicsConfig;

  constructor(config: I_KinematicPhysicsConfig) {
    super({ ...config, type: 'static' }); // Base class needs type, but we override registration
    this.kinematicConfig = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.context = context;
    const physics = context.getService('physics');
    // Check if physics service is ready
    if (!physics.isReady()) {
      console.warn(
        `[KinematicPhysicsComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`,
      );
      return;
    }

    // Get mesh from lazy getter (called during init when mesh exists)
    const mesh = this.kinematicConfig.getMesh();
    if (!mesh) {
      throw new Error(
        `[KinematicPhysicsComponent] GameObject "${this.gameObject.id}" getMesh() returned null/undefined`,
      );
    }

    // Use provided initial position or default to [0, 1, 0]
    const initialPos = this.kinematicConfig.initialPosition || [0, 1, 0];

    // Register kinematic character with PhysicsService (not static!)
    physics.registerKinematicFromMesh(
      this.gameObject.id,
      mesh,
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
  }

  /**
   * Compute collision-corrected movement using Rapier's character controller
   * @param desiredMovement Desired movement delta {x, y, z}
   * @returns Corrected movement vector after collision detection
   */
  public computeCollision(desiredMovement: {
    x: number;
    y: number;
    z: number;
  }): { x: number; y: number; z: number } | null {
    if (!this.isRegistered || !this.context) return null;
    const physics = this.context.getService('physics');
    const controller = physics.getKinematicController(this.gameObject.id);
    const collider = physics.getCollider(this.gameObject.id);

    if (!controller || !collider) return null;

    // Use Rapier to compute collision-corrected movement
    controller.computeColliderMovement(collider, desiredMovement);
    const correctedMovement = controller.computedMovement();

    return {
      x: correctedMovement.x,
      y: correctedMovement.y,
      z: correctedMovement.z,
    };
  }

  /**
   * Check if character is on the ground (call after computeColliderMovement)
   */
  public isGrounded(): boolean {
    if (!this.isRegistered || !this.context) return false;
    const physics = this.context.getService('physics');

    const controller = physics.getKinematicController(this.gameObject.id);
    return controller?.computedGrounded() ?? false;
  }

  /**
   * Apply computed position to physics body
   */
  public applyPosition(position: { x: number; y: number; z: number }): void {
    if (!this.isRegistered || !this.context) return;
    const physics = this.context.getService('physics');
    physics.applyKinematicTranslation(this.gameObject.id, position);
  }
}
