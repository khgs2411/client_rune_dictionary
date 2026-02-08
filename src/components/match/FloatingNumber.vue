<template>
	<div
		class="floating-number"
		:class="[typeClass]"
		:style="{ '--rand-x': `${randX}px` }">
		{{ prefix }}{{ value }}
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	value: number;
	type: "damage" | "heal" | "critical";
}>();

const randX = Math.floor(Math.random() * 40 - 20);

const typeClass = computed(() => {
	switch (props.type) {
		case "heal":
			return "heal";
		case "critical":
			return "critical";
		default:
			return "damage";
	}
});

const prefix = computed(() => (props.type === "heal" ? "+" : "-"));
</script>

<style scoped>
.floating-number {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 2.5rem;
	font-weight: 900;
	letter-spacing: 0.02em;
	pointer-events: none;
	-webkit-text-stroke: 2px rgba(0, 0, 0, 0.8);
	paint-order: stroke fill;
	text-shadow: 0 3px 6px rgba(0, 0, 0, 0.7);
	animation: mapleFloat 1000ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
}

.damage {
	color: #ff4444;
	-webkit-text-stroke-color: #660000;
}

.heal {
	color: #44ff88;
	-webkit-text-stroke-color: #006622;
}

.critical {
	color: #ffd700;
	font-size: 3.5rem;
	-webkit-text-stroke-color: #664400;
	filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
}

@keyframes mapleFloat {
	0% {
		transform: translateY(0) translateX(var(--rand-x)) scale(1.5);
		opacity: 1;
	}
	15% {
		transform: translateY(-30px) translateX(var(--rand-x)) scale(1);
	}
	70% {
		opacity: 1;
	}
	100% {
		transform: translateY(-80px) translateX(var(--rand-x)) scale(0.9);
		opacity: 0;
	}
}
</style>
