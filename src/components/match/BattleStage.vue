<template>
	<div ref="stageRef" class="battle-stage">
		<!-- Stage Backdrop - Layered atmospheric effects -->
		<div class="stage-backdrop">
			<!-- Base: Deep dark gradient -->
			<div class="absolute inset-0 bg-gradient-to-b from-[#0a0c14] via-[#111627] to-[#0d1020]" />

			<!-- Ambient fog layer -->
			<div class="absolute inset-0 fog-layer" />

			<!-- Runic ground area -->
			<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[45%]">
				<div class="absolute inset-0 bg-gradient-to-t from-amber-900/15 via-amber-800/8 to-transparent" />
				<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 rounded-[50%] bg-amber-500/5 blur-2xl" />
			</div>

			<!-- Runic circle on ground -->
			<div class="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[70%] aspect-[3/1] rune-circle" />

			<!-- Atmospheric particles (amber + gold + cyan) -->
			<div class="absolute inset-0 pointer-events-none">
				<div class="particle particle-1" />
				<div class="particle particle-2" />
				<div class="particle particle-3" />
				<div class="particle particle-4" />
				<div class="particle particle-5" />
				<div class="particle particle-6" />
				<div class="particle particle-7" />
				<div class="particle particle-8" />
			</div>

			<!-- Edge vignettes (no box frame) -->
			<div class="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/60 to-transparent" />
			<div class="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/60 to-transparent" />
			<div class="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-black/70 to-transparent" />
			<div class="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black/50 to-transparent" />

			<!-- Grimoire corner ornaments (match RuneForge) -->
			<div class="corner-ornament tl" />
			<div class="corner-ornament tr" />
			<div class="corner-ornament bl" />
			<div class="corner-ornament br" />
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
			<div class="clash-indicator">
				<div class="relative">
					<Icon icon="game-icons:crossed-swords" class="w-10 h-10 text-amber-400/20" />
					<div class="absolute inset-0 blur-md">
						<Icon icon="game-icons:crossed-swords" class="w-10 h-10 text-amber-400/10" />
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
/* ═══════════════════════════════════════════
   BATTLE STAGE — full available space
   ═══════════════════════════════════════════ */

.battle-stage {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.stage-backdrop {
	position: absolute;
	inset: 0;
	overflow: hidden;
}

/* ═══════════════════════════════════════════
   CORNER ORNAMENTS (grimoire style)
   ═══════════════════════════════════════════ */

.corner-ornament {
	position: absolute;
	width: 18px;
	height: 18px;
	pointer-events: none;
	z-index: 4;
	opacity: 0.4;
}

.corner-ornament.tl {
	top: 8px;
	left: 8px;
	border-top: 1.5px solid rgba(217, 170, 90, 0.5);
	border-left: 1.5px solid rgba(217, 170, 90, 0.5);
}

.corner-ornament.tr {
	top: 8px;
	right: 8px;
	border-top: 1.5px solid rgba(217, 170, 90, 0.5);
	border-right: 1.5px solid rgba(217, 170, 90, 0.5);
}

.corner-ornament.bl {
	bottom: 8px;
	left: 8px;
	border-bottom: 1.5px solid rgba(217, 170, 90, 0.5);
	border-left: 1.5px solid rgba(217, 170, 90, 0.5);
}

.corner-ornament.br {
	bottom: 8px;
	right: 8px;
	border-bottom: 1.5px solid rgba(217, 170, 90, 0.5);
	border-right: 1.5px solid rgba(217, 170, 90, 0.5);
}

/* ═══════════════════════════════════════════
   FOG
   ═══════════════════════════════════════════ */

.fog-layer {
	background:
		radial-gradient(ellipse at 20% 80%, rgba(180, 140, 80, 0.1) 0%, transparent 60%),
		radial-gradient(ellipse at 80% 70%, rgba(100, 130, 180, 0.08) 0%, transparent 50%),
		radial-gradient(ellipse at 50% 90%, rgba(160, 120, 60, 0.08) 0%, transparent 40%);
	animation: fogDrift 12s ease-in-out infinite alternate;
	opacity: 0.3;
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

/* ═══════════════════════════════════════════
   RUNIC CIRCLE — amber/gold glow
   ═══════════════════════════════════════════ */

.rune-circle {
	background: radial-gradient(ellipse at center, rgba(217, 170, 90, 0.06) 0%, rgba(217, 170, 90, 0.02) 40%, transparent 70%);
	border: 1px solid rgba(217, 170, 90, 0.06);
	border-radius: 50%;
	animation: runeGlow 4s ease-in-out infinite alternate;
	opacity: 0.2;
}

@keyframes runeGlow {
	0% {
		opacity: 0.15;
		box-shadow: 0 0 20px rgba(217, 170, 90, 0.04);
	}
	100% {
		opacity: 0.3;
		box-shadow: 0 0 40px rgba(217, 170, 90, 0.08);
	}
}

/* ═══════════════════════════════════════════
   PARTICLES — amber, gold, and cyan mix
   ═══════════════════════════════════════════ */

.particle {
	position: absolute;
	width: 3px;
	height: 3px;
	border-radius: 50%;
}

/* Amber/gold particles */
.particle-1 {
	left: 15%;
	bottom: 20%;
	background: rgba(217, 170, 90, 0.5);
	box-shadow: 0 0 6px rgba(217, 170, 90, 0.3);
	animation: floatUp 6s ease-in-out infinite;
}

.particle-2 {
	left: 35%;
	bottom: 15%;
	background: rgba(217, 170, 90, 0.4);
	box-shadow: 0 0 6px rgba(217, 170, 90, 0.25);
	animation: floatUp 8s ease-in-out infinite 1s;
}

.particle-3 {
	left: 55%;
	bottom: 25%;
	background: rgba(255, 200, 80, 0.4);
	box-shadow: 0 0 6px rgba(255, 200, 80, 0.3);
	animation: floatUp 7s ease-in-out infinite 2s;
}

.particle-4 {
	left: 75%;
	bottom: 18%;
	background: rgba(217, 170, 90, 0.35);
	box-shadow: 0 0 6px rgba(217, 170, 90, 0.2);
	animation: floatUp 9s ease-in-out infinite 0.5s;
}

/* Cyan accent particles */
.particle-5 {
	left: 25%;
	bottom: 30%;
	width: 2px;
	height: 2px;
	background: rgba(0, 200, 255, 0.35);
	box-shadow: 0 0 6px rgba(0, 200, 255, 0.25);
	animation: floatUp 5s ease-in-out infinite 3s;
}

.particle-6 {
	left: 65%;
	bottom: 22%;
	width: 2px;
	height: 2px;
	background: rgba(0, 200, 255, 0.3);
	box-shadow: 0 0 6px rgba(0, 200, 255, 0.2);
	animation: floatUp 6.5s ease-in-out infinite 1.5s;
}

/* Gold dust particles */
.particle-7 {
	left: 45%;
	bottom: 12%;
	width: 2px;
	height: 2px;
	background: rgba(255, 215, 0, 0.4);
	box-shadow: 0 0 4px rgba(255, 215, 0, 0.3);
	animation: floatUp 7.5s ease-in-out infinite 2.5s;
}

.particle-8 {
	left: 85%;
	bottom: 28%;
	width: 2px;
	height: 2px;
	background: rgba(255, 215, 0, 0.3);
	box-shadow: 0 0 4px rgba(255, 215, 0, 0.2);
	animation: floatUp 5.5s ease-in-out infinite 0.8s;
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

/* ═══════════════════════════════════════════
   CLASH INDICATOR — amber pulse
   ═══════════════════════════════════════════ */

.clash-indicator {
	position: absolute;
	left: 50%;
	top: 40%;
	transform: translate(-50%, -50%);
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
