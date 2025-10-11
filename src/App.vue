<template>
  <div class="app-layout">
    <!-- Top Menu Bar -->
    <Menu />
    <!-- WebSocket Debugger -->
    <DebugConsole />
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import DebugConsole from '@/components/DebugConsole.vue';
import { RouterView } from 'vue-router';
import Menu from './layout/Menu.vue';


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
