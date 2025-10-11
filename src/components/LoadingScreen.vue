<template>
  <div
    v-if="isLoading || !isComplete"
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div class="flex flex-col items-center gap-6 w-full max-w-md px-6">
      <!-- Logo/Title -->
      <div class="text-center space-y-2">
        <h1 class="text-4xl font-bold tracking-tight">RUNE RPG</h1>
        <p class="text-sm text-muted-foreground">{{ sceneName || 'Loading Scene' }}</p>
      </div>

      <!-- Progress Bar -->
      <div class="w-full space-y-2">
        <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            class="h-full bg-primary transition-all duration-300 ease-out"
            :style="{ width: loadingPercentage }" />
        </div>
        <div class="flex justify-between text-xs text-muted-foreground">
          <span>{{ loadedAssets }} / {{ totalAssets }} assets</span>
          <span>{{ loadingPercentage }}</span>
        </div>
      </div>

      <!-- Current Asset -->
      <div v-if="currentAsset" class="text-xs text-center text-muted-foreground truncate w-full">
        Loading: {{ currentAsset }}
      </div>

      <!-- Error State -->
      <div v-if="error" class="text-sm text-destructive text-center">Error: {{ error }}</div>

      <!-- Loading Animation (Spinner) -->
      <div v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
        <svg
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRxjs } from 'topsyde-utils';
import type {
  SceneLoadingEvents,
  SceneLoadingStartPayload,
  SceneLoadingProgressPayload,
  SceneLoadedPayload,
  SceneErrorPayload,
} from '@/common/events.types';

// Local reactive state (updated by RxJS events)
const isLoading = ref(false);
const progress = ref(0);
const loadedAssets = ref(0);
const totalAssets = ref(0);
const currentAsset = ref('');
const sceneName = ref('');
const error = ref<string | null>(null);
const loadStartTime = ref(0);

const loadingPercentage = computed(() => `${Math.round(progress.value)}%`);
const isComplete = computed(() => progress.value >= 100 && !isLoading.value);

useRxjs('scene:loading', {
  start: (data: SceneLoadingStartPayload) => {
    isLoading.value = true;
    progress.value = 0;
    loadedAssets.value = 0;
    totalAssets.value = data.totalAssets;
    sceneName.value = data.sceneName;
    error.value = null;
    loadStartTime.value = performance.now();
    console.log(`🎬 [LoadingScreen] Loading ${data.sceneName}...`);
  },
  update: (data: SceneLoadingProgressPayload) => {
    const progressPercent = totalAssets.value > 0 ? (data.loaded / totalAssets.value) * 100 : 0;
    loadedAssets.value = data.loaded;
    progress.value = progressPercent;
    currentAsset.value = data.url || '';
    console.log(`⏳ [LoadingScreen] Progress: ${progressPercent.toFixed(2)}%`);
  },
  complete: (data: SceneLoadedPayload) => {
    isLoading.value = false;
    progress.value = 100;
    const loadTime = (performance.now() - loadStartTime.value).toFixed(0);
    console.log(`✅ [LoadingScreen] ${data.sceneName} loaded in ${loadTime}ms`);
  },
  fail: (data: SceneErrorPayload) => {
    isLoading.value = false;
    error.value = data.error;
    console.error(`❌ [LoadingScreen] Error loading ${data.sceneName}:`, data.error);
  },
});
</script>
