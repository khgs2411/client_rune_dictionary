import AuthAPI from '@/api/auth.api';
import { I_DebugConsoleEvent } from '@/common/events.types';
import { I_ClientData, I_ConnectedClientData } from '@/common/types';
import { useAuthStore } from '@/stores/auth.store';
import { useGameConfigStore } from '@/stores/config.store';
import { useSceneStore } from '@/stores/scene.store';
import { useWebSocketStore } from '@/stores/websocket.store';
import { useRxjs, WebsocketStructuredMessage } from 'topsyde-utils';
import { computed } from 'vue';

export interface I_HandshakeCredentials {
  username: string;
  password: string;
  api_key: string;
}

export const useWebSocketConnection = () => {
  const websocketManager = useWebSocketStore();
  const config = useGameConfigStore();
  const scenes = useSceneStore();
  const auth = useAuthStore();
  const rx = useRxjs(['debug', 'ws']);

  // Hold the VueUse useWebSocket instance

  /**
   * Establishes WebSocket connection with handshake authentication
   * 1. Performs handshake to get client credentials
   * 2. Connects to WebSocket with credentials in protocol header
   */
  async function connect() {
    if (websocketManager.isConnecting || websocketManager.isConnected) {
      console.warn('[WS] Already connected or connecting');
      return;
    }

    // Build credentials from auth store
    const credentials: I_HandshakeCredentials = {
      username: auth.username || '',
      password: auth.password || '',
      api_key: import.meta.env.VITE_API_KEY,
    };

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

    // Create WebSocket connection
    websocketManager.connect(protocol);
  }

  function register() {
    // Step 4: Register event handlers
    websocketManager.register('useWebsocketConnection', {
      data: handleMessage,
    })
  }

  /**
   * Closes WebSocket connection and resets state
   */
  function disconnect() {
    websocketManager.disconnect();
    websocketManager.$reset();
  }

  /**
   * Sends a message through the WebSocket connection
   * Automatically stringifies objects
   */
  function send(message: any) {
    const wsInstance = websocketManager.getWebSocketInstance();
    if (!wsInstance || !websocketManager.isConnected) {
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

  function handleMessage(_ws: WebSocket, message: WebsocketStructuredMessage) {
    try {

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

    emitDebugEvents(event);
  }


  function emitDebugEvents(event: Omit<I_DebugConsoleEvent, "timestamp">) {
    if (event.type.includes('scene')) return;
    rx.$next('debug', {
      cta: 'log',
      data: { ...event, timestamp: new Date().toLocaleTimeString() },
    });
  }



  return {
    connect,
    register,
    disconnect,
    send,

    // Reactive state from store (computed)
    status: computed(() => websocketManager.status),
    isConnected: computed(() => websocketManager.isConnected),
    isConnecting: computed(() => websocketManager.isConnecting),
    clientData: computed(() => websocketManager.clientData),
  };

};

