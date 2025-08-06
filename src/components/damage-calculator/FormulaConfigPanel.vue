<template>
	<Card>
		<CardHeader>
			<CardTitle>Formula Configuration</CardTitle>
			<CardDescription>Tune formula parameters to test different balance approaches</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-6">
				<!-- Formula Selection Header -->
				<div class="flex items-center justify-between">
					<Label class="text-sm font-medium">Selected Formula:</Label>
					<Select :model-value="selectedFormula" @update:model-value="updateSelectedFormula">
						<SelectTrigger class="w-48">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem v-for="formula in availableFormulas" :key="formula.value" :value="formula.value">
								{{ formula.label }}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<!-- Formula Description -->
				<div class="p-3 bg-muted rounded-lg">
					<p class="text-sm text-muted-foreground">
						{{ currentFormulaDescription }}
					</p>
				</div>

				<!-- Constants Configuration -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<Label class="text-sm font-medium">Formula Constants</Label>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" @click="resetFormulaConstants"> Reset </Button>
							<Button variant="outline" size="sm" @click="copyConstants"> Copy </Button>
							<Button variant="outline" size="sm" @click="pasteConstants" :disabled="!clipboardConstants"> Paste </Button>
						</div>
					</div>

					<!-- Dynamic Constants Editor -->
					<div v-if="currentConstants" class="space-y-3">
						<div v-for="(value, key) in currentConstants" :key="key" class="flex items-center justify-between">
							<Label :for="key" class="text-sm capitalize">
								{{ formatConstantName(key) }}
							</Label>
							<div class="flex items-center gap-2 w-32">
								<Input
									:id="key"
									type="number"
									:model-value="value"
									@update:model-value="(newValue) => updateConstant(key, newValue)"
									:step="getConstantStep(key)"
									:min="getConstantMin(key)"
									:max="getConstantMax(key)"
									class="text-right" />
							</div>
						</div>
					</div>

					<!-- Global Constants -->
					<div class="border-t pt-4">
						<Label class="text-sm font-medium mb-3 block">Global Constants</Label>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<Label for="minimum-damage" class="text-sm">Minimum Damage</Label>
								<div class="flex items-center gap-2 w-32">
									<Input
										id="minimum-damage"
										type="number"
										:model-value="globalConstants.MINIMUM_DAMAGE"
										@update:model-value="(value) => updateGlobalConstant('MINIMUM_DAMAGE', value)"
										min="1"
										max="10"
										class="text-right" />
								</div>
							</div>
							<div class="flex items-center justify-between">
								<Label for="hit-chance-min" class="text-sm">Min Hit Chance</Label>
								<div class="flex items-center gap-2 w-32">
									<Input
										id="hit-chance-min"
										type="number"
										:model-value="globalConstants.HIT_CHANCE_MIN"
										@update:model-value="(value) => updateGlobalConstant('HIT_CHANCE_MIN', value)"
										step="0.01"
										min="0"
										max="1"
										class="text-right" />
								</div>
							</div>
							<div class="flex items-center justify-between">
								<Label for="hit-chance-max" class="text-sm">Max Hit Chance</Label>
								<div class="flex items-center gap-2 w-32">
									<Input
										id="hit-chance-max"
										type="number"
										:model-value="globalConstants.HIT_CHANCE_MAX"
										@update:model-value="(value) => updateGlobalConstant('HIT_CHANCE_MAX', value)"
										step="0.01"
										min="0"
										max="1"
										class="text-right" />
								</div>
							</div>
						</div>
					</div>

					<!-- Reset All Button -->
					<div class="pt-4 border-t">
						<Button variant="destructive" class="w-full" @click="resetAllConstants"> Reset All Constants to Default </Button>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type DamageFormulaType } from "@/composables/useDamageCalculations";
import { useDamageCalculatorStore } from "@/stores/damageCalculator.store";
import { AcceptableValue } from "reka-ui";
import { computed, ref } from "vue";

// Props
interface Props {
	selectedFormula: DamageFormulaType;
}

const props = defineProps<Props>();

// Emits
interface Emits {
	(e: "update:selected-formula", value: DamageFormulaType): void;
	(e: "constants-changed"): void;
}

const emit = defineEmits<Emits>();

// Store
const store = useDamageCalculatorStore();

// Local state
const clipboardConstants = ref<Record<string, number> | null>(null);

// Computed properties
const selectedFormula = computed(() => props.selectedFormula);
const availableFormulas = computed(() => [
	{ value: "osrs", label: "OSRS-Inspired", description: "Classic mathematical framework with low numbers" },
	{ value: "linear", label: "Linear Hybrid", description: "Simple calculation with high consistency" },
	{ value: "power", label: "Power Curve", description: "Slight exponential scaling for late game" },
	{ value: "difference", label: "Difference-Based", description: "Classic RPG style (Attack - Defense)" },
	{ value: "speed-conscious", label: "Speed-Conscious", description: "Implements speed trade-off mechanic" },
]);

const currentFormulaDescription = computed(() => {
	const formula = availableFormulas.value.find((f) => f.value === selectedFormula.value);
	return formula?.description || "";
});

const currentConstants = computed(() => {
	const allConstants = store.damageConstants;

	switch (selectedFormula.value) {
		case "osrs":
			return allConstants.OSRS;
		case "linear":
			return allConstants.LINEAR;
		case "power":
			return allConstants.POWER;
		case "difference":
			return allConstants.DIFFERENCE;
		case "speed-conscious":
			return allConstants.SPEED;
		default:
			return {};
	}
});

const globalConstants = computed(() => store.damageConstants.GLOBAL);

// Methods
const updateSelectedFormula = (formula: AcceptableValue) => {
	if (!formula || typeof formula !== "string") return;
	emit("update:selected-formula", formula as DamageFormulaType);
};

const updateConstant = (key: string, value: string | number) => {
	const numValue = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(numValue)) return;

	const formulaKey = store.getFormulaConstantKey(selectedFormula.value);
	if (!formulaKey) return;

	const newConstants = {
		...store.damageConstants,
		[formulaKey]: {
			...store.damageConstants[formulaKey as keyof typeof store.damageConstants],
			[key]: numValue,
		},
	};

	store.updateConstants(newConstants);
	emit("constants-changed");
};

const updateGlobalConstant = (key: string, value: string | number) => {
	const numValue = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(numValue)) return;

	const newConstants = {
		...store.damageConstants,
		GLOBAL: {
			...store.damageConstants.GLOBAL,
			[key]: numValue,
		},
	};

	store.updateConstants(newConstants);
	emit("constants-changed");
};

const formatConstantName = (key: string): string => {
	return key
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

const getConstantStep = (key: string): number => {
	// Ratio/percentage constants use smaller steps
	if (key.includes("RATIO") || key.includes("EFFECTIVENESS") || key.includes("MULTIPLIER")) {
		return 0.01;
	}
	// Exponents use very small steps
	if (key.includes("EXPONENT")) {
		return 0.1;
	}
	// Most other constants use integer steps
	return 1;
};

const getConstantMin = (key: string): number => {
	// Ratios and effectiveness should be positive
	if (key.includes("RATIO") || key.includes("EFFECTIVENESS")) {
		return 0.01;
	}
	// Exponents should be > 1 for meaningful power curves
	if (key.includes("EXPONENT")) {
		return 1.0;
	}
	// Most other constants should be positive
	return 1;
};

const getConstantMax = (key: string): number => {
	// Ratios typically max at 1
	if (key.includes("RATIO")) {
		return 1;
	}
	// Effectiveness typically max at 1
	if (key.includes("EFFECTIVENESS")) {
		return 1;
	}
	// Exponents shouldn't be too high
	if (key.includes("EXPONENT")) {
		return 3;
	}
	// Most other constants can be fairly high
	return 1000;
};

const resetFormulaConstants = () => {
	const formulaKey = store.getFormulaConstantKey(selectedFormula.value);
	if (!formulaKey) return;

	const originalConstants = store.DEFAULT_DAMAGE_CONSTANTS;
	const newConstants = {
		...store.damageConstants,
		[formulaKey]: { ...originalConstants[formulaKey as keyof typeof originalConstants] },
	};

	store.updateConstants(newConstants);
	emit("constants-changed");
};

const resetAllConstants = () => {
	store.resetConstants();
	emit("constants-changed");
};

const copyConstants = () => {
	clipboardConstants.value = { ...currentConstants.value };
};

const pasteConstants = () => {
	if (!clipboardConstants.value) return;

	const formulaKey = store.getFormulaConstantKey(selectedFormula.value);
	if (!formulaKey) return;

	const newConstants = {
		...store.damageConstants,
		[formulaKey]: { ...clipboardConstants.value },
	};

	store.updateConstants(newConstants);
	emit("constants-changed");
};
</script>
