<template>
	<div v-if="effects.length > 0" class="flex items-center gap-2">
		<div
			v-for="effect in effects"
			:key="effect.id"
			class="effect-orb"
			:class="orbClass(effect.type)"
			:title="`${effect.name} (${effect.remainingTurns} turns)`">
			<div class="orb-aura" />
			<Icon :icon="iconFor(effect.type)" class="orb-icon" />
			<span class="orb-count">{{ effect.remainingTurns }}</span>
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

function orbClass(type: string): string {
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
.effect-orb {
	position: relative;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1.5px solid;
}

.orb-aura {
	position: absolute;
	inset: -3px;
	border-radius: 50%;
	animation: auraPulse 2s ease-in-out infinite;
}

.orb-icon {
	width: 14px;
	height: 14px;
	position: relative;
	z-index: 2;
}

.orb-count {
	position: absolute;
	bottom: -4px;
	right: -4px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: #0b0b13;
	border: 1px solid rgba(217, 170, 90, 0.4);
	font-size: 9px;
	font-weight: 800;
	color: rgba(255, 255, 255, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 3;
}

/* Periodic (red/burning) */
.periodic {
	background: rgba(255, 60, 60, 0.15);
	border-color: rgba(255, 60, 60, 0.4);
	color: #ff6666;
}

.periodic .orb-aura {
	background: radial-gradient(circle, rgba(255, 60, 60, 0.2), transparent 70%);
}

/* Delayed (orange/time) */
.delayed {
	background: rgba(255, 180, 50, 0.15);
	border-color: rgba(255, 180, 50, 0.4);
	color: #ffbb44;
}

.delayed .orb-aura {
	background: radial-gradient(circle, rgba(255, 180, 50, 0.2), transparent 70%);
}

/* Modifier (blue/aura) */
.modifier {
	background: rgba(100, 200, 255, 0.15);
	border-color: rgba(100, 200, 255, 0.4);
	color: #66ccff;
}

.modifier .orb-aura {
	background: radial-gradient(circle, rgba(100, 200, 255, 0.2), transparent 70%);
}

@keyframes auraPulse {
	0%,
	100% {
		opacity: 0.4;
		transform: scale(1);
	}
	50% {
		opacity: 0.8;
		transform: scale(1.15);
	}
}
</style>
