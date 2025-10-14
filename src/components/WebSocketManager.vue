<script setup lang="ts">
import {
  useWebSocketConnection,
  type I_HandshakeCredentials,
} from '@/composables/useWebSocketConnection';
import { useAuthStore } from '@/stores/auth.store';
import { useWebSocketStore } from '@/stores/websocket.store';
import { tryOnMounted, tryOnUnmounted } from '@vueuse/core';
import { watch } from 'vue';

// Props (optional - for flexibility)

const props = withDefaults(
  defineProps<{
    autoConnect?: boolean; // Auto-connect on mount (default: true)
    autoDisconnect?: boolean; // Auto-disconnect on unmount (default: true)
  }>(),
  {
    autoConnect: true,
    autoDisconnect: true,
  },
);

const auth = useAuthStore();
const wsStore = useWebSocketStore();
const ws$ = useWebSocketConnection();

async function connect() {
  if (!props.autoConnect) return;

  if (!auth.isAuthenticated) {
    console.warn('[WebSocketManager] Cannot connect: Not authenticated');
    return;
  }

  try {
    // Build credentials from auth store
    const credentials: I_HandshakeCredentials = {
      username: auth.username || '',
      password: auth.password || '',
      api_key: import.meta.env.VITE_API_KEY,
    };

    await ws$.connect(credentials);
  } catch (error) {
    console.error('[WebSocketManager] Connection failed:', error);
  }
}

function disconnect() {
  if (props.autoDisconnect) {
    ws$.disconnect();
  }
}

tryOnMounted(connect);

tryOnUnmounted(disconnect);

// Watch auth state for disconnection
watch(
  () => auth.isAuthenticated,
  (isAuth) => {
    if (!isAuth && wsStore.isConnected) {
      console.log('[WebSocketManager] User logged out, disconnecting WebSocket');
      ws$.disconnect();
    }
  },
);
</script>

<template>
  <!-- Empty template - component only manages lifecycle -->
</template>
