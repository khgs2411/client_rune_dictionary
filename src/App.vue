<template>
  <div class="app-layout">
    <!-- Top Menu Bar -->
    <Menu></Menu>
    <!-- WebSocket Manager - auto-connects on mount, disconnects on unmount -->
    <WebSocketManager v-if="auth.isAuthenticated"></WebSocketManager>
    <!-- WebSocket Debugger -->
    <DebugConsole v-if="auth.isAuthenticated" />
    <main class="app-content">
      <!-- TODO: this is a shitty solution that needs a better fix -->
      <RouterView v-if="loadRoute" />
    </main>
  </div>
</template>

<script setup lang="ts">
  import DebugConsole from '@/components/DebugConsole.vue';
  import WebSocketManager from '@/components/WebSocketManager.vue';
  import { computed } from 'vue';
  import { RouterView, useRoute } from 'vue-router';
  import Menu from './layout/Menu.vue';
  import { useAuthStore } from './stores/auth.store';
  import { useSceneStore } from './stores/scene.store';

  const auth = useAuthStore();
  const scenes = useSceneStore();

  const route = useRoute();


  const loadRoute = computed(() => {
    if (route.path == '/login') return true;
    return auth.isAuthenticated && !!scenes.getActiveScene();
  })


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
