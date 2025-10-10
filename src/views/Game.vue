<template>
  <TresCanvas class="tres-canvas">
    <GameContext>
      <RouterView />
    </GameContext>
  </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { RouterView } from 'vue-router';

import GameContext from '@/components/GameContext.vue';
</script>

<style scoped>
.tres-canvas {
  width: 100%;
  height: 100%;
}
</style>
