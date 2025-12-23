<script setup lang="ts">
import { computed, toRef } from "vue";
import { useTransition, TransitionPresets } from "@vueuse/core";

const props = withDefaults(
	defineProps<{
		value: number;
		max?: number;
		color?: "default" | "health" | "mana" | "atb" | "enemy";
		animated?: boolean;
		containerClass?: string;
	}>(),
	{
		max: 100,
		color: "default",
		animated: true,
	},
);

const rawPercentage = computed(() => Math.max(0, Math.min(100, (props.value / props.max) * 100)));

const smoothPercentage = useTransition(toRef(() => rawPercentage.value), {
	duration: props.animated ? 300 : 0,
	transition: TransitionPresets.easeOutCubic,
});

const colorClass = computed(() => {
	switch (props.color) {
		case "health":
			if (rawPercentage.value > 50) return "bg-green-500";
			if (rawPercentage.value > 25) return "bg-yellow-500";
			return "bg-red-500";
		case "mana":
			return "bg-blue-500";
		case "atb":
			return "bg-primary";
		case "enemy":
			return "bg-destructive";
		default:
			return "bg-primary";
	}
});
</script>

<template>
	<div class="bg-muted rounded-full overflow-hidden" :class="[containerClass || 'h-2']">
		<div
			class="h-full transition-colors duration-200"
			:class="colorClass"
			:style="{ width: `${smoothPercentage}%` }"
		/>
	</div>
</template>
