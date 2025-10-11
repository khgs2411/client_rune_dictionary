<template>
  <div class="app-layout">
    <!-- Top Menu Bar -->
    <Menu />
    <!-- WebSocket Debugger -->
    <WebSocketDebugger />
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import Menu from './layout/Menu.vue';
import WebSocketDebugger from '@/components/WebSocketDebugger.vue';
import { useRxjs } from 'topsyde-utils';
import { onMounted } from 'vue';

const rx = useRxjs('ws:debug');

onMounted(() => {
  rx.$next('message', { type: 'error', data: 'test error', timestamp: new Date().toLocaleTimeString() });
});
</script>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
  overflow: hidden;
}

.app-content {
  overflow: hidden;
}
</style>
