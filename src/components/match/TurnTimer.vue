<template>
  <!-- Turn Timer - Top-center shared element -->
  <div
    v-if="isActiveTurn"
    class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg px-6 py-3 min-w-[280px] sm:min-w-[320px]"
  >
    <!-- Turn indicator -->
    <div class="text-center mb-2">
      <span :class="[
        'text-sm font-semibold',
        isPlayerTurn ? 'text-primary' : 'text-destructive'
      ]">
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
          isWarningState && 'animate-pulse'
        ]"
        :style="{ width: `${timePercentage}%` }"
      ></div>

      <!-- Time remaining text (centered) -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs sm:text-sm font-mono font-bold text-foreground drop-shadow-md">
          {{ formattedTimeRemaining }}
        </span>
      </div>
    </div>

    <!-- Warning message (< 3 seconds) -->
    <div v-if="isWarningState" class="text-center mt-2">
      <span class="text-xs text-destructive font-medium animate-pulse">
        Time running out!
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  // ========================================
  // PLACEHOLDER LOGIC
  // ========================================
  // TODO: Replace with real turn timer data from match state

  const isActiveTurn = ref(true); // Whether any turn is active
  const isPlayerTurn = ref(true); // Whose turn (player vs enemy)
  const timeRemaining = ref(7); // Seconds remaining (0-10)
  const maxTurnTime = ref(10); // Max turn duration in seconds

  // Computed values
  const timePercentage = computed(() => {
    return (timeRemaining.value / maxTurnTime.value) * 100;
  });

  const formattedTimeRemaining = computed(() => {
    return `${timeRemaining.value}s`;
  });

  const isWarningState = computed(() => {
    return timeRemaining.value < 3;
  });

  // ========================================
  // FUTURE: Connect to match state
  // ========================================
  // - Listen to match.turnTimer WebSocket event
  // - Update timeRemaining every second
  // - Toggle isPlayerTurn based on active character
  // - Hide timer (isActiveTurn = false) when no active turn
  // - Auto-pass or default action when timer hits 0
</script>
