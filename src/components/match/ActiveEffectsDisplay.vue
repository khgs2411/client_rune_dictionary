<template>
	<div v-if="effects.length > 0" class="flex items-center gap-1.5">
		<div
			v-for="effect in effects"
			:key="effect.id"
			class="effect-badge"
			:class="badgeClass(effect.type)"
			:title="`${effect.name} (${effect.remainingTurns} turns)`">
			<Icon :icon="iconFor(effect.type)" class="w-3 h-3" />
			<span class="text-[9px] font-bold">{{ effect.remainingTurns }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface ActiveEffect {
	id: string;
	name: string;
	type: string;
	remainingTurns: number;
}

defineProps<{
	effects: ActiveEffect[];
}>();

function iconFor(type: string): string {
	switch (type) {
		case "PERIODIC":
			return "game-icons:burning-dot";
		case "DELAYED":
			return "game-icons:time-bomb";
		case "STAT_MODIFIER":
			return "game-icons:aura";
		default:
			return "game-icons:magic-swirl";
	}
}

function badgeClass(type: string): string {
	switch (type) {
		case "PERIODIC":
			return "periodic";
		case "DELAYED":
			return "delayed";
		case "STAT_MODIFIER":
			return "modifier";
		default:
			return "periodic";
	}
}
</script>

<style scoped>
.effect-badge {
	display: flex;
	align-items: center;
	gap: 2px;
	padding: 2px 5px;
	border-radius: 4px;
	font-weight: 700;
}

.periodic {
	background: rgba(255, 60, 60, 0.2);
	color: #ff6666;
	border: 1px solid rgba(255, 60, 60, 0.3);
}

.delayed {
	background: rgba(255, 180, 50, 0.2);
	color: #ffbb44;
	border: 1px solid rgba(255, 180, 50, 0.3);
}

.modifier {
	background: rgba(100, 200, 255, 0.2);
	color: #66ccff;
	border: 1px solid rgba(100, 200, 255, 0.3);
}
</style>
