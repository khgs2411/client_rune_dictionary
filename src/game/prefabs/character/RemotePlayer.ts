import { GameObject } from '@/game/GameObject';
import { createPlayer } from './createPlayer';
import { RemotePlayerComponent } from '@/game/components/multiplayer/RemotePlayerComponent';
import type { I_RemotePlayerConfig as I_RemotePlayerComponentConfig } from '@/game/common/multiplayer.types';

/**
 * Configuration for RemotePlayer prefab
 */
export interface I_RemotePlayerConfig {
  playerId: string;
  username: string;
  position?: [number, number, number];
  color?: number; // Default: 0xff0000 (red)
  interpolationSpeed?: number; // Default: 0.1
}

/**
 * RemotePlayer Prefab - Complete remote player character GameObject
 *
 * This prefab represents other players in the game (not controlled by this client).
 * Uses createCharacterComponents() factory for shared visual components, then adds
 * networking component for server-driven interpolation.
 *
 * Visual (from factory):
 * - TransformComponent: Source of truth for position/rotation
 * - CharacterMeshComponent: Two-part visual (body + cone indicator)
 *   - Colors: Red by default (configurable via config.color)
 *
 * Behavior (RemotePlayer-specific):
 * - RemotePlayerComponent: Receives position updates from server, interpolates smoothly
 *
 * Remote players do NOT have client-side physics (no collision detection).
 * They simply display positions sent by the server, smoothly interpolated.
 *
 * Usage:
 * ```typescript
 * const remotePlayer = new RemotePlayer({
 *   playerId: 'player-456',
 *   username: 'Alice',
 *   position: [5, 1, 5],
 *   color: 0x00ff00, // Optional: green instead of default red
 *   interpolationSpeed: 0.1,
 * });
 * gameObjectManager.add(remotePlayer);
 * ```
 */
export class RemotePlayer extends GameObject {
  private username: string;

  constructor(config: I_RemotePlayerConfig) {
    super({ id: config.playerId });

    this.username = config.username;

    // Determine starting position
    // Hardcoded fallback: spawn at Y=10 (above ground)
    const startPos: [number, number, number] = config.position ?? [0, 10, 0];

    // TODO: Override from server spawn data
    // Example usage after receiving player data:
    // const playerData = await api.getPlayerPosition(playerId);
    // if (playerData?.spawnPosition) {
    //   startPos = [
    //     playerData.spawnPosition.x,
    //     playerData.spawnPosition.y,
    //     playerData.spawnPosition.z
    //   ];
    // }

    console.log(
      `[RemotePlayer] Creating "${config.username}" at (${startPos[0].toFixed(1)}, ${startPos[1].toFixed(1)}, ${startPos[2].toFixed(1)})`,
    );

    // Add shared components from factory (transform + mesh)
    // Note: Remote players use red color by default (configurable)
    const sharedComponents = createPlayer({
      position: startPos,
      bodyRadius: 0.5,
      bodyHeight: 1,
      coneRadius: 0.2,
      coneHeight: 0.4,
      coneOffset: 0.7,
      bodyColor: config.color ?? 0xff0000, // Red for remote players
      coneColor: config.color ?? 0xff0000, // Same color for cone
    });
    sharedComponents.forEach((comp) => this.addComponent(comp));

    // Add RemotePlayerComponent for multiplayer interpolation
    const remotePlayerConfig: I_RemotePlayerComponentConfig = {
      playerId: config.playerId,
      username: config.username,
      initialPosition: startPos,
      interpolationSpeed: config.interpolationSpeed ?? 0.1,
    };

    this.addComponent(new RemotePlayerComponent(remotePlayerConfig));
  }

  /**
   * Get player username
   */
  public getUsername(): string {
    return this.username;
  }

  /**
   * Check if player is currently moving
   * Useful for animation states
   */
  public isMoving(): boolean {
    const remoteComp = this.getComponent(RemotePlayerComponent);
    return remoteComp ? remoteComp.isMoving() : false;
  }

  /**
   * Get player's current velocity
   * Useful for animation blending
   */
  public getVelocity() {
    const remoteComp = this.getComponent(RemotePlayerComponent);
    return remoteComp ? remoteComp.getVelocity() : null;
  }

  /**
   * Teleport player to new position (instant, no interpolation)
   * Used for scene transitions, respawns, etc.
   */
  public teleport(x: number, y: number, z: number): void {
    const remoteComp = this.getComponent(RemotePlayerComponent);
    if (remoteComp) {
      const { Vector3 } = require('three');
      remoteComp.teleport(new Vector3(x, y, z));
    }
  }

  /**
   * Get time since last position update from server
   * Useful for detecting disconnected/stale players
   */
  public getTimeSinceLastUpdate(): number {
    const remoteComp = this.getComponent(RemotePlayerComponent);
    return remoteComp ? remoteComp.getTimeSinceLastUpdate() : Infinity;
  }

  /**
   * Change interpolation speed at runtime
   * Lower = smoother but more lag, Higher = responsive but jittery
   */
  public setInterpolationSpeed(speed: number): void {
    const remoteComp = this.getComponent(RemotePlayerComponent);
    if (remoteComp) {
      remoteComp.setInterpolationSpeed(speed);
    }
  }
}
