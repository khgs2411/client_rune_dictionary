<template>
    <div class="game">
        <template v-if="auth.isAuthenticated">
            <!-- Application Console Debugger -->
            <DebugConsole />
            <!-- WebSocket Manager with Connect Modal -->
            <WebSocketManager v-if="auth.isAuthenticated" :auto-connect="true" />
        </template>
        <!-- Scene Component (only shows when connected) -->
        <Scene v-if="websocketManager.isConnected" />
    </div>
</template>

<script lang='ts' setup>
    import DebugConsole from '@/components/DebugConsole.vue';
    import WebSocketManager from '@/components/WebSocketManager.vue';
    import { useAuthStore } from '@/stores/auth.store';
    import { useWebSocketStore } from '@/stores/websocket.store';
    import { watch } from 'vue';
    import { useRouter } from 'vue-router';
    import Scene from './Scene.vue';

    const auth = useAuthStore();
    const websocketManager = useWebSocketStore();
    // const isDev = import.meta.env.DEV;
    const router = useRouter();


    watch(() => auth.isAuthenticated, (newVal) => {
        if (!newVal) {
            console.log('User logged out, disconnecting WebSocket');
            websocketManager.disconnect();
            router.push('/login');
        }
    }, { immediate: true });

</script>

<style lang="scss" scoped></style>