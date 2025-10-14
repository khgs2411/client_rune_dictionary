import MultiplayerAPI from '@/api/multiplayer.api';
import type {
  I_MultiplayerHandler,
  I_PlayerPositionUpdate,
} from '@/game/common/multiplayer.types';
import type { I_SceneContext, I_SceneModule } from '@/game/common/scenes.types';
import { GameObjectsModule } from '@/game/modules/scene/GameObjectsModule';
import SceneModule from '@/game/modules/SceneModule';
import { RemotePlayer } from '@/game/prefabs/character/RemotePlayer';
import { useRxjs } from 'topsyde-utils';


export class MultiplayerModule extends SceneModule implements I_MultiplayerHandler, I_SceneModule {
  private rx = useRxjs(['multiplayer', 'scene'], {}, { static_instance: true });

  // Local player tracking
  private localPlayerId: string | null = null;
  private localPlayerCallback: ((data: I_PlayerPositionUpdate) => void) | null = null;

  // Remote players tracking
  private remotePlayers = new Map<string, I_PlayerPositionUpdate>;

  constructor(moduleName: string, private gameObjectManager: GameObjectsModule) {
    super(moduleName, false);
  }
  /**
   * Initialize service and subscribe to WebSocket events
   */
  public async init(context: I_SceneContext): Promise<void> {

    console.log('🌐 [MultiplayerModule] Starting...');
    const api = new MultiplayerAPI();
    // Test API connection
    try {

      if (!context.clientData || !context.clientData.id) {
        throw new Error('Client data missing or invalid');
      }

      this.rx.$subscribe({
        'scene': {
          'scene.joined': (event) => {
            console.log('[MultiplayerModule] Scene joined event:', event);
          },
          'scene.left': (event) => {
            console.log('[MultiplayerModule] Scene left event:', event);
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

      console.log('✅ [MultiplayerModule] Started');
      this.initialized(context.sceneName)
    } catch (error) {
      console.error('❌ [MultiplayerModule] Failed to connect to Multiplayer API:', error);
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

    console.log('🧹 [MultiplayerModule] Destroyed');
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
        `[MultiplayerModule] Local player already registered (${this.localPlayerId}). Replacing.`,
      );
    }

    this.localPlayerId = playerId;
    this.localPlayerCallback = onUpdate;

    console.log(`📍 [MultiplayerModule] Registered local player: ${playerId}`);
  }

  /**
   * Unregister local player
   */
  public unregisterLocalPlayer(): void {
    if (this.localPlayerId) {
      console.log(`📍 [MultiplayerModule] Unregistered local player: ${this.localPlayerId}`);
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
        `[MultiplayerModule] Remote player already registered (${playerId}). Replacing.`,
      );
    }

    this.remotePlayers.set(playerId, state);
    console.log(`👤 [MultiplayerModule] Registered remote player: ${playerId}`);
  }

  /**
   * Unregister remote player
   */
  public unregisterRemotePlayer(playerId: string): void {
    if (this.remotePlayers.delete(playerId)) {
      console.log(`👤 [MultiplayerModule] Unregistered remote player: ${playerId}`);
    }
  }

  /**
   * Send position update to server via WebSocket
   * Called by SyncMovementComponent
   */
  public sendPositionUpdate(data: I_PlayerPositionUpdate): void {
    if (!this.isReady()) {
      console.warn('[MultiplayerModule] Cannot send position: WebSocket not connected');
      return;
    }

    try {
      /*  this.ws$.send({
         type: 'player.position',
         content: data,
       }); */
    } catch (error) {
      console.error('[MultiplayerModule] Failed to send position update:', error);
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
