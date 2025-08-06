<template>
	<div class="damage-calculator shadcn-ui">
		<div class="max-w-7xl mx-auto">
			<div class="mb-8">
				<h1 class="text-3xl md:text-4xl font-bold tracking-tight">Damage Calculator</h1>
				<p class="text-base md:text-lg text-muted-foreground mt-2">Test and tune RPG damage formulas in real-time</p>
			</div>

			<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
				<!-- Left Panel - Configuration -->
				<div class="xl:col-span-2 space-y-6">
					<!-- Player Stats -->
					<StatEditor
						title="Player Stats"
						description="Configure your character's attributes"
						:stats="store.playerStats"
						:equipment="store.playerEquipment"
						:equipment-bonus="store.playerEquipmentBonus"
						@update:stat="(stat, value) => store.updatePlayerStat(stat, value)"
						@update:equipment="(value) => store.setPlayerEquipment(value)"
						:show-ranges="true" />

					<!-- Enemy Stats -->
					<StatEditor
						title="Enemy Stats"
						description="Configure opponent attributes"
						:stats="store.enemyStats"
						:equipment="store.enemyEquipment"
						:equipment-bonus="store.enemyEquipmentBonus"
						@update:stat="(stat, value) => store.updateEnemyStat(stat, value)"
						@update:equipment="(value) => store.setEnemyEquipment(value)"
						:show-ranges="true" />

					<!-- Formula Selection -->
					<Card>
						<CardHeader>
							<CardTitle>Damage Formulas</CardTitle>
							<CardDescription>Select formulas to test</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Button :variant="store.activeFormulas.includes('osrs') ? 'default' : 'outline'" class="w-full justify-start text-sm" @click="store.toggleFormula('osrs')">
									<span class="mr-2">🎮</span>
									OSRS-Inspired
								</Button>
								<Button :variant="store.activeFormulas.includes('linear') ? 'default' : 'outline'" class="w-full justify-start text-sm" @click="store.toggleFormula('linear')">
									<span class="mr-2">📊</span>
									Linear Hybrid
								</Button>
								<Button :variant="store.activeFormulas.includes('power') ? 'default' : 'outline'" class="w-full justify-start text-sm" @click="store.toggleFormula('power')">
									<span class="mr-2">📈</span>
									Power Curve
								</Button>
								<Button :variant="store.activeFormulas.includes('difference') ? 'default' : 'outline'" class="w-full justify-start text-sm" @click="store.toggleFormula('difference')">
									<span class="mr-2">➖</span>
									Difference-Based
								</Button>
								<Button :variant="store.activeFormulas.includes('speed-conscious') ? 'default' : 'outline'" class="w-full justify-start text-sm" @click="store.toggleFormula('speed-conscious')">
									<span class="mr-2">⚡</span>
									Speed-Conscious
								</Button>
								<Button :variant="store.activeFormulas.includes('tempo-separated') ? 'default' : 'outline'" class="w-full justify-start text-sm" @click="store.toggleFormula('tempo-separated')">
									<span class="mr-2">🎵</span>
									TEMPO-Separated
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
						@update:enemy-equipment="store.setEnemyEquipment" />

					<!-- Formula Configuration Panel -->
					<FormulaConfigPanel :selected-formula="selectedFormulaForConfig" @update:selected-formula="setSelectedFormulaForConfig" @constants-changed="handleConstantsChanged" />
				</div>

				<!-- Right Panel - Results -->
				<div class="space-y-6">
					<ResultsDisplay />

					<!-- Preset Management -->
					<PresetSelector :presets="store.presets" @save="store.savePreset" @load="store.loadPreset" @delete="store.deletePreset" @import="(presets) => store.importPresets(JSON.stringify(presets))" />

					<Card>
						<CardHeader>
							<CardTitle>Actions</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2">
							<div class="flex items-center justify-between mb-2">
								<Label htmlFor="auto-calculate">Auto-calculate</Label>
								<Button id="auto-calculate" :variant="store.autoCalculate ? 'default' : 'outline'" size="sm" @click="store.setAutoCalculate(!store.autoCalculate)">
									{{ store.autoCalculate ? "ON" : "OFF" }}
								</Button>
							</div>
							<Button class="w-full" @click="store.calculateResults()" :disabled="store.autoCalculate"> Calculate Damage </Button>
							<Button variant="secondary" class="w-full" @click="store.resetStats()"> Reset Values </Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import EquipmentSelectionPanel from "@/components/damage-calculator/EquipmentSelectionPanel.vue";
import FormulaConfigPanel from "@/components/damage-calculator/FormulaConfigPanel.vue";
import PresetSelector from "@/components/damage-calculator/PresetSelector.vue";
import ResultsDisplay from "@/components/damage-calculator/ResultsDisplay.vue";
import StatEditor from "@/components/damage-calculator/StatEditor.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { DamageFormulaType } from "@/composables/useDamageCalculations";
import { useDamageCalculatorStore } from "@/stores/damageCalculator.store";
import { useLocalStorage } from "@vueuse/core";

const store = useDamageCalculatorStore();

// Local state for formula configuration
const selectedFormulaForConfig = useLocalStorage<DamageFormulaType>("selectedFormulaForConfig", "osrs");

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
	padding: 1.5rem 1rem;
}

.damage-calculator .max-w-7xl {
	max-width: 80rem;
	margin-left: auto;
	margin-right: auto;
}

@media (min-width: 768px) {
	.damage-calculator {
		padding: 2rem 1.5rem;
	}
}

@media (min-width: 1024px) {
	.damage-calculator {
		padding: 2.5rem 2rem;
	}
}
</style>
