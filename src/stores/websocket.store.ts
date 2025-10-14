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
type WebsocketEventHandlerType = 'connected' | 'data' | 'disconnected' | 'error';
type WebSocketEventHandlers = {
  [E_WebsocketEventType.CONNECTED]?: (ws: WebSocket) => void | Promise<void>;
  [E_WebsocketEventType.DATA]?: WebSocketEventCallback;
  [E_WebsocketEventType.DISCONNECTED]?: (ws: WebSocket, event: CloseEvent) => void | Promise<void>;
  [E_WebsocketEventType.ERROR]?: (ws: WebSocket, event: Event) => void | Promise<void>;
};

export const useWebSocketStore = defineStore('websocket', () => {
  // State
  const registry: Ref<Map<string, WebSocketEventHandlers>> = ref(new Map());
  const status = ref<WebSocketStatus>('disconnected');
  const clientData = ref<I_ClientData | null>(null);
  const connectedAt = ref<Date | null>(null);
  const disconnectedAt = ref<Date | null>(null);
  const reconnectAttempts = ref(0);
  const lastError = ref<any>(null);
  let _ws: WebsocketInstance | null;

  // Computed
  const isConnected = computed(() => status.value === 'connected');
  const isConnecting = computed(
    () =>
      status.value === 'connecting' ||
      status.value === 'handshaking' ||
      status.value === 'reconnecting',
  );

  const isDisconnected = computed(() => status.value === 'disconnected');

  const isActive = computed(() => !Guards.IsNil(_ws) && !Guards.IsNil(_ws.ws.value) && isConnected.value);

  const connectionHandlers = computed((): Map<string, WebSocketEventHandlers['connected']> => {
    const map = new Map<string, WebSocketEventHandlers['connected']>();
    registry.value.forEach((handlers, source) => {
      if (handlers.connected) {
        map.set(source, handlers.connected);
      }
    });
    return map;
  });

  const disconnectionHandlers = computed((): Map<string, WebSocketEventHandlers['disconnected']> => {
    const map = new Map<string, WebSocketEventHandlers['disconnected']>();
    registry.value.forEach((handlers, source) => {
      if (handlers.disconnected) {
        map.set(source, handlers.disconnected);
      }
    });
    return map;
  });

  const messageHandlers = computed((): Map<string, WebSocketEventHandlers['data']> => {
    const map = new Map<string, WebSocketEventHandlers['data']>();
    registry.value.forEach((handlers, source) => {
      if (handlers.data) {
        map.set(source, handlers.data);
      }
    });
    return map;
  });

  const errorHandlers = computed((): Map<string, WebSocketEventHandlers['error']> => {
    const map = new Map<string, WebSocketEventHandlers['error']>();
    registry.value.forEach((handlers, source) => {
      if (handlers.error) {
        map.set(source, handlers.error);
      }
    });
    return map;
  });

  // Actions
  function setClientData(data: I_ClientData) {
    if (!clientData.value) {
      clientData.value = { id: data.id, name: data.name };
    }
  }

  function $reset() {
    status.value = 'disconnected';
    clientData.value = null;
    connectedAt.value = null;
    disconnectedAt.value = null;
    reconnectAttempts.value = 0;
    lastError.value = null;
  }

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
    });;
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

  function register(source: string, callback: WebSocketEventHandlers) {
    registry.value.set(source, callback);
  }

  function unregister(source: string) {
    registry.value.delete(source);
  }

  async function handleConnected(_ws: WebSocket) {
    status.value = 'connected';
    connectedAt.value = new Date();
    reconnectAttempts.value = 0;
    console.log('[WS] Connected successfully');
    const promises: (void | Promise<void>)[] = [];
    connectionHandlers.value.forEach((handler) => {
      if (handler) {
        promises.push(handler(_ws));
      }
    });

    await Promise.all(promises);
  }

  async function handleDisconnected(_ws: WebSocket, event: CloseEvent) {
    status.value = 'disconnected';
    disconnectedAt.value = new Date();
    const promises: (void | Promise<void>)[] = [];
    disconnectionHandlers.value.forEach((handler) => {
      if (handler) {
        promises.push(handler(_ws, event));
      }
    });

    await Promise.all(promises);
    console.log('[WS] Disconnected', { code: event.code, reason: event.reason });
  }

  async function handleMessage(_ws: WebSocket, event: MessageEvent) {
    try {
      const message: WebsocketStructuredMessage = JSON.parse(event.data);

      if (!isActive.value) return;

      const promises: (void | Promise<void>)[] = [];
      messageHandlers.value.forEach((handler) => {
        if (handler) {
          promises.push(handler(_ws, message));
        }
      });

      await Promise.all(promises);

    } catch (error) {
      console.error('[WS] Failed to parse message:', error);
    }
  }


  async function handleError(_ws: WebSocket, event: Event) {
    console.error('[WS] Error:', event);
    const promises: (void | Promise<void>)[] = [];
    errorHandlers.value.forEach((handler) => {
      if (handler) {
        promises.push(handler(_ws, event));
      }
    });

    await Promise.all(promises);
    lastError.value = event;
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
