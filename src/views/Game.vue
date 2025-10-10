<template>
  <TresCanvas class="tres-canvas">
    <RouterView />
  </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import { RouterView } from 'vue-router';
</script>

<style scoped>
.tres-canvas {
  width: 100%;
  height: 100%;
}
</style>
