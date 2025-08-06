<template>
  <div class="p-4 border rounded-lg">
    <div class="flex items-start justify-between mb-3">
      <div>
        <h4 class="text-sm font-semibold capitalize flex items-center gap-2">
          {{ formatFormulaName(result.formula) }}
          <Badge variant="outline" size="sm">
            {{ result.attackType }}
          </Badge>
        </h4>
      </div>
      <Badge :variant="getDamageVariant(result.damage.average)">
        {{ result.damage.min }}-{{ result.damage.max }} dmg
      </Badge>
    </div>

    <!-- Damage Range Bar -->
    <div class="space-y-2 mb-3">
      <div class="relative">
        <div class="absolute inset-0 bg-muted" style="border-radius: 9999px;" />
        <div 
          class="relative h-2 transition-all duration-300"
          style="border-radius: 9999px;"
          :class="getDamageBarColor(result.damage.average)"
          :style="{ width: `${getDamagePercentage(result.damage.average)}%` }"
        />
      </div>
      <div class="flex justify-between text-xs text-muted-foreground">
        <span>Min: {{ result.damage.min }}</span>
        <span>Avg: {{ result.damage.average.toFixed(1) }}</span>
        <span>Max: {{ result.damage.max }}</span>
      </div>
    </div>

    <!-- Combat Stats -->
    <div class="grid grid-cols-3 gap-2 text-sm">
      <div class="text-center">
        <div class="text-xs text-muted-foreground">Hit Chance</div>
        <div class="font-medium">{{ (result.hitChance * 100).toFixed(0) }}%</div>
      </div>
      <div class="text-center">
        <div class="text-xs text-muted-foreground">DPS</div>
        <div class="font-medium">{{ result.dps.toFixed(1) }}</div>
      </div>
      <div class="text-center">
        <div class="text-xs text-muted-foreground">Speed Mod</div>
        <div class="font-medium">{{ result.speedModifier.toFixed(2) }}x</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import type { FormulaResult } from '@/stores/damageCalculator.store';
import type { StatBlock } from '@/composables/useDamageCalculations';

interface Props {
  result: FormulaResult;
  playerStats: StatBlock;
  enemyStats: StatBlock;
}

defineProps<Props>();

const formatFormulaName = (formula: string): string => {
  const names: Record<string, string> = {
    'osrs': 'OSRS-Inspired',
    'linear': 'Linear Hybrid',
    'power': 'Power Curve',
    'difference': 'Difference-Based',
    'speed': 'Speed-Conscious'
  };
  return names[formula] || formula;
};

const getDamageVariant = (avgDamage: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (avgDamage >= 15) return 'destructive';
  if (avgDamage >= 10) return 'default';
  if (avgDamage >= 5) return 'secondary';
  return 'outline';
};

const getDamageBarColor = (avgDamage: number): string => {
  if (avgDamage >= 15) return 'bg-destructive';
  if (avgDamage >= 10) return 'bg-primary';
  if (avgDamage >= 5) return 'bg-secondary';
  return 'bg-muted-foreground';
};

const getDamagePercentage = (avgDamage: number): number => {
  // Scale to max expected damage of 20
  return Math.min(100, (avgDamage / 20) * 100);
};
</script>

