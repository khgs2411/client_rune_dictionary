import { I_ClientData } from '@/common/types';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type WebSocketStatus =
  | 'disconnected'
  | 'handshaking'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export type WebsocketManager = ReturnType<typeof useWebSocketStore>;

export const useWebSocketStore = defineStore('websocket', () => {
  // State
  const status = ref<WebSocketStatus>('disconnected');
  const clientData = ref<I_ClientData | null>(null);
  const connectedAt = ref<Date | null>(null);
  const disconnectedAt = ref<Date | null>(null);
  const reconnectAttempts = ref(0);
  const lastError = ref<any>(null);

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
  };
});
