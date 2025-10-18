import MultiplayerAPI from '@/api/multiplayer.api';
import { PositionVector3 } from '@/common/types';
import type {
  I_MultiplayerHandler,
  I_PlayerPositionUpdate,
} from '@/game/common/multiplayer.types';
import type { I_SceneContext, I_SceneModule } from '@/game/common/scenes.types';
import { RemotePlayerComponent } from '@/game/components/multiplayer/RemotePlayerComponent';
import { GameObjectsModule } from '@/game/modules/objects/GameObjectsModule';
import SceneModule from '@/game/modules/SceneModule';
import { LocalPlayer } from '@/game/prefabs/character/LocalPlayer';
import { RemotePlayer } from '@/game/prefabs/character/RemotePlayer';
import { WebsocketStructuredMessage } from 'topsyde-utils';


export class MultiplayerModule extends SceneModule implements I_MultiplayerHandler, I_SceneModule {

  // Local player tracking
  public localPlayer: LocalPlayer | null = null;
  // Remote players tracking
  private remotePlayers = new Map<string, RemotePlayer>;

  constructor(moduleName: string, private gameObjectManager: GameObjectsModule) {
    super(moduleName, false);
  }
  
  /**
   * Initialize service and subscribe to WebSocket events
   */
  public async init(context: I_SceneContext): Promise<void> {
    console.log('🌐 [MultiplayerModule] Starting...');
    // Test API connection
    try {
      await this.fetchRemotePlayers(context);
      this.registerWithNetworkingService();

      console.log('✅ [MultiplayerModule] Started');
      this.initialized(context.sceneName)
    } catch (error) {
      console.error('❌ [MultiplayerModule] Failed to connect to Multiplayer API:', error);
    }
  }

  private registerWithNetworkingService() {
    this.context.services.networking.register('MultiplayerModule', {
      scene: this.handleSceneUpdates.bind(this),
    })
  }

  private async fetchRemotePlayers(context: I_SceneContext) {
    const api = new MultiplayerAPI();
    if (!context.clientData || !context.clientData.id) {
      throw new Error('Client data missing or invalid');
    }

    const data = await api.getPlayersInScene(context.clientData.id);

    data.data.playersInScene.forEach(player => {
      const remotePlayer = new RemotePlayer({ playerId: player.id, username: player.username || "Remote Player", position: player.position });

      this.registerRemotePlayer(remotePlayer.id, remotePlayer);
      this.gameObjectManager.add(remotePlayer, false);
    });
  }

  private handleSceneUpdates(message: WebsocketStructuredMessage) {
    switch (message.type) {
      case 'scene.joined': {
        this.onSceneJoined(message);
        break;
      }
      case 'scene.left': {
        this.onSceneLeft(message);
        break;
      }
      case 'scene.player.position':
        this.onPlayerPositionUpdate(message as WebsocketStructuredMessage<{ playerId: string, position: PositionVector3, timestamp: number }>);
        break;
    }
  }

  private onSceneLeft(message: WebsocketStructuredMessage) {
    const data = (message as WebsocketStructuredMessage<{ playerId: string; }>).content;
    const playerId = data.playerId;
    this.unregisterRemotePlayer(playerId);
    console.log('[MultiplayerModule] Player left:', data.playerId);
  }

  private onSceneJoined(message: WebsocketStructuredMessage) {
    const data = (message as WebsocketStructuredMessage<{
      id: string;
      username: string;
      position: [number, number, number];
      raw?: { position: { x: number; y: number; z: number; }; rotation?: { x: number; y: number; z: number; }; };
    }>).content;
    console.log('[MultiplayerModule] Player joined:', message.content);

    const remotePlayer = new RemotePlayer({ playerId: data.id, username: data.username || "Remote Player", position: data.position });
    this.registerRemotePlayer(remotePlayer.id, remotePlayer);
    this.gameObjectManager.add(remotePlayer, true);
  }

  private onPlayerPositionUpdate(message: WebsocketStructuredMessage<{
    playerId: string,
    position: PositionVector3,
    rotation?: { x: number, y: number, z: number },
    timestamp: number
  }>) {
    const player = this.remotePlayers.get(message.content.playerId);
    if (player) {
      const remoteComponent = player.getComponent(RemotePlayerComponent);
      if (remoteComponent) {
        remoteComponent.updatePosition({
          playerId: message.content.playerId,
          playerName: player.getUsername(),
          position: message.content.position,
          rotation: message.content.rotation, // Pass rotation through!
          timestamp: message.content.timestamp,
          playerSceneId: this.context.sceneName,
        });
      }
    }
  }

  /**
   * Cleanup subscriptions and clear registrations
   */
  async destroy(): Promise<void> {
    // Unsubscribe from RxJS
    // Clear registrations
    this.remotePlayers.forEach((_, playerId) => {
      this.unregisterRemotePlayer(playerId);
    });
    this.remotePlayers.clear();
    console.log('🧹 [MultiplayerModule] Destroyed');
  }


  /**
   * Register remote player to receive position updates
   */
  public registerRemotePlayer(
    playerId: string,
    state: RemotePlayer,
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
    if (this.remotePlayers.has(playerId)) {
      // Check if GameObject exists before removing
      if (this.gameObjectManager.has(playerId)) {
        this.gameObjectManager.remove(playerId);
      }
      this.remotePlayers.delete(playerId);
      console.log(`👤 [MultiplayerModule] Unregistered remote player: ${playerId}`);
    }
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
