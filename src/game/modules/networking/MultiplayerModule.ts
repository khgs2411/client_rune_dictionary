import type { I_ModuleContext, I_SceneModule } from '@/game/common/scenes.types';
import type { I_SceneService } from '@/game/common/scenes.types';
import type {
  I_MultiplayerHandler,
  I_PlayerPositionUpdate,
} from '@/game/common/multiplayer.types';
import { useWebSocketConnection } from '@/composables/useWebSocketConnection';
import { useRxjs } from 'topsyde-utils';
import SceneModule from '@/game/SceneModule';
import MultiplayerAPI, { I_PlayerInScene } from '@/api/multiplayer.api';
import { RemotePlayer } from '@/game/prefabs/character/RemotePlayer';
import { GameObjectManager } from '@/game/services/GameObjectManager';

/**
 * MultiplayerService - Manages WebSocket routing for player synchronization
 *
 * This service:
 * - Routes position updates from local player to server
 * - Routes position updates from server to remote players
 * - Manages player registration/unregistration
 * - Provides slim WebSocket abstraction for multiplayer components
 *
 * Usage in scene:
 * ```typescript
 * protected services = {
 *   multiplayer: new MultiplayerService(),
 * };
 * ```
 *
 * Usage in components:
 * ```typescript
 * // Local player
 * context.services.multiplayer.sendPositionUpdate(data);
 *
 * // Remote player
 * context.services.multiplayer.registerRemotePlayer(playerId, (data) => {
 *   // Update position
 * });
 * ```
 */
export class MultiplayerModule extends SceneModule implements I_MultiplayerHandler, I_SceneModule {
  private rx = useRxjs(['multiplayer', 'scene'], {}, { static_instance: true });

  // Local player tracking
  private localPlayerId: string | null = null;
  private localPlayerCallback: ((data: I_PlayerPositionUpdate) => void) | null = null;

  // Remote players tracking
  private remotePlayers = new Map<string, I_PlayerPositionUpdate>;

  constructor(moduleName: string, private gameObjectManager: GameObjectManager) {
    super(moduleName, false);
  }
  /**
   * Initialize service and subscribe to WebSocket events
   */
  public async init(context: I_ModuleContext): Promise<void> {
    console.log('🌐 [MultiplayerService] Starting...');
    const api = new MultiplayerAPI();
    // Test API connection
    try {

      this.rx.$subscribe({
        'scene': {
          'scene.joined': (event) => {
            console.log('[MultiplayerService] Scene joined event:', event);
          },
          'scene.left': (event) => {
            console.log('[MultiplayerService] Scene left event:', event);
          }
        }
      })

      const data = await api.getPlayersInScene(context.clientData.id)
      
      const remotePlayers: RemotePlayer[] = [];
      
      data.data.playersInScene.forEach(player => {
        const state: I_PlayerPositionUpdate = {
          playerId: player.id,
          playerName: player.username,
          position: player.raw.position,
          timestamp: new Date().getTime(),
        }
        this.registerRemotePlayer(player.id, state);
        const remotePlayer = new RemotePlayer({ playerId: player.id, username: player.username || "Remote Player", position: player.position })
        remotePlayers.push(remotePlayer);
        this.gameObjectManager.add(remotePlayer, false); // Add without initializing yet
      })

      console.log('✅ [MultiplayerService] Started');
      this.initialized(context.sceneName)
    } catch (error) {
      console.error('❌ [MultiplayerService] Failed to connect to Multiplayer API:', error);
    }
  }

  /**
   * No per-frame updates needed
   */
  public update(_delta: number): void {
    // Service doesn't need frame update
    // Components handle their own timing
  }

  /**
   * Cleanup subscriptions and clear registrations
   */
  async destroy(): Promise<void> {
    // Unsubscribe from RxJS
    this.rx.$unsubscribe();
    // Clear registrations
    this.localPlayerId = null;
    this.localPlayerCallback = null;
    this.remotePlayers.clear();

    console.log('🧹 [MultiplayerService] Destroyed');
  }


  /**
   * Register local player for sending position updates
   * Only one local player can be registered at a time
   */
  public registerLocalPlayer(
    playerId: string,
    onUpdate: (data: I_PlayerPositionUpdate) => void,
  ): void {
    if (this.localPlayerId) {
      console.warn(
        `[MultiplayerService] Local player already registered (${this.localPlayerId}). Replacing.`,
      );
    }

    this.localPlayerId = playerId;
    this.localPlayerCallback = onUpdate;

    console.log(`📍 [MultiplayerService] Registered local player: ${playerId}`);
  }

  /**
   * Unregister local player
   */
  public unregisterLocalPlayer(): void {
    if (this.localPlayerId) {
      console.log(`📍 [MultiplayerService] Unregistered local player: ${this.localPlayerId}`);
      this.localPlayerId = null;
      this.localPlayerCallback = null;
    }
  }

  /**
   * Register remote player to receive position updates
   */
  public registerRemotePlayer(
    playerId: string,
    state: I_PlayerPositionUpdate,
  ): void {
    if (this.remotePlayers.has(playerId)) {
      console.warn(
        `[MultiplayerService] Remote player already registered (${playerId}). Replacing.`,
      );
    }

    this.remotePlayers.set(playerId, state);
    console.log(`👤 [MultiplayerService] Registered remote player: ${playerId}`);
  }

  /**
   * Unregister remote player
   */
  public unregisterRemotePlayer(playerId: string): void {
    if (this.remotePlayers.delete(playerId)) {
      console.log(`👤 [MultiplayerService] Unregistered remote player: ${playerId}`);
    }
  }

  /**
   * Send position update to server via WebSocket
   * Called by SyncMovementComponent
   */
  public sendPositionUpdate(data: I_PlayerPositionUpdate): void {
    if (!this.isReady()) {
      console.warn('[MultiplayerService] Cannot send position: WebSocket not connected');
      return;
    }

    try {
      /*  this.ws$.send({
         type: 'player.position',
         content: data,
       }); */
    } catch (error) {
      console.error('[MultiplayerService] Failed to send position update:', error);
    }
  }

  /**
   * Check if WebSocket is connected and ready
   */
  public isReady(): boolean {
    return true;
    // return this.ws$.isConnected.value;
  }

  /**
   * Get count of registered remote players
   * Useful for debugging
   */
  public getRemotePlayerCount(): number {
    return this.remotePlayers.size;
  }

  /**
   * Get list of registered remote player IDs
   * Useful for debugging
   */
  public getRemotePlayerIds(): string[] {
    return Array.from(this.remotePlayers.keys());
  }
}
