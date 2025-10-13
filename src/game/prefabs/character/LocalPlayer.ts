import { GameObject } from '@/game/GameObject';
import { CharacterMeshComponent } from '@/game/components/rendering/CharacterMeshComponent';
import { PhysicsComponent } from '@/game/components/interactions/PhysicsComponent';
import { MovementComponent } from '@/game/components/systems/MovementComponent';
import type { I_CharacterControls } from '@/composables/composables.types';

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
 * It uses components to replicate the functionality of CharacterModule:
 * - CharacterMeshComponent: Two-part visual (body + cone indicator)
 * - PhysicsComponent: Kinematic character controller (collision, auto-step, ground detection)
 * - MovementComponent: Movement logic (controller → physics → sync back)
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
 * gameObjectManager.add(localPlayer);
 * ```
 *
 * Components:
 * - CharacterMeshComponent (capsule body + cone indicator, theme-aware)
 * - PhysicsComponent (kinematic character controller)
 * - MovementComponent (movement, jumping, gravity)
 * - SyncMovementComponent (NOT added yet - for future networking)
 */
export class LocalPlayer extends GameObject {
  private characterController: I_CharacterControls;

  constructor(config: I_LocalPlayerConfig) {
    super({ id: config.playerId });

    // Store controller reference
    this.characterController = config.characterController;

    // Get starting position from controller (source of truth)
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

    console.log(
      `[LocalPlayer] Spawning at (${startPos[0].toFixed(1)}, ${startPos[1].toFixed(1)}, ${startPos[2].toFixed(1)})`,
    );

    // Add CharacterMeshComponent (two-part visual: body + cone)
    this.addComponent(
      new CharacterMeshComponent({
        bodyRadius: 0.5,
        bodyHeight: 1,
        coneRadius: 0.2,
        coneHeight: 0.4,
        coneOffset: 0.7,
        initialPosition: startPos, // Visual starts at correct position
      }),
    );

    // Add PhysicsComponent (kinematic character controller)
    this.addComponent(
      new PhysicsComponent({
        type: 'kinematic',
        characterController: true,
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
      new MovementComponent({
        characterController: config.characterController,
        enableJumping: true,
        enableGravity: true,
      }),
    );

    // SyncMovementComponent will be added later when networking is ready
    // this.addComponent(new SyncMovementComponent({ ... }));
  }

  /**
   * Get the character controller reference
   * Useful for scene/camera to access controller state
   */
  public getController(): I_CharacterControls {
    return this.characterController;
  }

  /**
   * Teleport player to new position (instant, no interpolation)
   * Updates physics body position directly
   */
  public teleport(x: number, y: number, z: number): void {
    // Update controller position
    this.characterController.setPosition(x, y, z);

    // Update physics body
    const physicsComp = this.getComponent(PhysicsComponent);
    if (physicsComp) {
      physicsComp.updatePosition(x, y, z);
    }

    // Reset vertical velocity
    const movementComp = this.getComponent(MovementComponent);
    if (movementComp) {
      movementComp.resetVerticalVelocity();
    }

    // Update visual mesh
    const meshComp = this.getComponent(CharacterMeshComponent);
    if (meshComp) {
      meshComp.updateTransform(x, y, z, this.characterController.rotation.value);
    }
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
    const movementComp = this.getComponent(MovementComponent);
    return movementComp ? movementComp.getVerticalVelocity() : 0;
  }
}
