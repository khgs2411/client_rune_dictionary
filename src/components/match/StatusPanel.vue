<template>
	<!-- Pokemon-inspired Status Panel -->
	<div class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 sm:p-4 min-w-[240px] sm:min-w-[280px] space-y-2">
		<!-- Name and Level -->
		<div class="flex items-center justify-between">
			<span class="text-sm sm:text-base font-semibold text-foreground">
				{{ name }}
			</span>
			<span class="text-xs sm:text-sm text-muted-foreground font-medium"> Lv{{ level }} </span>
		</div>

		<!-- HP Bar -->
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<span class="text-xs text-muted-foreground">HP</span>
				<span class="text-xs font-mono text-foreground"> {{ hp }}/{{ maxHp }} </span>
			</div>
			<div class="relative w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
				<!-- HP fill with gradient (red/green) -->
				<div class="absolute left-0 top-0 h-full transition-all duration-300" :class="hpGradientClass" :style="{ width: `${hpPercentage}%` }"></div>
			</div>
		</div>

		<!-- MP Bar -->
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<span class="text-xs text-muted-foreground">MP</span>
				<span class="text-xs font-mono text-foreground"> {{ mp }}/{{ maxMp }} </span>
			</div>
			<div class="relative w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
				<!-- MP fill with blue gradient from composable -->
				<div class="absolute left-0 top-0 h-full transition-all duration-300" :class="mpGradientClass" :style="{ width: `${mpPercentage}%` }"></div>
			</div>
		</div>

		<!-- ATB Bar (Active Time Battle progress) -->
		<div class="space-y-1 pt-1 border-t border-border/50">
			<div class="flex items-center justify-between">
				<span class="text-xs text-muted-foreground">ATB</span>
				<span class="text-xs font-mono text-muted-foreground"> {{ Math.round(predictedATB) }}% </span>
			</div>
			<div class="relative w-full h-2 bg-muted rounded-full overflow-hidden">
				<!-- ATB fill progress (0-100%) with client prediction -->
				<div :class="['absolute left-0 top-0 h-full transition-all duration-200', entityType === 'player' ? 'bg-primary' : 'bg-destructive']" :style="{ width: `${predictedATB}%` }"></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useATBPrediction } from "@/composables/useATBPrediction";
import { useProgressBarColor } from "@/composables/useProgressBarColor";

// Props
const props = defineProps<{
	entityType: "player" | "enemy";
	name: string;
	level: number;
	hp: number;
	maxHp: number;
	mp: number;
	maxMp: number;
	atbProgress: number; // 0-100% (server value)
	isAtbRunning: boolean; // Controls ATB prediction pause/resume
}>();

// ATB client-side prediction for smooth 100% fill
const { predictedReadiness, pause: pauseATB, resume: resumeATB } = useATBPrediction(() => props.atbProgress);

// Pause/resume ATB prediction based on isAtbRunning prop
watch(
	() => props.isAtbRunning,
	(running) => {
		if (running) {
			resumeATB(); // ATB phase - resume progression
		} else {
			pauseATB(); // Turn phase - stop ATB progression
		}
	},
	{ immediate: true },
);

// Use predicted ATB value for display
const predictedATB = computed(() => predictedReadiness.value);

// Progress bar colors using composable
const { colorClass: hpGradientClass, percentage: hpPercentage } = useProgressBarColor(
	() => props.hp,
	() => props.maxHp,
	"health",
);

const { colorClass: mpGradientClass, percentage: mpPercentage } = useProgressBarColor(
	() => props.mp,
	() => props.maxMp,
	"mana",
);
</script>
