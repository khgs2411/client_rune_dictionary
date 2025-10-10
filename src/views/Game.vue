<template>
  <TresCanvas class="tres-canvas">
    <GameContext :has-character="hasCharacter">
      <RouterView />
    </GameContext>
  </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import GameContext from '@/components/GameContext.vue';

const route = useRoute();

// Read hasCharacter from route meta (defaults to true)
const hasCharacter = computed(() => {
  return route.meta.hasCharacter !== false;
});
</script>

<style scoped>
.tres-canvas {
  width: 100%;
  height: 100%;
}
</style>
