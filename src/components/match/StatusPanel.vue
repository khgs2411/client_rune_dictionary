<template>
  <!-- Pokemon-inspired Status Panel -->
  <div class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 sm:p-4 min-w-[240px] sm:min-w-[280px] space-y-2">
    <!-- Name and Level -->
    <div class="flex items-center justify-between">
      <span class="text-sm sm:text-base font-semibold text-foreground">
        {{ name }}
      </span>
      <span class="text-xs sm:text-sm text-muted-foreground font-medium">
        Lv{{ level }}
      </span>
    </div>

    <!-- HP Bar -->
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted-foreground">HP</span>
        <span class="text-xs font-mono text-foreground">
          {{ hp }}/{{ maxHp }}
        </span>
      </div>
      <div class="relative w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
        <!-- HP fill with gradient (red/green) -->
        <div
          class="absolute left-0 top-0 h-full transition-all duration-300"
          :class="hpGradientClass"
          :style="{ width: `${hpPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- MP Bar -->
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted-foreground">MP</span>
        <span class="text-xs font-mono text-foreground">
          {{ mp }}/{{ maxMp }}
        </span>
      </div>
      <div class="relative w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
        <!-- MP fill with blue gradient -->
        <div
          class="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
          :style="{ width: `${mpPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- ATB Bar (Active Time Battle progress) -->
    <div class="space-y-1 pt-1 border-t border-border/50">
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted-foreground">ATB</span>
        <span class="text-xs font-mono text-muted-foreground">
          {{ Math.round(atbProgress) }}%
        </span>
      </div>
      <div class="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <!-- ATB fill progress (0-100%) -->
        <div
          :class="[
            'absolute left-0 top-0 h-full transition-all duration-200',
            entityType === 'player' ? 'bg-primary' : 'bg-destructive'
          ]"
          :style="{ width: `${atbProgress}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  // Props
  const props = defineProps<{
    entityType: 'player' | 'enemy';
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    atbProgress: number; // 0-100%
  }>();

  // Computed values
  const hpPercentage = computed(() => {
    return (props.hp / props.maxHp) * 100;
  });

  const mpPercentage = computed(() => {
    return (props.mp / props.maxMp) * 100;
  });

  // HP bar color gradient (green → yellow → red)
  const hpGradientClass = computed(() => {
    const percentage = hpPercentage.value;

    if (percentage > 66) {
      // High HP: green gradient
      return 'bg-gradient-to-r from-green-400 to-green-600';
    } else if (percentage > 33) {
      // Medium HP: yellow gradient
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    } else {
      // Low HP: red gradient
      return 'bg-gradient-to-r from-red-400 to-red-600';
    }
  });
</script>
