<template>
	<!-- Outer wrapper for scaling (won't be affected by animations) -->
	<div class="sprite-scale-wrapper" :style="scaleStyle">
		<!-- Flip wrapper (separate from animations to avoid transform conflicts) -->
		<div :style="{ transform: props.flipX ? 'scaleX(-1)' : 'none' }">
			<div
				class="battle-sprite"
				:class="[`state-${props.state}`, { 'reduce-motion': prefersReducedMotion }]"
			>
				<img
					v-if="isLoaded"
					:src="props.spriteUrl"
					:alt="props.name"
					class="sprite-image pixelated select-none h-20"
					draggable="false"
				/>
				<!-- Loading placeholder -->
				<div v-else class="w-20 h-24 bg-muted/50 rounded animate-pulse" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useImage, usePreferredReducedMotion } from "@vueuse/core";

const props = withDefaults(
	defineProps<{
		spriteUrl: string;
		name: string;
		state?: "idle" | "attack" | "hurt" | "victory" | "defeat";
		flipX?: boolean;
		scale?: number;
	}>(),
	{
		state: "idle",
		flipX: false,
		scale: 1,
	},
);

// Preload sprite image
const { isLoading } = useImage({ src: props.spriteUrl });
const isLoaded = computed(() => !isLoading.value);

// Accessibility: respect reduced motion preference
const prefersReducedMotion = usePreferredReducedMotion();

// Reactive scale style - scale from bottom center so sprites stay grounded
const scaleStyle = computed(() => ({
	transform: `scale(${props.scale})`,
	transformOrigin: "bottom center",
}));
</script>

<style scoped>
.sprite-image {
	image-rendering: pixelated;
	image-rendering: crisp-edges;
}


/* Animation states */
.state-idle:not(.reduce-motion) {
	animation: idle-bounce 1s ease-in-out infinite;
}

.state-attack:not(.reduce-motion) {
	animation: attack-lunge 0.3s ease-out;
}

.state-hurt:not(.reduce-motion) {
	animation: hurt-shake 0.2s ease-in-out;
	filter: brightness(1.5) saturate(0.5);
}

.state-victory:not(.reduce-motion) {
	animation: victory-jump 0.5s ease-out;
}

.state-defeat:not(.reduce-motion) {
	animation: defeat-fall 0.4s ease-in forwards;
}

/* Reduced motion: no animations, just state colors */
.reduce-motion.state-hurt {
	filter: brightness(1.5) saturate(0.5);
}

.reduce-motion.state-defeat {
	opacity: 0.5;
}

@keyframes idle-bounce {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-4px);
	}
}

@keyframes attack-lunge {
	0% {
		transform: translateX(0);
	}
	50% {
		transform: translateX(30px);
	}
	100% {
		transform: translateX(0);
	}
}

@keyframes hurt-shake {
	0%,
	100% {
		transform: translateX(0);
	}
	20% {
		transform: translateX(-8px);
	}
	40% {
		transform: translateX(8px);
	}
	60% {
		transform: translateX(-4px);
	}
	80% {
		transform: translateX(4px);
	}
}

@keyframes victory-jump {
	0% {
		transform: translateY(0) rotate(0deg);
	}
	50% {
		transform: translateY(-20px) rotate(10deg);
	}
	100% {
		transform: translateY(0) rotate(0deg);
	}
}

@keyframes defeat-fall {
	0% {
		transform: translateY(0) rotate(0deg);
		opacity: 1;
	}
	100% {
		transform: translateY(10px) rotate(-90deg);
		opacity: 0.5;
	}
}
</style>
