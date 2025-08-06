<template>
  <div class="speed-modifiers space-y-4">
    <!-- Player Speed Analysis -->
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium">Player Speed</span>
        <Badge :variant="getSpeedVariant(playerSpeed)">
          {{ playerSpeed }} SPD
        </Badge>
      </div>
      <div class="space-y-1">
        <div class="flex justify-between text-xs">
          <span class="text-muted-foreground">Turn Frequency</span>
          <span>{{ getSpeedDescription(playerSpeed) }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-muted-foreground">Damage Modifier</span>
          <span :class="getModifierClass(playerSpeedModifier)">
            {{ playerSpeedModifier > 1 ? '+' : '' }}{{ ((playerSpeedModifier - 1) * 100).toFixed(0) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Enemy Speed Analysis -->
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium">Enemy Speed</span>
        <Badge :variant="getSpeedVariant(enemySpeed)">
          {{ enemySpeed }} SPD
        </Badge>
      </div>
      <div class="space-y-1">
        <div class="flex justify-between text-xs">
          <span class="text-muted-foreground">Turn Frequency</span>
          <span>{{ getSpeedDescription(enemySpeed) }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-muted-foreground">Damage Modifier</span>
          <span :class="getModifierClass(enemySpeedModifier)">
            {{ enemySpeedModifier > 1 ? '+' : '' }}{{ ((enemySpeedModifier - 1) * 100).toFixed(0) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Speed Comparison -->
    <div class="pt-3 border-t">
      <div class="text-sm space-y-2">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Speed Advantage</span>
          <span class="font-medium">
            {{ speedDifference > 0 ? 'Player' : speedDifference < 0 ? 'Enemy' : 'None' }}
            {{ speedDifference !== 0 ? `(${Math.abs(speedDifference)} SPD)` : '' }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Turn Ratio</span>
          <span class="font-medium">
            {{ playerTurnRatio.toFixed(1) }} : {{ enemyTurnRatio.toFixed(1) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Visual Speed Bar -->
    <div class="space-y-2">
      <div class="flex gap-2">
        <div class="flex-1">
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-300"
              :style="{ width: `${(playerSpeed / 100) * 100}%` }"
            />
          </div>
          <span class="text-xs text-muted-foreground">Player</span>
        </div>
        <div class="flex-1">
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-destructive transition-all duration-300"
              :style="{ width: `${(enemySpeed / 100) * 100}%` }"
            />
          </div>
          <span class="text-xs text-muted-foreground">Enemy</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import type { FormulaResult } from '@/stores/damageCalculator.store';

interface Props {
  playerSpeed: number;
  enemySpeed: number;
  results: FormulaResult[];
}

const props = defineProps<Props>();

const speedDifference = computed(() => props.playerSpeed - props.enemySpeed);

const playerSpeedModifier = computed(() => {
  const speedResult = props.results.find(r => r.formula === 'speed-conscious');
  return speedResult?.speedModifier || 1;
});

const enemySpeedModifier = computed(() => {
  // Simplified - in real game this would be calculated for enemy too
  if (props.enemySpeed > 50) return 0.9;
  if (props.enemySpeed < 30) return 1.2;
  return 1;
});

const playerTurnRatio = computed(() => {
  const baseRatio = props.playerSpeed / 50;
  return Math.max(0.5, Math.min(2, baseRatio));
});

const enemyTurnRatio = computed(() => {
  const baseRatio = props.enemySpeed / 50;
  return Math.max(0.5, Math.min(2, baseRatio));
});

const getSpeedVariant = (speed: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (speed >= 70) return 'destructive';
  if (speed >= 50) return 'default';
  if (speed >= 30) return 'secondary';
  return 'outline';
};

const getSpeedDescription = (speed: number): string => {
  if (speed >= 70) return 'Very Fast';
  if (speed >= 50) return 'Fast';
  if (speed >= 30) return 'Normal';
  return 'Slow';
};

const getModifierClass = (modifier: number): string => {
  if (modifier > 1) return 'text-green-600';
  if (modifier < 1) return 'text-red-600';
  return '';
};
</script>

<style scoped>
.speed-modifiers {
  @apply w-full;
}

.text-green-600 {
  color: #16a34a;
}

.text-red-600 {
  color: #dc2626;
}
</style>