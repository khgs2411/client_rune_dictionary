<template>
	<div class="flex flex-col gap-2.5 h-full">
		<div
			v-for="member in partyMembers"
			:key="member.id"
			:class="['status-card flex-1', variant === 'enemy' ? 'enemy-card' : 'player-card']">
			<!-- Content -->
			<div class="panel-body h-full flex flex-col">
				<!-- Name row -->
				<div class="flex items-center gap-1.5 mb-1.5">
					<Icon
						:icon="variant === 'enemy' ? 'game-icons:skull-crossed-bones' : 'game-icons:knight-banner'"
						:class="['w-4 h-4', variant === 'enemy' ? 'text-red-400' : 'text-cyan-400']" />
					<span class="name-text">{{ member.name }}</span>
				</div>

				<!-- HP Bar -->
				<div class="bar-section">
					<div class="bar-header">
						<span class="bar-label">HP</span>
						<span class="bar-value">{{ member.hp }}/{{ member.maxHp }}</span>
					</div>
					<div class="bar-container bar-hp-height">
						<div class="bar-fill bar-hp" :style="{ width: `${hpPercent(member)}%` }">
							<div class="bar-shine" />
						</div>
						<div class="bar-track-marks" />
					</div>
				</div>

				<!-- MP Bar -->
				<div class="bar-section mt-1.5">
					<div class="bar-header">
						<span class="bar-label">MP</span>
						<span class="bar-value">{{ member.mp }}/{{ member.maxMp }}</span>
					</div>
					<div class="bar-container bar-mp-height">
						<div class="bar-fill bar-mp" :style="{ width: `${mpPercent(member)}%` }">
							<div class="bar-shine" />
						</div>
					</div>
				</div>

				<!-- ATB Gauge (integrated) -->
				<div v-if="atbProgress !== undefined" class="bar-section mt-1.5">
					<div class="bar-header">
						<span class="bar-label">ATB</span>
						<span class="bar-value">{{ Math.round(atbProgress) }}%</span>
					</div>
					<div class="bar-container bar-atb-height">
						<div
							class="bar-fill"
							:class="variant === 'enemy' ? 'bar-atb-enemy' : 'bar-atb-player'"
							:style="{ width: `${atbProgress}%` }">
							<div class="bar-shine" />
						</div>
					</div>
				</div>

				<!-- Active Effects Row (always rendered, pushed to bottom) -->
				<div class="effects-row mt-auto" :class="{ 'effects-hidden': !activeEffects || activeEffects.length === 0 }">
					<ActiveEffectsDisplay :effects="activeEffects ?? []" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import ActiveEffectsDisplay from "./ActiveEffectsDisplay.vue";

interface StatusEffect {
	id: string;
	name: string;
	description: string;
	icon: string;
	type: "buff" | "debuff";
}

interface PartyMember {
	id: string;
	name: string;
	hp: number;
	maxHp: number;
	mp: number;
	maxMp: number;
	statusEffects: StatusEffect[];
}

withDefaults(
	defineProps<{
		partyMembers: PartyMember[];
		variant?: "player" | "enemy";
		atbProgress?: number;
		activeEffects?: { id: string; name: string; type: string; remainingTurns: number }[];
	}>(),
	{
		variant: "player",
	},
);

function hpPercent(member: PartyMember): number {
	return member.maxHp > 0 ? Math.max(0, Math.min(100, (member.hp / member.maxHp) * 100)) : 0;
}

function mpPercent(member: PartyMember): number {
	return member.maxMp > 0 ? Math.max(0, Math.min(100, (member.mp / member.maxMp) * 100)) : 0;
}
</script>

<style scoped>
/* ═══════════════════════════════════════════
   GRIMOIRE PANEL — the enchanted status frame
   ═══════════════════════════════════════════ */

.status-card {
	--accent: #d9aa5a;
	--accent-40: rgba(217, 170, 90, 0.4);
	--accent-25: rgba(217, 170, 90, 0.25);

	position: relative;
	border-radius: 6px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(217, 170, 90, 0.12);
}

.player-card {
	--side-accent: #22d3ee;
	--side-accent-glow: rgba(34, 211, 238, 0.15);
	border-color: rgba(34, 211, 238, 0.15);
}

.enemy-card {
	--side-accent: #f87171;
	--side-accent-glow: rgba(248, 113, 113, 0.15);
	border-color: rgba(248, 113, 113, 0.15);
}

/* ═══════════════════════════════════════════
   PANEL BODY
   ═══════════════════════════════════════════ */

.panel-body {
	position: relative;
	z-index: 3;
	padding: 10px 12px;
	min-height: 0;
}

.name-text {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 0.8rem;
	font-weight: 700;
	letter-spacing: 0.03em;
	color: rgba(255, 255, 255, 0.95);
	text-shadow: 0 0 12px var(--side-accent-glow);
}

/* ═══════════════════════════════════════════
   BAR SYSTEM
   ═══════════════════════════════════════════ */

.bar-section {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.bar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.bar-label {
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.15em;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 0.4);
}

.bar-value {
	font-size: 10px;
	font-family: ui-monospace, monospace;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.7);
}

.bar-container {
	position: relative;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 3px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.05);
}

.bar-hp-height {
	height: 10px;
}
.bar-mp-height {
	height: 6px;
}
.bar-atb-height {
	height: 6px;
}

.bar-fill {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	border-radius: 2px;
	transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* HP bar */
.bar-hp {
	background: linear-gradient(90deg, #22c55e, #4ade80);
	box-shadow:
		0 0 8px rgba(34, 197, 94, 0.3),
		inset 0 -1px 2px rgba(0, 0, 0, 0.2);
}

/* MP bar */
.bar-mp {
	background: linear-gradient(90deg, #3b82f6, #60a5fa);
	box-shadow:
		0 0 6px rgba(59, 130, 246, 0.3),
		inset 0 -1px 2px rgba(0, 0, 0, 0.2);
}

/* ATB bars */
.bar-atb-player {
	background: linear-gradient(90deg, #0891b2, #22d3ee);
	box-shadow: 0 0 6px rgba(34, 211, 238, 0.3);
	transition: width 0.15s linear;
}

.bar-atb-enemy {
	background: linear-gradient(90deg, #dc2626, #f87171);
	box-shadow: 0 0 6px rgba(248, 113, 113, 0.3);
	transition: width 0.15s linear;
}

.bar-shine {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 40%;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
	border-radius: 2px 2px 0 0;
}

.bar-track-marks {
	position: absolute;
	inset: 0;
	background: repeating-linear-gradient(90deg, transparent, transparent 24%, rgba(0, 0, 0, 0.15) 24%, rgba(0, 0, 0, 0.15) 25%);
}

/* ═══════════════════════════════════════════
   EFFECTS ROW
   ═══════════════════════════════════════════ */

.effects-row {
	padding-top: 6px;
	border-top: 1px solid rgba(217, 170, 90, 0.1);
	transition: opacity 0.2s ease;
}

.effects-hidden {
	opacity: 0;
	pointer-events: none;
}
</style>
