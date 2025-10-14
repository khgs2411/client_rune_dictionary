import { I_ClientData } from '@/common/types';
import { useWebSocket } from '@vueuse/core';
import { defineStore } from 'pinia';
import { Guards, WebsocketStructuredMessage } from 'topsyde-utils';
import { ref, computed } from 'vue';

export type WebSocketStatus =
  | 'disconnected'
  | 'handshaking'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export type WebsocketManager = ReturnType<typeof useWebSocketStore>;

export type WebsocketInstance = ReturnType<typeof useWebSocket<WebsocketStructuredMessage>> | null;

export const useWebSocketStore = defineStore('websocket', () => {
  // State
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

  function setWebSocketInstance(instance: WebsocketInstance) {
    _ws = instance;
  }

  function getWebSocketInstance(): WebsocketInstance {
    if (!_ws) {
      throw new Error('WebSocket instance not initialized');
    }
    return _ws as WebsocketInstance;
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
    setWebSocketInstance,
    getWebSocketInstance,
  };
});
