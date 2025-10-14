import MultiplayerAPI from '@/api/multiplayer.api';
import type {
  I_MultiplayerHandler,
  I_PlayerPositionUpdate,
} from '@/game/common/multiplayer.types';
import type { I_SceneContext, I_SceneModule } from '@/game/common/scenes.types';
import { GameObjectsModule } from '@/game/modules/scene/GameObjectsModule';
import SceneModule from '@/game/modules/SceneModule';
import { LocalPlayer } from '@/game/prefabs/character/LocalPlayer';
import { RemotePlayer } from '@/game/prefabs/character/RemotePlayer';
import { WebsocketStructuredMessage } from 'topsyde-utils';


export class MultiplayerModule extends SceneModule implements I_MultiplayerHandler, I_SceneModule {

  // Local player tracking

  public localPlayer: LocalPlayer | null = null;
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
    // Test API connection
    try {

      await this.addLocalPlayer(context);
      await this.getRemotePlayers(context);
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

  private async addLocalPlayer(context: I_SceneContext) {
    if (!context.character) {
      throw new Error('Character controller missing in context');
    }
    // Create LocalPlayer GameObject (replaces CharacterModule)
    // Don't pass position config - let LocalPlayer read directly from controller
    this.localPlayer = new LocalPlayer({
      playerId: 'local-player',
      characterController: context.character.controller,
    });

    this.gameObjectManager.add(this.localPlayer, false);
  }

  private async getRemotePlayers(context: I_SceneContext) {

    const api = new MultiplayerAPI();
    if (!context.clientData || !context.clientData.id) {
      throw new Error('Client data missing or invalid');
    }

    const data = await api.getPlayersInScene(context.clientData.id);

    data.data.playersInScene.forEach(player => {
      const state: I_PlayerPositionUpdate = {
        playerId: player.id,
        playerName: player.username,
        position: player.raw.position,
        timestamp: new Date().getTime(),
      };
      const remotePlayer = new RemotePlayer({ playerId: player.id, username: player.username || "Remote Player", position: player.position });

      this.registerRemotePlayer(remotePlayer.id, state);
      this.gameObjectManager.add(remotePlayer, false);
    });
  }

  private handleSceneUpdates(message: WebsocketStructuredMessage) {
    switch (message.type) {
      case 'scene.joined': {
        console.log('[MultiplayerModule] Player joined:', message.content);
        break;
      }
      case 'scene.left': {
        const content = (message as WebsocketStructuredMessage<{ playerId: string }>).content
        const playerId = content.playerId;
        this.remotePlayers.delete(playerId);
        this.gameObjectManager.remove(playerId);
        // const remotePlayer = this.remotePlayers.get(message.content.playerId);
        console.log('[MultiplayerModule] Player left:', content.playerId);
        break;
      }

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
    // Clear registrations
    this.remotePlayers.clear();
    this.localPlayer = null;

    console.log('🧹 [MultiplayerModule] Destroyed');
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
