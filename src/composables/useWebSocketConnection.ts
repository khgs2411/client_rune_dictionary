import AuthAPI from '@/api/auth.api';
import { I_DebugConsoleEvent } from '@/common/events.types';
import { I_ClientData, I_ConnectedClientData } from '@/common/types';
import { useGameConfigStore } from '@/stores/config.store';
import { useSceneStore } from '@/stores/scene.store';
import { useWebSocketStore } from '@/stores/websocket.store';
import { useWebSocket } from '@vueuse/core';
import { useRxjs, WebsocketStructuredMessage } from 'topsyde-utils';
import { computed } from 'vue';

export interface I_HandshakeCredentials {
  username: string;
  password: string;
  api_key: string;
}

const WS_HOST = import.meta.env.VITE_WS_HOST || 'wss://topsyde-gaming.duckdns.org:3000';

export const useWebSocketConnection = () => {
  const websocketManager = useWebSocketStore();
  const config = useGameConfigStore();
  const scenes = useSceneStore();

  const rx = useRxjs(['debug', 'ws']);
  const HEARTBEAT_INTERVAL = 30;

  // Hold the VueUse useWebSocket instance



  /**
   * Establishes WebSocket connection with handshake authentication
   * 1. Performs handshake to get client credentials
   * 2. Connects to WebSocket with credentials in protocol header
   */
  async function connect(credentials: I_HandshakeCredentials) {
    if (websocketManager.isConnecting || websocketManager.isConnected) {
      console.warn('[WS] Already connected or connecting');
      return;
    }

    try {
      // Step 1: Handshake
      websocketManager.status = 'handshaking';
      const response = await performHandshake(credentials);
      if (!response.scene) throw new Error('No scene provided by server');
      console.log('[WS] Handshake successful:', response);

      // Step 2: Store client data
      const clientData: I_ClientData = { id: response.id, name: response.name };
      const scene = response.scene;

      websocketManager.setClientData(clientData);
      scenes.setActiveScene(scene);

      // Step 3: Establish WebSocket connection
      websocketManager.status = 'connecting';
      connection(clientData);
    } catch (error) {
      websocketManager.status = 'disconnected';
      websocketManager.lastError = error;
      console.error('[WS] Connection failed:', error);
      throw error;
    }
  }

  /**
  * Establishes WebSocket connection with VueUse useWebSocket
  * Configures auto-reconnect and heartbeat
  */
  function connection(clientData: I_ClientData) {
    // Build WebSocket subprotocol: "{id}-{username}"
    const protocol = `${clientData.id}-${clientData.name}`;

    let wsInstance: ReturnType<typeof useWebSocket<WebsocketStructuredMessage>> | null = null;
    // Create WebSocket connection
    wsInstance = useWebSocket(WS_HOST, {
      protocols: [protocol],

      // Auto-reconnect configuration
      autoReconnect: {
        retries: 3,
        delay: 2000,
        onFailed: () => {
          websocketManager.status = 'disconnected';
          console.error('[WS] Auto-reconnect failed after retries');

          emit({
            type: 'system.reconnect.failed',
            data: { attempts: 3 },
          });
        },
      },

      // Heartbeat (ping/pong)
      heartbeat: {
        interval: HEARTBEAT_INTERVAL * 1000,
        pongTimeout: HEARTBEAT_INTERVAL * 1000,
        message: 'ping',
      },

      // Event handlers
      onConnected: handleConnected,
      onDisconnected: handleDisconnected,
      onMessage: handleMessage,
      onError: handleError,
    });
    websocketManager.setWebSocketInstance(wsInstance);
  }

  /**
   * Closes WebSocket connection and resets state
   */
  function disconnect() {
    const wsInstance = websocketManager.getWebSocketInstance();
    if (wsInstance) {
      wsInstance.close();
      websocketManager.setWebSocketInstance(null);
    }
    websocketManager.$reset();
  }

  /**
   * Sends a message through the WebSocket connection
   * Automatically stringifies objects
   */
  function send(message: any) {
    const wsInstance = websocketManager.getWebSocketInstance();
    if (!wsInstance || websocketManager.status !== 'connected') {
      throw new Error('WebSocket not connected');
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    wsInstance.send(payload);
  }

  /**
   * Performs handshake with server using AuthAPI
   * Returns client data (id, name) for WebSocket protocol
   */
  async function performHandshake(credentials: I_HandshakeCredentials): Promise<I_ConnectedClientData> {
    const api = new AuthAPI('api', import.meta.env.VITE_HOST);
    const handshakeRes = await api.handshake(
      credentials.username,
      credentials.password,
      credentials.api_key,
    );

    return {
      id: handshakeRes.data.id,
      name: handshakeRes.data.name,
      scene: handshakeRes.data.scene,
    };
  }

  function handleConnected(_ws: WebSocket) {
    websocketManager.status = 'connected';
    websocketManager.connectedAt = new Date();
    websocketManager.reconnectAttempts = 0;
    console.log('[WS] Connected successfully');
  }

  function handleDisconnected(_ws: WebSocket, event: CloseEvent) {
    websocketManager.status = 'disconnected';
    websocketManager.disconnectedAt = new Date();

    console.log('[WS] Disconnected', { code: event.code, reason: event.reason });

    // Emit to debugger
    emit({
      type: 'system.disconnected',
      data: { code: event.code, reason: event.reason },
    });
  }

  function handleMessage(_ws: WebSocket, event: MessageEvent) {
    try {
      const message: WebsocketStructuredMessage = JSON.parse(event.data);

      if (message.type == 'message') {
        // this will be in the chat soon
        console.log('[WS] Chat message received:', message);
        return
      }

      emit({ ...message, data: message.content });

    } catch (error) {
      console.error('[WS] Failed to parse message:', error);
    }
  }

  /**
   * Emits debug events to debug namespace for DebugConsole
   * Only emits if debug console is enabled in config
   */
  function emit(event: Omit<I_DebugConsoleEvent, 'timestamp'>) {
    if (!config.debug.showWebSocketDebugger) return;
    rx.$next('debug', {
      cta: 'log',
      data: { ...event, timestamp: new Date().toLocaleTimeString() },
    });

    if (event.type == 'scene') {
      rx.$next('scene', { cta: event.type, data: event })
    }
  }

  function handleError(_ws: WebSocket, event: Event) {
    console.error('[WS] Error:', event);
    websocketManager.lastError = event;

    emit({
      type: 'system.error',
      data: event,
    });
  }


  return {
    connect,
    disconnect,
    send,

    // Reactive state from store (computed)
    status: computed(() => websocketManager.status),
    isConnected: computed(() => websocketManager.isConnected),
    isConnecting: computed(() => websocketManager.isConnecting),
    clientData: computed(() => websocketManager.clientData),
  };
};

