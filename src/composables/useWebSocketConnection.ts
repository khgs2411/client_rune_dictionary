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
  const wsStore = useWebSocketStore();
  const config = useGameConfigStore();
  const scenes = useSceneStore();

  const rx = useRxjs(['debug', 'ws']);
  const HEARTBEAT_INTERVAL = 30;

  // Hold the VueUse useWebSocket instance
  let wsInstance: ReturnType<typeof useWebSocket> | null = null;



  /**
   * Establishes WebSocket connection with handshake authentication
   * 1. Performs handshake to get client credentials
   * 2. Connects to WebSocket with credentials in protocol header
   */
  async function connect(credentials: I_HandshakeCredentials) {
    if (wsStore.isConnecting || wsStore.isConnected) {
      console.warn('[WS] Already connected or connecting');
      return;
    }

    try {
      // Step 1: Handshake
      wsStore.status = 'handshaking';
      const response = await performHandshake(credentials);
      if (!response.scene) throw new Error('No scene provided by server');
      console.log('[WS] Handshake successful:', response);

      // Step 2: Store client data
      const clientData: I_ClientData = { id: response.id, name: response.name };
      const scene = response.scene;

      wsStore.setClientData(clientData);
      scenes.setActiveScene(scene);

      // Step 3: Establish WebSocket connection
      wsStore.status = 'connecting';
      connection(clientData);
    } catch (error) {
      wsStore.status = 'disconnected';
      wsStore.lastError = error;
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

    // Create WebSocket connection
    wsInstance = useWebSocket(WS_HOST, {
      protocols: [protocol],

      // Auto-reconnect configuration
      autoReconnect: {
        retries: 3,
        delay: 2000,
        onFailed: () => {
          wsStore.status = 'disconnected';
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

  }

  /**
   * Closes WebSocket connection and resets state
   */
  function disconnect() {
    if (wsInstance) {
      wsInstance.close();
      wsInstance = null;
    }
    wsStore.$reset();
  }

  /**
   * Sends a message through the WebSocket connection
   * Automatically stringifies objects
   */
  function send(message: any) {
    if (!wsInstance || wsStore.status !== 'connected') {
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
    wsStore.status = 'connected';
    wsStore.connectedAt = new Date();
    wsStore.reconnectAttempts = 0;
    console.log('[WS] Connected successfully');
  }

  function handleDisconnected(_ws: WebSocket, event: CloseEvent) {
    wsStore.status = 'disconnected';
    wsStore.disconnectedAt = new Date();

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
    wsStore.lastError = event;

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
    status: computed(() => wsStore.status),
    isConnected: computed(() => wsStore.isConnected),
    isConnecting: computed(() => wsStore.isConnecting),
    clientData: computed(() => wsStore.clientData),
  };
};

