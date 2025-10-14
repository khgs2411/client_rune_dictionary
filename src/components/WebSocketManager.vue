<template>
  <!-- Connect Modal (Shows when not connected and autoConnect is false) -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showConnectModal" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <!-- Modal Card -->
        <div class="w-full max-w-md space-y-6 animate-in zoom-in-95 duration-200">
          <div class="rounded-lg border border-border bg-card p-6 shadow-2xl space-y-4">
            <!-- Icon & Title -->
            <div class="text-center space-y-2">
              <div class="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold tracking-tight text-foreground">Connect to Game</h2>
              <p class="text-sm text-muted-foreground">
                Welcome, {{ auth.username }}! Click below to connect to the game server.
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {{ errorMessage }}
            </div>

            <!-- Connect Button -->
            <Button @click="handleConnect" class="w-full h-11" :disabled="isConnecting">
              <svg v-if="isConnecting" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ isConnecting ? 'Connecting...' : 'Connect to Server' }}
            </Button>

            <!-- Help Text -->
            <p class="text-center text-xs text-muted-foreground">
              Secured with SSL/TLS encryption
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Diagnostic Modal (Shows after 2 failed connection attempts) -->
  <ConnectionDiagnosticModal
    :visible="showDiagnosticModal"
    :ws-url="wsUrl"
    :protocol="wsStore.clientData ? `${wsStore.clientData.id}-${wsStore.clientData.name}` : undefined"
    @retry="handleDiagnosticRetry"
    @close="handleDiagnosticClose"
    @update:visible="showDiagnosticModal = $event"
  />
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import ConnectionDiagnosticModal from '@/components/ConnectionDiagnosticModal.vue';
import { useWebSocketConnection } from '@/composables/useWebSocketConnection';
import { useAuthStore } from '@/stores/auth.store';
import { useWebSocketStore } from '@/stores/websocket.store';
import { tryOnMounted, tryOnUnmounted } from '@vueuse/core';
import { computed, ref } from 'vue';

// Props (optional - for flexibility)
const props = withDefaults(
  defineProps<{
    autoConnect?: boolean; // Auto-connect on mount (default: true)
    autoDisconnect?: boolean; // Auto-disconnect on unmount (default: true)
  }>(),
  {
    autoConnect: true,
  },
);

const auth = useAuthStore();
const wsStore = useWebSocketStore();
const ws$ = useWebSocketConnection();
const isConnecting = ref(false);
const errorMessage = ref('');
const showDiagnosticModal = ref(false);
const connectionAttempts = ref(0);

// WebSocket URL from environment
const wsUrl = computed(() => import.meta.env.VITE_WS_HOST || 'wss://topsyde-gaming.duckdns.org:3000');

// Show modal when:
// 1. User is authenticated
// 2. Not connected
const showConnectModal = computed(() => {
  return auth.isAuthenticated && !wsStore.isConnected;
});

async function handleConnect() {
  if (!auth.isAuthenticated) {
    console.warn('[WebSocketManager] Cannot connect: Not authenticated');
    return;
  }

  isConnecting.value = true;
  errorMessage.value = '';
  connectionAttempts.value++;

  try {
    console.log('[WebSocketManager] Connecting to WebSocket...');

    // ✅ This happens during user click - popup blockers won't trigger!
    await ws$.connect();
    ws$.register();

    console.log('✅ [WebSocketManager] Connected successfully!');
    connectionAttempts.value = 0; // Reset on success
  } catch (error: any) {
    console.error('❌ [WebSocketManager] Connection failed:', error);
    errorMessage.value = error?.message || 'Failed to connect. Please try again.';

    // Show diagnostic modal after 2 failed attempts
    if (connectionAttempts.value >= 2) {
      console.warn('[WebSocketManager] Multiple connection failures, showing diagnostic modal');
      showDiagnosticModal.value = true;
    }
  } finally {
    isConnecting.value = false;
  }
}

function handleDiagnosticRetry() {
  console.log('[WebSocketManager] Retrying connection from diagnostic modal...');
  showDiagnosticModal.value = false;
  connectionAttempts.value = 0; // Reset attempts
  handleConnect();
}

function handleDiagnosticClose() {
  console.log('[WebSocketManager] Diagnostic modal closed');
  showDiagnosticModal.value = false;
}

function disconnect() {
  ws$.disconnect();
}

tryOnMounted(() => {
  if (props.autoConnect) {
    handleConnect();
  }
});

tryOnUnmounted(disconnect);
</script>

<style scoped>

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .animate-in {
    animation: zoom-in 0.2s ease-out;
  }

  @keyframes zoom-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
