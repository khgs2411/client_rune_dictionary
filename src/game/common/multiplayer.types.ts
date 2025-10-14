/**
 * Multiplayer type definitions for player synchronization
 * Used by SyncMovementComponent, RemotePlayerComponent, and MultiplayerService
 */

import type { Vector3 } from 'three';
import { LocalPlayer } from '../prefabs/character/LocalPlayer';

/**
 * Player position update message sent over WebSocket
 */
export interface I_PlayerPositionUpdate {
  playerId: string;
  playerName: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
}

/**
 * Remote player state for interpolation
 */
export interface I_RemotePlayerState {
  playerId: string;
  username: string;
  currentPosition: Vector3;
  targetPosition: Vector3;
  velocity: Vector3;
  lastUpdateTime: number;
}

/**
 * Configuration for movement synchronization
 */
export interface I_SyncMovementConfig {
  updateRate?: number; // Milliseconds between updates (default: 100ms = 10 Hz)
  positionThreshold?: number; // Minimum distance to trigger update (default: 0.1)
  rotationThreshold?: number; // Minimum rotation to trigger update (default: 0.05 radians)
  syncRotation?: boolean; // Whether to sync rotation (default: true)
}

/**
 * Configuration for remote player interpolation
 */
export interface I_RemotePlayerConfig {
  playerId: string;
  username: string;
  initialPosition?: [number, number, number];
  interpolationSpeed?: number; // Lerp factor (default: 0.1)
}

/**
 * Multiplayer service interface for components
 */
export interface I_MultiplayerHandler {
  localPlayer: LocalPlayer | null;
  /**
   * Register remote player for receiving position updates
   */
  registerRemotePlayer(playerId: string, state: I_PlayerPositionUpdate): void;

  /**
   * Unregister remote player
   */
  unregisterRemotePlayer(playerId: string): void;

}
