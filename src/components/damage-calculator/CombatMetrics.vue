<template>
  <div class="combat-metrics space-y-4">
    <!-- Best Formula Analysis -->
    <div v-if="bestFormula" class="p-3 bg-muted rounded-lg">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium">Recommended Formula</span>
        <Badge variant="default">
          {{ formatFormulaName(bestFormula.formula) }}
        </Badge>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span class="text-muted-foreground">Avg DPS:</span>
          <span class="ml-1 font-medium">{{ bestFormula.dps.toFixed(1) }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">TTK:</span>
          <span class="ml-1 font-medium">{{ turnsToDefeat }} turns</span>
        </div>
      </div>
    </div>

    <!-- Detailed Metrics Grid -->
    <div class="grid grid-cols-1 gap-3">
      <div 
        v-for="result in results" 
        :key="result.formula"
        class="p-3 border rounded-lg"
        :class="{ 'ring-2 ring-primary': result.formula === bestFormula?.formula }"
      >
        <h5 class="text-xs font-medium mb-2">{{ formatFormulaName(result.formula) }}</h5>
        
        <!-- Hit Chance Progress -->
        <div class="mb-2">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-muted-foreground">Hit%</span>
            <span>{{ (result.hitChance * 100).toFixed(0) }}%</span>
          </div>
          <div class="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-300"
              :style="{ width: `${result.hitChance * 100}%` }"
            />
          </div>
        </div>

        <!-- DPS -->
        <div class="mb-2">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-muted-foreground">DPS</span>
            <span>{{ result.dps.toFixed(1) }}</span>
          </div>
          <div class="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-secondary transition-all duration-300"
              :style="{ width: `${Math.min(100, (result.dps / maxDPS) * 100)}%` }"
            />
          </div>
        </div>

        <!-- Effective Damage -->
        <div class="text-xs">
          <span class="text-muted-foreground">Eff. Dmg:</span>
          <span class="ml-1">{{ (result.damage.average * result.hitChance).toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <!-- Combat Summary -->
    <div class="pt-3 border-t space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Total HP to Defeat</span>
        <span class="font-medium">{{ enemyStats.hp }} HP</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Avg Turns to Victory</span>
        <span class="font-medium">{{ avgTurnsToDefeat }} turns</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Time to Victory</span>
        <span class="font-medium">{{ timeToVictory }}s</span>
      </div>
    </div>

    <!-- Damage Type Distribution -->
    <div class="pt-3 border-t">
      <div class="text-sm font-medium mb-2">Damage Type Distribution</div>
      <div class="flex gap-2">
        <div class="flex-1 text-center p-2 bg-muted rounded">
          <div class="text-xs text-muted-foreground">Physical</div>
          <div class="text-lg font-medium">{{ physicalCount }}</div>
        </div>
        <div class="flex-1 text-center p-2 bg-muted rounded">
          <div class="text-xs text-muted-foreground">Magical</div>
          <div class="text-lg font-medium">{{ magicalCount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import type { StatBlock } from '@/composables/useDamageCalculations';
import type { FormulaResult } from '@/stores/damageCalculator.store';
import { computed } from 'vue';

interface Props {
  results: FormulaResult[];
  playerStats: StatBlock;
  enemyStats: StatBlock;
}

const props = defineProps<Props>();

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

const bestFormula = computed(() => {
  if (props.results.length === 0) return null;
  return [...props.results].sort((a, b) => b.dps - a.dps)[0];
});

const maxDPS = computed(() => {
  return Math.max(...props.results.map(r => r.dps), 1);
});

const turnsToDefeat = computed(() => {
  if (!bestFormula.value) return 0;
  const effectiveDamage = bestFormula.value.damage.average * bestFormula.value.hitChance;
  return Math.ceil(props.enemyStats.hp / effectiveDamage);
});

const avgTurnsToDefeat = computed(() => {
  if (props.results.length === 0) return 0;
  const totalTurns = props.results.reduce((sum, result) => {
    const effectiveDamage = result.damage.average * result.hitChance;
    return sum + Math.ceil(props.enemyStats.hp / effectiveDamage);
  }, 0);
  return Math.round(totalTurns / props.results.length);
});

const timeToVictory = computed(() => {
  // Assuming base turn time of 2 seconds, modified by speed
  const turnTime = 2 * (50 / props.playerStats.speed);
  return (turnsToDefeat.value * turnTime).toFixed(1);
});

const physicalCount = computed(() => {
  return props.results.filter(r => r.attackType === 'physical').length;
});

const magicalCount = computed(() => {
  return props.results.filter(r => r.attackType === 'magical').length;
});
</script>

<style scoped>
.combat-metrics {
  @apply w-full;
}
</style>