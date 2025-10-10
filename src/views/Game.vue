<template>
  <TresCanvas class="tres-canvas">
    <DonutScene />
  </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import DonutScene from '@/components/DonutScene.vue';
</script>

<style scoped>
.tres-canvas {
  width: 100%;
  height: 100%;
}
</style>
