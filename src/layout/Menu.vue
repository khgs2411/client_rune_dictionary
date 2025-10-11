<template>
  <header class="flex justify-end items-center gap-1 px-3 py-1 border-b border-border bg-background">
    <GameSettings />
    <ApplicationSettings />
  </header>
</template>

<script setup lang="ts">
import ApplicationSettings from '@/components/ApplicationSettings.vue';
import GameSettings from '@/components/GameSettings.vue';
</script>
