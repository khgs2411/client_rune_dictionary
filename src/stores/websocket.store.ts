import { I_ClientData } from '@/common/types';
import { useWebSocket } from '@vueuse/core';
import { defineStore } from 'pinia';
import { Guards, WebsocketStructuredMessage } from 'topsyde-utils';
import { ref, computed, Ref } from 'vue';

export type WebSocketStatus =
  | 'disconnected'
  | 'handshaking'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export type WebsocketManager = ReturnType<typeof useWebSocketStore>;

export type WebsocketInstance = ReturnType<typeof useWebSocket<WebsocketStructuredMessage>> | null;

const WS_HOST = import.meta.env.VITE_WS_HOST || 'wss://topsyde-gaming.duckdns.org:3000';
const HEARTBEAT_INTERVAL = 30;

type WebSocketEventCallback = (ws: WebSocket, wsm: WebsocketStructuredMessage) => void | Promise<void>;

enum E_WebsocketEventType {
  CONNECTED = 'connected',
  DATA = 'data',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export type WebsocketEventHandlerType = keyof typeof E_WebsocketEventType

type WebSocketEventHandlers = {
  [E_WebsocketEventType.CONNECTED]?: (ws: WebSocket) => void | Promise<void>;
  [E_WebsocketEventType.DATA]?: WebSocketEventCallback;
  [E_WebsocketEventType.DISCONNECTED]?: (ws: WebSocket, event: CloseEvent) => void | Promise<void>;
  [E_WebsocketEventType.ERROR]?: (ws: WebSocket, event: Event) => void | Promise<void>;
};

export const useWebSocketStore = defineStore('websocket', () => {
  const registry: Ref<Map<string, WebSocketEventHandlers>> = ref(new Map());
  const status = ref<WebSocketStatus>('disconnected');
  const clientData = ref<I_ClientData | null>(null);
  const connectedAt = ref<Date | null>(null);
  const disconnectedAt = ref<Date | null>(null);
  const reconnectAttempts = ref(0);
  const lastError = ref<any>(null);
  let _ws: WebsocketInstance | null;

  const isConnected = computed(() => status.value === 'connected');
  const isConnecting = computed(
    () =>
      status.value === 'connecting' ||
      status.value === 'handshaking' ||
      status.value === 'reconnecting',
  );

  const isDisconnected = computed(() => status.value === 'disconnected');


  function connect(protocol: string,) {
    status.value = 'connecting';
    _ws = useWebSocket(WS_HOST, {
      protocols: [protocol],

      // Auto-reconnect configuration
      autoReconnect: {
        retries: 3,
        delay: 2000,
        onFailed: () => {
          status.value = 'disconnected';
          console.error('[WS] Auto-reconnect failed after retries');

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

  function getWebSocketInstance(): WebsocketInstance {
    if (!_ws) {
      throw new Error('WebSocket instance not initialized');
    }
    return _ws as WebsocketInstance;
  }

  function disconnect() {
    if (_ws) {
      _ws.close();
      _ws = null;
    }
  }

  async function handleConnected(_ws: WebSocket) {
    status.value = 'connected';
    connectedAt.value = new Date();
    reconnectAttempts.value = 0;
    console.log('[WS] Connected successfully');
    const promises: Promise<void>[] = [];
    registry.value.forEach((handlers) => {
      if (handlers.connected) {
        promises.push(Promise.resolve(handlers.connected(_ws)));
      }
    });

    await Promise.all(promises);
  }

  async function handleDisconnected(_ws: WebSocket, event: CloseEvent) {
    status.value = 'disconnected';
    disconnectedAt.value = new Date();
    const promises: Promise<void>[] = [];
    registry.value.forEach((handlers) => {
      if (handlers.disconnected) {
        promises.push(Promise.resolve(handlers.disconnected(_ws, event)));
      }
    });

    await Promise.all(promises);
    console.log('[WS] Disconnected', { code: event.code, reason: event.reason });
  }

  async function handleMessage(_ws: WebSocket, event: MessageEvent) {
    try {
      const message: WebsocketStructuredMessage = JSON.parse(event.data);

      if (!isConnected.value) return;

      const promises: Promise<void>[] = [];
      registry.value.forEach((handlers) => {
        if (handlers.data) {
          promises.push(Promise.resolve(handlers.data(_ws, message)));
        }
      });

      await Promise.all(promises);

    } catch (error) {
      console.error('[WS] Failed to parse message:', error);
    }
  }

  async function handleError(_ws: WebSocket, event: Event) {
    console.error('[WS] Error:', event);
    const promises: Promise<void>[] = [];
    registry.value.forEach((handlers) => {
      if (handlers.error) {
        promises.push(Promise.resolve(handlers.error(_ws, event)));
      }
    });

    await Promise.all(promises);
    lastError.value = event;
  }



  function register(source: string, callback: WebSocketEventHandlers) {
    if (import.meta.env.DEV) {
      // Strict validation in development
      validateRegistration(source, callback);
    }

    registry.value.set(source, callback);
  }

  function validateRegistration(source: string, callback: WebSocketEventHandlers) {
    // Validate source
    if (!source || typeof source !== 'string') {
      throw new Error('[WS] Registration failed: source must be a non-empty string');
    }

    // Check for duplicate registration
    if (registry.value.has(source)) {
      console.warn(`[WS] Overwriting existing handlers for "${source}"`);
    }

    // Validate handler types
    const validKeys: (keyof WebSocketEventHandlers)[] = [E_WebsocketEventType.CONNECTED, E_WebsocketEventType.DATA, E_WebsocketEventType.DISCONNECTED, E_WebsocketEventType.ERROR];
    const providedKeys = Object.keys(callback) as (keyof WebSocketEventHandlers)[];

    providedKeys.forEach(key => {
      if (!validKeys.includes(key)) {
        console.warn(`[WS] Unknown handler type "${key}" in registration for "${source}"`);
      }

      if (callback[key] && typeof callback[key] !== 'function') {
        throw new Error(`[WS] Handler "${key}" for "${source}" must be a function, got ${typeof callback[key]}`);
      }
    });

    // Validate handler signatures (optional, more strict)
    if (callback.connected) {
      const fnStr = callback.connected.toString();
      // Basic check: should accept at least 1 parameter (ws)
      if (callback.connected.length < 1) {
        console.warn(`[WS] Handler "connected" for "${source}" may have incorrect signature (expects ws: WebSocket)`);
      }
    }
  }


  function unregister(source: string) {
    registry.value.delete(source);
  }


  function setClientData(data: I_ClientData) {
    if (clientData.value &&
      (clientData.value.id !== data.id || clientData.value.name !== data.name)) {
      console.warn(
        `[WS] Updating client data from ${clientData.value.name} (${clientData.value.id}) ` +
        `to ${data.name} (${data.id})`
      );
    }
    clientData.value = { id: data.id, name: data.name };
  }

  function $reset() {
    status.value = 'disconnected';
    clientData.value = null;
    connectedAt.value = null;
    disconnectedAt.value = null;
    reconnectAttempts.value = 0;
    lastError.value = null;
    registry.value.clear();
  }


  return {
    // State
    status,
    clientData,
    connectedAt,
    disconnectedAt,
    reconnectAttempts,
    lastError,

    // Computed
    isConnected,
    isConnecting,
    isDisconnected,

    // Actions
    setClientData,
    $reset,
    register,
    unregister,
    connect,
    getWebSocketInstance,
    disconnect,
  };
});
