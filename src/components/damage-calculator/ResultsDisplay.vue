<template>
  <div class="results-display space-y-6">
    <!-- Active Formulas Summary -->
    <Card v-if="results.length > 0">
      <CardHeader>
        <CardTitle>Damage Results</CardTitle>
        <CardDescription>
          {{ results.length }} formula{{ results.length > 1 ? 's' : '' }} active
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <DamageOutput 
            v-for="result in results" 
            :key="result.formula"
            :result="result"
            :player-stats="store.playerStatsWithEquipment"
            :enemy-stats="store.enemyStatsWithEquipment"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Speed & TEMPO Modifiers -->
    <Card v-if="results.length > 0">
      <CardHeader>
        <CardTitle>Speed & TEMPO Effects</CardTitle>
        <CardDescription>Speed frequency and TEMPO effectiveness modifications</CardDescription>
      </CardHeader>
      <CardContent>
        <SpeedModifiers 
          :player-speed="store.playerStats.speed"
          :player-tempo="store.playerStats.tempo"
          :enemy-speed="store.enemyStats.speed"
          :enemy-tempo="store.enemyStats.tempo"
          :results="results"
        />
      </CardContent>
    </Card>

    <!-- Combat Metrics -->
    <Card v-if="results.length > 0">
      <CardHeader>
        <CardTitle>Combat Analysis</CardTitle>
        <CardDescription>Detailed combat statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <CombatMetrics 
          :results="results"
          :player-stats="store.playerStatsWithEquipment"
          :enemy-stats="store.enemyStatsWithEquipment"
        />
      </CardContent>
    </Card>

    <!-- No Results State -->
    <Card v-if="results.length === 0" class="text-center">
      <CardContent class="py-12">
        <p class="text-muted-foreground mb-4">No formulas selected</p>
        <p class="text-sm text-muted-foreground">
          Select at least one damage formula to see results
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDamageCalculatorStore } from '@/stores/damageCalculator.store';
import DamageOutput from './DamageOutput.vue';
import SpeedModifiers from './SpeedModifiers.vue';
import CombatMetrics from './CombatMetrics.vue';

const store = useDamageCalculatorStore();

const results = computed(() => store.results);
</script>

<style scoped>
.results-display {
  @apply w-full;
}
</style>