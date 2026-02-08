<template>
	<div class="tier-tabs">
		<button
			v-for="tier in tiers"
			:key="tier.value"
			type="button"
			:class="['tier-tab', modelValue === tier.value && 'tier-tab--active']"
			@click="$emit('update:modelValue', tier.value)">
			<span :class="['mr-1', tier.colorClass]">{{ tier.label }}</span>
			<span v-if="getRuleCount(tier.value) > 0" class="tier-count">
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

<style scoped>
.tier-tabs {
	display: flex;
	border-radius: 8px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(255, 255, 255, 0.03);
}

.tier-tab {
	flex: 1;
	padding: 6px 12px;
	font-size: 0.82rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.5);
	background: transparent;
	border: none;
	cursor: pointer;
	transition: all 0.15s ease;
	position: relative;
}

.tier-tab:hover:not(.tier-tab--active) {
	background: rgba(255, 255, 255, 0.04);
}

.tier-tab--active {
	background: rgba(155, 126, 216, 0.12);
	box-shadow: inset 0 -2px 0 rgba(155, 126, 216, 0.4);
}

.tier-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	font-size: 0.65rem;
	border-radius: 50%;
	background: rgba(155, 126, 216, 0.15);
	color: #9b7ed8;
}
</style>
