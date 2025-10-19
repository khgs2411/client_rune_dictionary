import { GameObject } from '@/game/GameObject';
import { createPlayer } from './createPlayer';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { KinematicMovementComponent } from '@/game/components/systems/KinematicMovementComponent';
import type { I_CharacterControls } from '@/composables/composables.types';
import { SyncMovementComponent } from '@/game/components/multiplayer/SyncMovementComponent';
import { Vec3 } from '@/common/types';
import { KinematicCollisionComponent } from '@/game/components/systems/KinematicCollisionComponent';
import { CharacterMeshComponent } from '@/game/components/rendering/CharacterMeshComponent';

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
 * Uses createCharacterVisual() factory for shared visual components, then adds
 * client-specific behavior components:
 *
 * Visual (from factory):
 * - CharacterMeshComponent: Two-part visual (body + cone indicator, theme-aware)
 *
 * Behavior (LocalPlayer-specific):
 * - KinematicPhysicsComponent: Kinematic character controller (collision, auto-step, ground detection)
 * - MovementComponent: Movement logic (controller → physics → sync back)
 * - SyncMovementComponent: Network position/rotation sync
 *
 * The character controller (input handling) is owned by the scene and passed
 * to this GameObject. The controller holds DESIRED state from input, physics
 * computes ACTUAL state, and MovementComponent syncs them bidirectionally.
 *
 * Usage:
 * ```typescript
 * const localPlayer = new LocalPlayer({
 *   playerId: 'local-player',
 *   characterController: this.character.controller,
 *   position: [0, 1, 0],
 * });
 */
export class LocalPlayer extends GameObject {
  private characterController: I_CharacterControls;

  constructor(config: I_LocalPlayerConfig) {
    super({ id: config.playerId });

    // Store controller reference
    this.characterController = config.characterController;

    // Get starting position from controller (source of truth)
    const startPos: Vec3 = this.getSpawnPosition(config);

    // Add shared components from factory (transform + mesh)
    this.addBaseComponents(startPos);

    // Add KinematicPhysicsComponent (kinematic character controller)
    this.addComponent(
      new KinematicCollisionComponent({
        type: 'static', // Required by base, but overridden for kinematic
        getMesh: () => this.getComponent(CharacterMeshComponent)!.getMesh(), // Polymorphic mesh getter
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

    // SyncMovementComponent will be added later when networking is ready
    this.addComponent(new SyncMovementComponent({ playerId: this.id, syncRotation: true }));
  }

  private addBaseComponents(startPos: Vec3) {
    const sharedComponents = createPlayer({
      position: startPos,
      bodyRadius: 0.5,
      bodyHeight: 1,
      coneRadius: 0.2,
      coneHeight: 0.4,
      coneOffset: 0.7,
    });
    sharedComponents.forEach((comp) => this.addComponent(comp));
  }

  private getSpawnPosition(config: I_LocalPlayerConfig) {
    const controllerPos = config.characterController.getPosition();
    const startPos: [number, number, number] = [
      controllerPos.x,
      controllerPos.y,
      controllerPos.z,
    ];

    // Override with config position if provided (for API spawn positions)
    if (config.position) {
      startPos[0] = config.position[0];
      startPos[2] = config.position[2];
      // Keep Y from controller unless explicitly overridden
      if (config.position[1] !== undefined) {
        startPos[1] = config.position[1];
      }
    }

    // TODO: Override from API spawn position
    // Example usage after API call:
    // const spawnData = await api.getPlayerSpawnPosition(playerId);
    // if (spawnData) {
    //   startPos = [spawnData.x, spawnData.y, spawnData.z];
    //   config.characterController.setPosition(startPos[0], startPos[1], startPos[2]);
    // }
    return startPos;
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

    // Note: CharacterMeshComponent will automatically sync from TransformComponent
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
