<template>
	<div class="speed-modifiers space-y-5">
		<!-- Player Speed Analysis -->
		<div class="space-y-3">
			<div class="items-center justify-between flex pb-2">
				<span class="text-sm font-semibold">Player Speed</span>
				<Badge :variant="getSpeedVariant(playerSpeed)"> {{ playerSpeed }} SPD </Badge>
			</div>
			<div class="space-y-2 pl-2">
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">Turn Frequency:</span>
					<span class="font-medium">{{ getSpeedDescription(playerSpeed) }}</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">Damage Modifier:</span>
					<span :class="getModifierClass(playerSpeedModifier)"> {{ playerSpeedModifier > 1 ? "+" : "" }}{{ ((playerSpeedModifier - 1) * 100).toFixed(0) }}% </span>
				</div>
			</div>
		</div>

		<!-- Enemy Speed Analysis -->
		<div class="space-y-3">
			<div class="items-center justify-between flex pb-2">
				<span class="text-sm font-semibold">Enemy Speed</span>
				<Badge :variant="getSpeedVariant(enemySpeed)"> {{ enemySpeed }} SPD </Badge>
			</div>
			<div class="space-y-2 pl-2">
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">Turn Frequency:</span>
					<span class="font-medium">{{ getSpeedDescription(enemySpeed) }}</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">Damage Modifier:</span>
					<span :class="getModifierClass(enemySpeedModifier)"> {{ enemySpeedModifier > 1 ? "+" : "" }}{{ ((enemySpeedModifier - 1) * 100).toFixed(0) }}% </span>
				</div>
			</div>
		</div>

		<!-- Speed Comparison -->
		<div class="pt-4 border-t">
			<div class="text-sm space-y-3">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Speed Advantage:</span>
					<span class="font-medium">
						{{ speedDifference > 0 ? "Player" : speedDifference < 0 ? "Enemy" : "None" }}
						{{ speedDifference !== 0 ? `(${Math.abs(speedDifference)} SPD)` : "" }}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Turn Ratio:</span>
					<span class="font-medium"> {{ playerTurnRatio.toFixed(1) }} : {{ enemyTurnRatio.toFixed(1) }} </span>
				</div>
			</div>
		</div>

		<!-- TEMPO Analysis -->
		<div v-if="(playerTempo !== undefined && playerTempo !== 100) || (enemyTempo !== undefined && enemyTempo !== 100)" class="pt-4 border-t">
			<div class="space-y-3">
				<div class="text-sm font-semibold">TEMPO Effects</div>
				
				<!-- Player TEMPO -->
				<div v-if="playerTempo !== undefined && playerTempo !== 100" class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Player TEMPO:</span>
						<Badge :variant="getTempoVariant(playerTempo)">{{ playerTempo }}</Badge>
					</div>
					<div class="flex justify-between text-sm pl-2">
						<span class="text-muted-foreground">Effectiveness:</span>
						<span :class="getModifierClass(playerTempoEffectiveness)">
							{{ playerTempoEffectiveness > 1 ? "+" : "" }}{{ ((playerTempoEffectiveness - 1) * 100).toFixed(0) }}%
						</span>
					</div>
					<div class="flex justify-between text-sm pl-2">
						<span class="text-muted-foreground">Frequency Mod:</span>
						<span :class="getModifierClass(playerTempoFrequency)">
							{{ playerTempoFrequency > 1 ? "+" : "" }}{{ ((playerTempoFrequency - 1) * 100).toFixed(0) }}%
						</span>
					</div>
				</div>

				<!-- Enemy TEMPO -->
				<div v-if="enemyTempo !== undefined && enemyTempo !== 100" class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Enemy TEMPO:</span>
						<Badge :variant="getTempoVariant(enemyTempo)">{{ enemyTempo }}</Badge>
					</div>
					<div class="flex justify-between text-sm pl-2">
						<span class="text-muted-foreground">Effectiveness:</span>
						<span :class="getModifierClass(enemyTempoEffectiveness)">
							{{ enemyTempoEffectiveness > 1 ? "+" : "" }}{{ ((enemyTempoEffectiveness - 1) * 100).toFixed(0) }}%
						</span>
					</div>
					<div class="flex justify-between text-sm pl-2">
						<span class="text-muted-foreground">Frequency Mod:</span>
						<span :class="getModifierClass(enemyTempoFrequency)">
							{{ enemyTempoFrequency > 1 ? "+" : "" }}{{ ((enemyTempoFrequency - 1) * 100).toFixed(0) }}%
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Visual Speed Bar -->
		<div class="space-y-3 pt-2">
			<div class="flex gap-3">
				<div class="flex-1">
					<div class="h-2 bg-muted rounded-full overflow-hidden">
						<div class="h-full bg-primary transition-all duration-300" :style="{ width: `${(playerSpeed / 100) * 100}%` }" />
					</div>
					<span class="text-xs text-muted-foreground mt-1 block">Player</span>
				</div>
				<div class="flex-1">
					<div class="h-2 bg-muted rounded-full overflow-hidden">
						<div class="h-full bg-destructive transition-all duration-300" :style="{ width: `${(enemySpeed / 100) * 100}%` }" />
					</div>
					<span class="text-xs text-muted-foreground mt-1 block">Enemy</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import type { FormulaResult } from "@/stores/damageCalculator.store";
import { computed } from "vue";

interface Props {
	playerSpeed: number;
	playerTempo?: number;
	enemySpeed: number;
	enemyTempo?: number;
	results: FormulaResult[];
}

const props = defineProps<Props>();

const speedDifference = computed(() => props.playerSpeed - props.enemySpeed);

const playerSpeedModifier = computed(() => {
	const speedResult = props.results.find((r) => r.formula === "speed-conscious");
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
	// Apply 50% of TEMPO frequency effect to turn ratio
	const tempoEffect = 1 + ((playerTempoFrequency.value - 1) * 0.5);
	const tempoModifiedRatio = baseRatio * tempoEffect;
	return Math.max(0.5, Math.min(4, tempoModifiedRatio));
});

const enemyTurnRatio = computed(() => {
	const baseRatio = props.enemySpeed / 50;
	// Apply 50% of TEMPO frequency effect to turn ratio
	const tempoEffect = 1 + ((enemyTempoFrequency.value - 1) * 0.5);
	const tempoModifiedRatio = baseRatio * tempoEffect;
	return Math.max(0.5, Math.min(4, tempoModifiedRatio));
});

// TEMPO calculations  
const calculateTempoEffectiveness = (tempo: number): number => {
	const NEUTRAL_TEMPO = 100;
	
	if (tempo < NEUTRAL_TEMPO) {
		// Slower tempo = much higher damage bonus (asymmetric curve)
		const slowDeviation = NEUTRAL_TEMPO - tempo;
		const slowMultiplier = 0.004; // Double the impact for going slow
		const effectiveness = 1 + (slowDeviation * slowMultiplier);
		return Math.max(1, Math.min(1.75, effectiveness));
	} else {
		// Faster tempo = severe damage penalty (to balance frequency advantage)
		const fastDeviation = tempo - NEUTRAL_TEMPO;
		const fastMultiplier = 0.0066; // Much higher penalty rate for speed advantage
		const effectiveness = 1 - (fastDeviation * fastMultiplier);
		return Math.max(0.1, Math.min(1, effectiveness));
	}
};

const playerTempoEffectiveness = computed(() => {
	return props.playerTempo ? calculateTempoEffectiveness(props.playerTempo) : 1;
});

const enemyTempoEffectiveness = computed(() => {
	return props.enemyTempo ? calculateTempoEffectiveness(props.enemyTempo) : 1;
});

const playerTempoFrequency = computed(() => {
	return props.playerTempo ? props.playerTempo / 100 : 1;
});

const enemyTempoFrequency = computed(() => {
	return props.enemyTempo ? props.enemyTempo / 100 : 1;
});

const getSpeedVariant = (speed: number): "default" | "secondary" | "destructive" | "outline" => {
	if (speed >= 70) return "destructive";
	if (speed >= 50) return "default";
	if (speed >= 30) return "secondary";
	return "outline";
};

const getTempoVariant = (tempo: number): "default" | "secondary" | "destructive" | "outline" => {
	if (tempo > 130) return "destructive"; // Very fast, very weak
	if (tempo > 110) return "secondary"; // Fast, weak
	if (tempo >= 90 && tempo <= 110) return "default"; // Balanced
	if (tempo >= 70) return "secondary"; // Slow, strong
	return "outline"; // Very slow, very strong
};

const getSpeedDescription = (speed: number): string => {
	if (speed >= 70) return "Very Fast";
	if (speed >= 50) return "Fast";
	if (speed >= 30) return "Normal";
	return "Slow";
};

const getModifierClass = (modifier: number): string => {
	if (modifier > 1) return "text-green-600";
	if (modifier < 1) return "text-red-600";
	return "";
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
