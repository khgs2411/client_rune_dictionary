<template>
	<div ref="stageRef" class="battle-stage relative h-[50vh] overflow-hidden rounded-xl">
		<!-- Stage Backdrop - Layered atmospheric effects -->
		<div class="absolute inset-0 overflow-hidden rounded-xl">
			<!-- Base: Deep dark gradient -->
			<div class="absolute inset-0 bg-gradient-to-b from-[#0a0c14] via-[#111627] to-[#0d1020]" />

			<!-- Ambient fog layer -->
			<div class="absolute inset-0 fog-layer opacity-30" />

			<!-- Runic ground circle -->
			<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[45%]">
				<div class="absolute inset-0 bg-gradient-to-t from-amber-900/15 via-amber-800/8 to-transparent" />
				<!-- Ground reflection glow -->
				<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 rounded-[50%] bg-cyan-500/5 blur-2xl" />
			</div>

			<!-- Runic circle on the ground -->
			<div class="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[70%] aspect-[3/1] rune-circle opacity-20" />

			<!-- Atmospheric particles (CSS-only) -->
			<div class="absolute inset-0 pointer-events-none">
				<div class="particle particle-1" />
				<div class="particle particle-2" />
				<div class="particle particle-3" />
				<div class="particle particle-4" />
				<div class="particle particle-5" />
				<div class="particle particle-6" />
			</div>

			<!-- Side vignette pillars (dark edges) -->
			<div class="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/60 to-transparent" />
			<div class="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/60 to-transparent" />

			<!-- Top/bottom vignette -->
			<div class="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-black/70 to-transparent" />
			<div class="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black/50 to-transparent" />

			<!-- Border frame -->
			<div class="absolute inset-0 rounded-xl border border-cyan-500/10 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]" />
			<!-- Corner rune accents -->
			<div class="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-sm" />
			<div class="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-sm" />
			<div class="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-sm" />
			<div class="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500/20 rounded-br-sm" />
		</div>

		<!-- Combatants Container -->
		<div class="relative z-10 flex justify-between items-end px-[12%] h-full pb-16">
			<!-- Player Zone (Left) -->
			<div class="combatant-zone flex flex-col items-center gap-4">
				<BattleSprite
					v-for="member in partyMembers"
					:key="member.id"
					:sprite-url="member.spriteUrl"
					:sprite-sheet-id="member.spriteSheetId"
					:name="member.name"
					:state="member.animationState"
					:flip-x="member.flipX"
					:scale="spriteScale" />
			</div>

			<!-- Clash Indicator (center) -->
			<div class="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 clash-indicator">
				<div class="relative">
					<Icon icon="game-icons:crossed-swords" class="w-10 h-10 text-cyan-400/20" />
					<div class="absolute inset-0 blur-md">
						<Icon icon="game-icons:crossed-swords" class="w-10 h-10 text-cyan-400/10" />
					</div>
				</div>
			</div>

			<!-- Enemy Zone (Right) -->
			<div class="combatant-zone flex flex-col items-center gap-4">
				<BattleSprite
					v-for="enemy in enemies"
					:key="enemy.id"
					:sprite-url="enemy.spriteUrl"
					:sprite-sheet-id="enemy.spriteSheetId"
					:name="enemy.name"
					:state="enemy.animationState"
					:flip-x="enemy.flipX"
					:scale="spriteScale" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useElementSize } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import BattleSprite from "./BattleSprite.vue";

interface Combatant {
	id: string;
	name: string;
	spriteUrl?: string;
	spriteSheetId?: string;
	animationState: "idle" | "attack" | "hurt" | "victory" | "defeat";
	flipX?: boolean;
}

defineProps<{
	partyMembers: Combatant[];
	enemies: Combatant[];
}>();

const stageRef = ref<HTMLElement | null>(null);
const { width } = useElementSize(stageRef);

const spriteScale = computed(() => {
	if (width.value < 480) return 1.5;
	if (width.value < 768) return 2;
	return 2.5;
});
</script>

<style scoped>
/* Fog animation layer */
.fog-layer {
	background:
		radial-gradient(ellipse at 20% 80%, rgba(100, 130, 180, 0.15) 0%, transparent 60%),
		radial-gradient(ellipse at 80% 70%, rgba(80, 120, 160, 0.1) 0%, transparent 50%),
		radial-gradient(ellipse at 50% 90%, rgba(60, 100, 140, 0.12) 0%, transparent 40%);
	animation: fogDrift 12s ease-in-out infinite alternate;
}

@keyframes fogDrift {
	0% {
		transform: translateX(-2%) scale(1);
		opacity: 0.2;
	}
	100% {
		transform: translateX(2%) scale(1.05);
		opacity: 0.35;
	}
}

/* Runic circle on the arena floor */
.rune-circle {
	background: radial-gradient(ellipse at center, rgba(0, 200, 255, 0.08) 0%, rgba(0, 200, 255, 0.03) 40%, transparent 70%);
	border: 1px solid rgba(0, 200, 255, 0.08);
	border-radius: 50%;
	animation: runeGlow 4s ease-in-out infinite alternate;
}

@keyframes runeGlow {
	0% {
		opacity: 0.15;
		box-shadow: 0 0 20px rgba(0, 200, 255, 0.05);
	}
	100% {
		opacity: 0.3;
		box-shadow: 0 0 40px rgba(0, 200, 255, 0.1);
	}
}

/* Floating particles */
.particle {
	position: absolute;
	width: 3px;
	height: 3px;
	background: rgba(0, 200, 255, 0.4);
	border-radius: 50%;
	box-shadow: 0 0 6px rgba(0, 200, 255, 0.3);
}

.particle-1 {
	left: 15%;
	bottom: 20%;
	animation: floatUp 6s ease-in-out infinite;
	animation-delay: 0s;
}

.particle-2 {
	left: 35%;
	bottom: 15%;
	animation: floatUp 8s ease-in-out infinite;
	animation-delay: 1s;
}

.particle-3 {
	left: 55%;
	bottom: 25%;
	animation: floatUp 7s ease-in-out infinite;
	animation-delay: 2s;
}

.particle-4 {
	left: 75%;
	bottom: 18%;
	animation: floatUp 9s ease-in-out infinite;
	animation-delay: 0.5s;
}

.particle-5 {
	left: 45%;
	bottom: 30%;
	animation: floatUp 5s ease-in-out infinite;
	animation-delay: 3s;
	width: 2px;
	height: 2px;
	background: rgba(255, 180, 50, 0.4);
	box-shadow: 0 0 6px rgba(255, 180, 50, 0.3);
}

.particle-6 {
	left: 65%;
	bottom: 22%;
	animation: floatUp 6.5s ease-in-out infinite;
	animation-delay: 1.5s;
	width: 2px;
	height: 2px;
	background: rgba(255, 180, 50, 0.3);
	box-shadow: 0 0 6px rgba(255, 180, 50, 0.2);
}

@keyframes floatUp {
	0% {
		transform: translateY(0) translateX(0);
		opacity: 0;
	}
	10% {
		opacity: 0.6;
	}
	50% {
		transform: translateY(-80px) translateX(10px);
		opacity: 0.8;
	}
	90% {
		opacity: 0.3;
	}
	100% {
		transform: translateY(-150px) translateX(-5px);
		opacity: 0;
	}
}

/* Clash indicator pulse */
.clash-indicator {
	animation: clashPulse 3s ease-in-out infinite;
}

@keyframes clashPulse {
	0%,
	100% {
		transform: translate(-50%, -50%) scale(1);
		opacity: 0.6;
	}
	50% {
		transform: translate(-50%, -50%) scale(1.1);
		opacity: 1;
	}
}
</style>
