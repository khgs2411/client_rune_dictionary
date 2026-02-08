<template>
	<div class="floating-number" :class="[type === 'heal' ? 'heal' : 'damage']">
		{{ type === "heal" ? "+" : "-" }}{{ value }}
	</div>
</template>

<script setup lang="ts">
defineProps<{
	value: number;
	type: "damage" | "heal";
}>();
</script>

<style scoped>
.floating-number {
	font-size: 1.5rem;
	font-weight: 900;
	letter-spacing: 0.05em;
	pointer-events: none;
	animation: floatUp 800ms ease-out forwards;
	text-shadow:
		0 1px 4px rgba(0, 0, 0, 0.8),
		0 0 12px currentColor;
}

.damage {
	color: #ff4444;
}

.heal {
	color: #44ff88;
}

@keyframes floatUp {
	0% {
		transform: translateY(0) scale(1.2);
		opacity: 1;
	}
	60% {
		opacity: 1;
	}
	100% {
		transform: translateY(-60px) scale(0.8);
		opacity: 0;
	}
}
</style>
