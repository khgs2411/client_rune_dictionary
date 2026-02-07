<template>
	<!-- Outer wrapper for scaling (won't be affected by animations) -->
	<div class="sprite-scale-wrapper" :style="scaleStyle">
		<!-- Flip wrapper (separate from animations to avoid transform conflicts) -->
		<div :style="{ transform: props.flipX ? 'scaleX(-1)' : 'none' }">
			<div class="battle-sprite" :class="[`state-${props.state}`, { 'reduce-motion': prefersReducedMotion }]">
				<!-- Active turn glow aura -->
				<div v-if="props.state !== 'defeat'" class="sprite-aura" />

				<!-- Sprite sheet mode: CSS background-position animation -->
				<div
					v-if="sheetConfig"
					class="sprite-image pixelated select-none"
					:style="sheetStyle"
					draggable="false"
					role="img"
					:aria-label="props.name" />

				<!-- Static image mode -->
				<img
					v-else-if="isLoaded"
					:src="props.spriteUrl"
					:alt="props.name"
					class="sprite-image pixelated select-none h-20"
					draggable="false" />

				<!-- Loading placeholder -->
				<div v-else class="w-20 h-24 bg-muted/50 rounded animate-pulse" />
			</div>
		</div>
		<!-- Ground shadow -->
		<div class="ground-shadow" />
	</div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useImage, usePreferredReducedMotion } from "@vueuse/core";
import { SpriteSheetRegistry } from "@/game/SpriteSheetRegistry";
import type { AnimationClip } from "@/game/common/sprite.types";

const props = withDefaults(
	defineProps<{
		spriteUrl?: string;
		spriteSheetId?: string;
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

// Static image preloading (only when no sprite sheet)
const { isLoading } = useImage({ src: props.spriteUrl ?? "" });
const isLoaded = computed(() => !props.spriteUrl || !isLoading.value);

const prefersReducedMotion = usePreferredReducedMotion();

// Sprite sheet config from registry
const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();

const sheetConfig = computed(() => {
	if (!props.spriteSheetId) return null;
	return registry.getSpriteConfig(props.spriteSheetId);
});

const animationClips = computed(() => {
	if (!props.spriteSheetId) return [];
	return registry.buildAnimations(props.spriteSheetId);
});

// Current animation frame
const currentFrame = ref(0);
let animTimer: ReturnType<typeof setInterval> | null = null;

function startAnimation(clip: AnimationClip) {
	stopAnimation();
	currentFrame.value = clip.startFrame;

	if (clip.startFrame === clip.endFrame) return; // Static frame, no cycling

	const intervalMs = 1000 / clip.fps;
	animTimer = setInterval(() => {
		currentFrame.value++;
		if (currentFrame.value > clip.endFrame) {
			currentFrame.value = clip.loop !== false ? clip.startFrame : clip.endFrame;
		}
	}, intervalMs);
}

function stopAnimation() {
	if (animTimer) {
		clearInterval(animTimer);
		animTimer = null;
	}
}

// Start idle animation when sprite sheet is available
watch(
	animationClips,
	(clips) => {
		const idle = clips.find((c) => c.name === "idle");
		if (idle) startAnimation(idle);
	},
	{ immediate: true },
);

onUnmounted(() => stopAnimation());

// Compute CSS for sprite sheet rendering
const sheetStyle = computed(() => {
	if (!sheetConfig.value) return {};

	const { columns, rows } = sheetConfig.value.spriteSheet;
	const col = currentFrame.value % columns;
	const row = Math.floor(currentFrame.value / columns);

	// background-position as percentage: col/(cols-1)*100, row/(rows-1)*100
	const bgPosX = columns > 1 ? (col / (columns - 1)) * 100 : 0;
	const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 0;

	return {
		backgroundImage: `url(${sheetConfig.value.texture})`,
		backgroundSize: `${columns * 100}% ${rows * 100}%`,
		backgroundPosition: `${bgPosX}% ${bgPosY}%`,
		width: "80px",
		height: "80px",
	};
});

const scaleStyle = computed(() => ({
	transform: `scale(${props.scale})`,
	transformOrigin: "bottom center",
}));
</script>

<style scoped>
.sprite-scale-wrapper {
	position: relative;
}

.sprite-image {
	image-rendering: pixelated;
	image-rendering: crisp-edges;
	position: relative;
	z-index: 1;
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
}

/* Ground shadow ellipse */
.ground-shadow {
	position: absolute;
	bottom: -4px;
	left: 50%;
	transform: translateX(-50%);
	width: 60%;
	height: 8px;
	background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, transparent 70%);
	border-radius: 50%;
}

/* Subtle aura behind sprite */
.sprite-aura {
	position: absolute;
	inset: -8px;
	border-radius: 50%;
	opacity: 0;
	z-index: 0;
	transition: opacity 0.3s ease;
}

/* Animation states */
.state-idle:not(.reduce-motion) {
	animation: idle-bounce 1.8s ease-in-out infinite;
}

.state-idle .sprite-aura {
	background: radial-gradient(ellipse at center, rgba(0, 200, 255, 0.1) 0%, transparent 70%);
	opacity: 0.5;
	animation: auraPulse 2s ease-in-out infinite;
}

.state-attack:not(.reduce-motion) {
	animation: attack-lunge 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.state-attack .sprite-image {
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 12px rgba(255, 200, 50, 0.5));
}

.state-hurt:not(.reduce-motion) {
	animation: hurt-shake 0.3s ease-in-out;
}

.state-hurt .sprite-image {
	filter: brightness(2) saturate(0.3) drop-shadow(0 0 8px rgba(255, 50, 50, 0.6));
	transition: filter 0.15s ease;
}

.state-hurt .sprite-aura {
	background: radial-gradient(ellipse at center, rgba(255, 50, 50, 0.2) 0%, transparent 60%);
	opacity: 0.8;
}

.state-victory:not(.reduce-motion) {
	animation: victory-jump 0.5s ease-out;
}

.state-victory .sprite-image {
	filter: drop-shadow(0 0 16px rgba(255, 215, 0, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
}

.state-victory .sprite-aura {
	background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.2) 0%, transparent 60%);
	opacity: 1;
}

.state-defeat:not(.reduce-motion) {
	animation: defeat-fall 0.5s ease-in forwards;
}

/* Reduced motion: no animations, just state colors */
.reduce-motion.state-hurt .sprite-image {
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
		transform: translateY(-5px);
	}
}

@keyframes auraPulse {
	0%,
	100% {
		opacity: 0.3;
		transform: scale(1);
	}
	50% {
		opacity: 0.6;
		transform: scale(1.05);
	}
}

@keyframes attack-lunge {
	0% {
		transform: translateX(0) scale(1);
	}
	30% {
		transform: translateX(-5px) scale(1.05);
	}
	60% {
		transform: translateX(35px) scale(1.1);
	}
	100% {
		transform: translateX(0) scale(1);
	}
}

@keyframes hurt-shake {
	0%,
	100% {
		transform: translateX(0);
	}
	15% {
		transform: translateX(-10px) rotate(-2deg);
	}
	30% {
		transform: translateX(10px) rotate(2deg);
	}
	45% {
		transform: translateX(-6px) rotate(-1deg);
	}
	60% {
		transform: translateX(6px) rotate(1deg);
	}
	75% {
		transform: translateX(-3px);
	}
}

@keyframes victory-jump {
	0% {
		transform: translateY(0) rotate(0deg) scale(1);
	}
	40% {
		transform: translateY(-25px) rotate(5deg) scale(1.1);
	}
	100% {
		transform: translateY(0) rotate(0deg) scale(1);
	}
}

@keyframes defeat-fall {
	0% {
		transform: translateY(0) rotate(0deg);
		opacity: 1;
		filter: none;
	}
	50% {
		filter: saturate(0) brightness(0.5);
	}
	100% {
		transform: translateY(12px) rotate(-90deg);
		opacity: 0.3;
		filter: saturate(0) brightness(0.3);
	}
}
</style>
