<template>
  <div class="damage-calculator shadcn-ui">
    <div class="mb-8">
      <h1 class="text-4xl font-bold tracking-tight">Damage Calculator</h1>
      <p class="text-lg text-muted-foreground mt-2">
        Test and tune RPG damage formulas in real-time
      </p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Panel - Configuration -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Player Stats -->
        <StatEditor
          title="Player Stats"
          description="Configure your character's attributes"
          :stats="store.playerStats"
          :equipment="store.playerEquipment"
          :equipment-bonus="store.playerEquipmentBonus"
          @update:stat="(stat, value) => store.updatePlayerStat(stat, value)"
          @update:equipment="(value) => store.setPlayerEquipment(value)"
          :show-ranges="true"
        />

        <!-- Enemy Stats -->
        <StatEditor
          title="Enemy Stats"
          description="Configure opponent attributes"
          :stats="store.enemyStats"
          :equipment="store.enemyEquipment"
          :equipment-bonus="store.enemyEquipmentBonus"
          @update:stat="(stat, value) => store.updateEnemyStat(stat, value)"
          @update:equipment="(value) => store.setEnemyEquipment(value)"
          :show-ranges="true"
        />

        <!-- Formula Selection -->
        <Card>
          <CardHeader>
            <CardTitle>Damage Formulas</CardTitle>
            <CardDescription>Select formulas to test</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Button 
                :variant="store.activeFormulas.includes('osrs') ? 'default' : 'outline'"
                class="w-full justify-start text-sm"
                @click="store.toggleFormula('osrs')"
              >
                <span class="mr-2">🎮</span>
                <span class="hidden sm:inline lg:hidden xl:inline">OSRS-Inspired Formula</span>
                <span class="sm:hidden lg:inline xl:hidden">OSRS</span>
              </Button>
              <Button 
                :variant="store.activeFormulas.includes('linear') ? 'default' : 'outline'"
                class="w-full justify-start text-sm"
                @click="store.toggleFormula('linear')"
              >
                <span class="mr-2">📊</span>
                <span class="hidden sm:inline lg:hidden xl:inline">Linear Hybrid Formula</span>
                <span class="sm:hidden lg:inline xl:hidden">Linear</span>
              </Button>
              <Button 
                :variant="store.activeFormulas.includes('power') ? 'default' : 'outline'"
                class="w-full justify-start text-sm"
                @click="store.toggleFormula('power')"
              >
                <span class="mr-2">📈</span>
                <span class="hidden sm:inline lg:hidden xl:inline">Power Curve Formula</span>
                <span class="sm:hidden lg:inline xl:hidden">Power</span>
              </Button>
              <Button 
                :variant="store.activeFormulas.includes('difference') ? 'default' : 'outline'"
                class="w-full justify-start text-sm"
                @click="store.toggleFormula('difference')"
              >
                <span class="mr-2">➖</span>
                <span class="hidden sm:inline lg:hidden xl:inline">Difference-Based Formula</span>
                <span class="sm:hidden lg:inline xl:hidden">Difference</span>
              </Button>
              <Button 
                :variant="store.activeFormulas.includes('speed-conscious') ? 'default' : 'outline'"
                class="w-full justify-start text-sm"
                @click="store.toggleFormula('speed-conscious')"
              >
                <span class="mr-2">⚡</span>
                <span class="hidden sm:inline lg:hidden xl:inline">Speed-Conscious Formula</span>
                <span class="sm:hidden lg:inline xl:hidden">Speed</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Equipment Selection Panel -->
        <EquipmentSelectionPanel
          :player-equipment="store.playerEquipment"
          :enemy-equipment="store.enemyEquipment"
          :player-equipment-bonus="store.playerEquipmentBonus"
          :enemy-equipment-bonus="store.enemyEquipmentBonus"
          @update:player-equipment="store.setPlayerEquipment"
          @update:enemy-equipment="store.setEnemyEquipment"
        />

        <!-- Formula Configuration Panel -->
        <FormulaConfigPanel 
          :selected-formula="selectedFormulaForConfig"
          @update:selected-formula="setSelectedFormulaForConfig"
          @constants-changed="handleConstantsChanged"
        />
      </div>

      <!-- Right Panel - Results -->
      <div class="space-y-6">
        <ResultsDisplay />

        <!-- Preset Management -->
        <PresetSelector
          :presets="store.presets"
          @save="store.savePreset"
          @load="store.loadPreset"
          @delete="store.deletePreset"
          @import="(presets) => store.importPresets(JSON.stringify(presets))"
        />

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex items-center justify-between mb-2">
              <Label htmlFor="auto-calculate">Auto-calculate</Label>
              <Button
                id="auto-calculate"
                :variant="store.autoCalculate ? 'default' : 'outline'"
                size="sm"
                @click="store.setAutoCalculate(!store.autoCalculate)"
              >
                {{ store.autoCalculate ? 'ON' : 'OFF' }}
              </Button>
            </div>
            <Button 
              class="w-full"
              @click="store.calculateResults()"
              :disabled="store.autoCalculate"
            >
              Calculate Damage
            </Button>
            <Button 
              variant="secondary" 
              class="w-full"
              @click="store.resetStats()"
            >
              Reset Values
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EquipmentSelectionPanel from '@/components/damage-calculator/EquipmentSelectionPanel.vue'
import FormulaConfigPanel from '@/components/damage-calculator/FormulaConfigPanel.vue'
import PresetSelector from '@/components/damage-calculator/PresetSelector.vue'
import ResultsDisplay from '@/components/damage-calculator/ResultsDisplay.vue'
import StatEditor from '@/components/damage-calculator/StatEditor.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useDamageCalculatorStore } from '@/stores/damageCalculator.store'
import type { DamageFormulaType } from '@/composables/useDamageCalculations'

const store = useDamageCalculatorStore();

// Local state for formula configuration
const selectedFormulaForConfig = ref<DamageFormulaType>('osrs');

// Handlers
const setSelectedFormulaForConfig = (formula: DamageFormulaType) => {
  selectedFormulaForConfig.value = formula;
};

const handleConstantsChanged = () => {
  // Trigger recalculation when constants change
  if (store.autoCalculate) {
    store.calculateResults();
  }
};
</script>

<style scoped>
.damage-calculator {
  @apply container mx-auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .damage-calculator {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .damage-calculator {
    padding: 2rem;
  }
}
</style>