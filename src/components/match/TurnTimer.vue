<template>
  <!-- Turn Timer - Top-center shared element -->
  <div
    v-if="isActiveTurn"
    class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg px-6 py-3 min-w-[280px] sm:min-w-[320px]">
    <!-- Turn indicator -->
    <div class="text-center mb-2">
      <span :class="['text-sm font-semibold', isPlayerTurn ? 'text-primary' : 'text-destructive']">
        {{ isPlayerTurn ? 'Your Turn' : 'Enemy Turn' }}
      </span>
    </div>

    <!-- Timer bar -->
    <div class="relative w-full h-3 sm:h-4 bg-muted rounded-full overflow-hidden">
      <!-- Fill progress -->
      <div
        :class="[
          'absolute left-0 top-0 h-full transition-all duration-100 ease-linear',
          isPlayerTurn ? 'bg-primary' : 'bg-destructive',
          isWarningState && 'animate-pulse',
        ]"
        :style="{ width: `${timePercentage}%` }"></div>

      <!-- Time remaining text (centered) -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs sm:text-sm font-mono font-bold text-foreground drop-shadow-md">
          {{ formattedTimeRemaining }}
        </span>
      </div>
    </div>

    <!-- Warning message (< 3 seconds) -->
    <div v-if="isWarningState" class="text-center mt-2">
      <span class="text-xs text-destructive font-medium animate-pulse"> Time running out! </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMatchStore } from '@/stores/match.store';

// ========================================
// Match State Integration
// ========================================

const matchStore = useMatchStore();

// Timer state from gameState composable
const isActiveTurn = computed(() => matchStore.gameState.timer.active);
const isPlayerTurn = computed(() => matchStore.gameState.turn.isPlayerTurn);
const timeRemaining = computed(() => Math.ceil((matchStore.gameState.timer.remaining ?? 0) / 1000)); // Convert ms to seconds
const maxTurnTime = computed(() =>
  Math.ceil((matchStore.gameState.timer.duration ?? 10000) / 1000),
); // Convert ms to seconds

// Computed values
const timePercentage = computed(() => {
  const max = maxTurnTime.value;
  const remaining = timeRemaining.value;
  return max > 0 ? (remaining / max) * 100 : 0;
});

const formattedTimeRemaining = computed(() => {
  return `${timeRemaining.value}s`;
});

const isWarningState = computed(() => {
  return timeRemaining.value < 3;
});
</script>
