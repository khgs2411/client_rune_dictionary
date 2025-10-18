import { GameComponent, ComponentPriority } from '@/game/GameComponent';
import type {
  I_SyncMovementConfig,
  I_PlayerPositionUpdate,
} from '@/game/common/multiplayer.types';
import { I_SceneContext } from '@/game/common/scenes.types';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { E_NetworkEventCategory } from '@/game/services/NetworkingService';
import { Vector3 } from 'three';

/**
 * SyncMovementComponent - Sends local player position to server
 *
 * This component:
 * - Throttles position updates to configurable rate (default: 10 Hz)
 * - Only sends updates if player moved significantly (threshold-based)
 * - Optionally syncs rotation
 * - Automatically registers/unregisters with MultiplayerService
 *
 * Usage:
 * ```typescript
 * const player = new GameObject({ id: 'local-player' })
 *   .addComponent(new TransformComponent({ position: [0, 1, 0] }))
 *   .addComponent(new MeshComponent())
 *   .addComponent(new SyncMovementComponent({
 *     playerId: wsStore.clientData.id,
 *     updateRate: 100, // 10 updates/sec
 *   }));
 * ```
 *
 * Dependencies:
 * - Requires TransformComponent
 * - Requires MultiplayerService in scene services
 */
export class SyncMovementComponent extends GameComponent {
  public readonly priority = ComponentPriority.DEFAULT;

  private playerId: string;
  private updateRate: number;
  private positionThreshold: number;
  private rotationThreshold: number;
  private syncRotation: boolean;

  // Internal state
  private timeSinceLastSync = 0;
  private lastSyncedPosition = new Vector3();
  private lastSyncedRotation = { x: 0, y: 0, z: 0 };
  private context: I_SceneContext | null = null;

  constructor(config: I_SyncMovementConfig & { playerId: string }) {
    super();

    this.playerId = config.playerId;
    this.updateRate = config.updateRate ?? 100; // Default: 100ms = 10 Hz
    this.positionThreshold = config.positionThreshold ?? 0.1; // Default: 0.1 units
    this.rotationThreshold = config.rotationThreshold ?? 0.05; // Default: ~3 degrees
    this.syncRotation = config.syncRotation ?? true;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.context = context;

    // Verify TransformComponent exists
    this.requireComponent(TransformComponent);

    console.log(`📡 [SyncMovementComponent] Initialized for player: ${this.playerId}`);
  }

  update(delta: number): void {
    if (!this.context) return;

    this.timeSinceLastSync += delta * 1000; // Convert to milliseconds

    // Check if it's time to sync
    if (this.timeSinceLastSync >= this.updateRate) {
      this.syncPosition();
      this.timeSinceLastSync = 0;
    }
  }


  /**
   * Send position update to server if player moved significantly
   * @private
   */
  private syncPosition(): void {
    if (!this.context) return;

    const transform = this.getComponent(TransformComponent);
    if (!transform) return;

    const currentPos = transform.position;
    const currentRot = transform.rotation;

    // Check if position changed significantly
    const positionChanged =
      currentPos.distanceTo(this.lastSyncedPosition) >= this.positionThreshold;

    // Check if rotation changed significantly (if syncing rotation)
    const rotationChanged =
      this.syncRotation &&
      (Math.abs(currentRot.x - this.lastSyncedRotation.x) >= this.rotationThreshold ||
        Math.abs(currentRot.y - this.lastSyncedRotation.y) >= this.rotationThreshold ||
        Math.abs(currentRot.z - this.lastSyncedRotation.z) >= this.rotationThreshold);


    // Skip if no significant change
    if (positionChanged || rotationChanged) {
      const clientData = this.context.services.networking.getClientData();
      if (!clientData) return;
      // Build update message
      const update: I_PlayerPositionUpdate = {
        playerId: clientData.id,
        playerName: clientData.name,
        playerSceneId: this.context.sceneName,
        position: {
          x: currentPos.x,
          y: currentPos.y,
          z: currentPos.z,
        },
        timestamp: Date.now(),
      };

      // Add rotation if enabled
      if (this.syncRotation) {
        update.rotation = {
          x: currentRot.x,
          y: currentRot.y,
          z: currentRot.z,
        };
      }

      // Send via MultiplayerService
      this.sendPositionUpdate(update);

      // Update last synced values
      this.lastSyncedPosition.copy(currentPos);
      if (this.syncRotation) {
        this.lastSyncedRotation = { x: currentRot.x, y: currentRot.y, z: currentRot.z };
      }
    }
  }

  private sendPositionUpdate(update: I_PlayerPositionUpdate): void {
    if (!this.context?.services.networking) return;
    const message = {
      action: 'player.position.update',
      ...update,
    };

    this.context.services.networking.send(E_NetworkEventCategory.PLAYER, message);
  }

  /**
   * Handle position updates from server (server authority reconciliation)
   * Currently unused - server trusts client for movement
   * Can be implemented later for anti-cheat or server-authoritative movement
   * @private
   */
  private handleServerUpdate = (_data: I_PlayerPositionUpdate): void => {
    // For future server reconciliation
    // If server position differs from client, correct client position
    // Useful for anti-cheat or server-authoritative physics
  };

  /**
   * Force an immediate position sync (useful for teleports, respawns)
   */
  public forceSync(): void {
    this.timeSinceLastSync = this.updateRate; // Trigger sync on next update
  }

  /**
   * Change update rate at runtime
   */
  public setUpdateRate(rate: number): void {
    this.updateRate = rate;
  }

  /**
   * Change position threshold at runtime
   */
  public setPositionThreshold(threshold: number): void {
    this.positionThreshold = threshold;
  }
}
