<template>
	<div class="flex rounded-lg border overflow-hidden bg-muted/30">
		<button
			v-for="tier in tiers"
			:key="tier.value"
			type="button"
			:class="[
				'flex-1 px-3 py-2 text-sm font-medium transition-colors relative',
				modelValue === tier.value ? 'bg-background shadow-sm' : 'hover:bg-muted',
			]"
			@click="$emit('update:modelValue', tier.value)">
			<span :class="['mr-1', tier.colorClass]">{{ tier.label }}</span>
			<span
				v-if="getRuleCount(tier.value) > 0"
				class="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-primary/10 text-primary">
				{{ getRuleCount(tier.value) }}
			</span>
		</button>
	</div>
</template>

<script setup lang="ts">
type TierValue = 1 | 2 | 3 | 4;

defineProps<{
	modelValue: TierValue;
	getRuleCount: (tier: TierValue) => number;
}>();

defineEmits<{
	"update:modelValue": [value: TierValue];
}>();

const tiers: { value: TierValue; label: string; colorClass: string }[] = [
	{ value: 1, label: "T1", colorClass: "text-zinc-400" },
	{ value: 2, label: "T2", colorClass: "text-green-500" },
	{ value: 3, label: "T3", colorClass: "text-blue-500" },
	{ value: 4, label: "T4", colorClass: "text-purple-500" },
];
</script>
