<template>
	<div class="action-bar-inner">
		<div class="bar-body">
			<!-- 8-Slot Ability Bar -->
			<div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
				<TooltipProvider v-for="index in 8" :key="index" :delay-duration="0" :skip-delay-duration="0">
					<Tooltip>
						<TooltipTrigger as-child>
							<button
								v-if="getSlot(index)"
								@click="handleAbilityClick(getSlot(index)!)"
								:disabled="!isPlayerTurn"
								:class="[
									'ability-slot w-full',
									isPlayerTurn ? 'ability-slot-active' : 'ability-slot-disabled',
								]">
								<!-- Tier accent line (top) -->
								<div class="slot-tier-accent" :style="{ background: tierColor(getSlot(index)!.tier) }" />
								<!-- Ability icon -->
								<Icon icon="game-icons:spell-book" class="w-5 h-5 relative z-10 text-white/50" />
								<!-- Keybind -->
								<span class="slot-keybind">{{ index }}</span>
							</button>
							<!-- Empty slot -->
							<button
								v-else
								disabled
								class="ability-slot empty-slot w-full">
								<Icon icon="game-icons:padlock" class="w-4 h-4 text-white/10" />
								<span class="slot-keybind dimmed">{{ index }}</span>
							</button>
						</TooltipTrigger>
						<TooltipContent
							v-if="getSlot(index)"
							side="top"
							:side-offset="8"
							class="!bg-[#0b0b13]/[.97] !text-white !border !border-[rgba(217,170,90,0.25)] backdrop-blur-md !rounded-lg !px-3.5 !py-3 max-w-[240px] z-[100] shadow-[0_0_20px_rgba(217,170,90,0.08)]">
							<!-- Ability name + tier -->
							<div class="flex items-center gap-2 mb-2">
								<span class="font-bold text-[13px] text-white/95" style="font-family: Georgia, 'Times New Roman', serif">
									{{ getSlot(index)!.name }}
								</span>
								<span
									class="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
									:style="{ background: `${tierColor(getSlot(index)!.tier)}20`, color: tierColor(getSlot(index)!.tier), border: `1px solid ${tierColor(getSlot(index)!.tier)}30` }">
									T{{ getSlot(index)!.tier }}
								</span>
							</div>
							<!-- Slot descriptions -->
							<div v-for="(slot, slotIdx) in getSlot(index)!.slots" :key="slotIdx" class="text-[11px] text-white/55 leading-relaxed italic">
								{{ slot.text }}
							</div>
							<!-- Keybind hint -->
							<div class="flex items-center gap-1 mt-2 pt-2" style="border-top: 1px solid rgba(217,170,90,0.1)">
								<span class="text-[10px] text-[#d9aa5a]/50 font-mono">Key: {{ index }}</span>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<!-- Ornate Divider -->
			<div class="action-divider">
				<span class="divider-line" />
				<span class="divider-diamond" />
				<span class="divider-line" />
			</div>

			<!-- Utility Buttons (Attack / Pass / Run) -->
			<div class="flex gap-1.5">
				<button
					@click="handleAttack"
					:disabled="!isPlayerTurn"
					:class="[
						'utility-btn utility-btn-attack',
						!isPlayerTurn && 'utility-btn-disabled',
					]"
					style="flex: 2">
					<Icon icon="game-icons:sword-clash" class="w-4 h-4" />
					Attack
				</button>
				<button
					@click="handlePass"
					:disabled="!isPlayerTurn"
					:class="[
						'utility-btn utility-btn-pass',
						!isPlayerTurn && 'utility-btn-disabled',
					]"
					style="flex: 1">
					<Icon icon="lucide:skip-forward" class="w-4 h-4" />
					Pass
				</button>
				<button
					@click="emitLeaveMatch"
					:disabled="isLeaving"
					class="utility-btn utility-btn-run"
					style="flex: 1">
					<Icon icon="lucide:log-out" class="w-4 h-4" />
					{{ isLeaving ? "..." : "Run" }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useMagicKeys } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { I_EquippedAbility } from "@/common/match.types";

const props = defineProps<{
	isLeaving: boolean;
	isPlayerTurn: boolean;
	abilities: I_EquippedAbility[];
}>();

const emit = defineEmits<{
	leaveMatch: [];
	action: [string];
	ability: [string];
}>();

const TIER_COLORS: Record<number, string> = {
	1: "rgba(160, 170, 190, 0.9)",
	2: "rgba(74, 222, 128, 0.9)",
	3: "rgba(96, 165, 250, 0.9)",
	4: "rgba(192, 132, 252, 0.9)",
};

function tierColor(tier: number): string {
	return TIER_COLORS[tier] ?? TIER_COLORS[1];
}

function getSlot(index: number): I_EquippedAbility | undefined {
	return props.abilities[index - 1];
}

const keys = useMagicKeys();

watchEffect(() => {
	if (!props.isPlayerTurn) return;

	for (let i = 1; i <= 8; i++) {
		const keyRef = keys[i.toString()];
		if (keyRef?.value) {
			const ability = getSlot(i);
			if (ability) {
				handleAbilityClick(ability);
			}
		}
	}
});

function handleAbilityClick(ability: I_EquippedAbility) {
	if (!props.isPlayerTurn) return;
	emit("ability", ability.id);
}

function handleAttack() {
	if (!props.isPlayerTurn) return;
	emit("action", "attack");
}

function handlePass() {
	if (!props.isPlayerTurn) return;
	emit("action", "pass");
}

function emitLeaveMatch() {
	emit("leaveMatch");
}
</script>

<style scoped>
/* ═══════════════════════════════════════════
   GRIMOIRE ACTION BAR (embedded)
   ═══════════════════════════════════════════ */

.action-bar-inner {
	--accent: #d9aa5a;
	--accent-60: rgba(217, 170, 90, 0.6);
	--accent-40: rgba(217, 170, 90, 0.4);
	--accent-25: rgba(217, 170, 90, 0.25);
	--accent-15: rgba(217, 170, 90, 0.15);
	--accent-08: rgba(217, 170, 90, 0.08);
}

.bar-body {
	position: relative;
	z-index: 3;
	padding: 10px 12px;
	display: flex;
	flex-direction: column;
	gap: 0;
}

/* ═══════════════════════════════════════════
   UNIFIED ABILITY SLOTS — equipped & empty share base
   ═══════════════════════════════════════════ */

.ability-slot {
	position: relative;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
	min-height: 48px;
	transition: all 150ms ease;
	background: rgba(11, 11, 19, 0.6);
	border: 1px dashed rgba(217, 170, 90, 0.12);
}

/* Equipped slot overrides — subtle tier accent, slightly brighter */
.ability-slot-active {
	border-style: solid;
	border-color: var(--accent-25);
	background: rgba(20, 20, 35, 0.7);
	color: rgba(255, 255, 255, 0.85);
	cursor: pointer;
}

.ability-slot-active:hover {
	background: rgba(217, 170, 90, 0.08);
	border-color: var(--accent-40);
	box-shadow: 0 0 14px var(--accent-08);
	transform: translateY(-2px);
}

.ability-slot-active:active {
	transform: translateY(1px) scale(0.96);
}

.ability-slot-disabled {
	color: rgba(255, 255, 255, 0.25);
	cursor: not-allowed;
	opacity: 0.5;
}

/* Empty/locked slots */
.empty-slot {
	cursor: not-allowed;
}

/* Tier accent line at top of equipped slots */
.slot-tier-accent {
	position: absolute;
	top: 0;
	left: 6px;
	right: 6px;
	height: 2px;
	border-radius: 999px;
}

/* Keybind number */
.slot-keybind {
	position: absolute;
	bottom: 2px;
	right: 5px;
	font-size: 9px;
	color: rgba(217, 170, 90, 0.25);
	font-family: ui-monospace, monospace;
	font-weight: 700;
}

.slot-keybind.dimmed {
	color: rgba(255, 255, 255, 0.1);
}

/* ═══════════════════════════════════════════
   ORNATE DIVIDER
   ═══════════════════════════════════════════ */

.action-divider {
	display: flex;
	align-items: center;
	gap: 0;
	padding: 6px 4px;
}

.divider-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(to right, transparent, var(--accent-25));
}

.divider-line:last-child {
	background: linear-gradient(to left, transparent, var(--accent-25));
}

.divider-diamond {
	width: 6px;
	height: 6px;
	transform: rotate(45deg);
	border: 1px solid var(--accent-40);
	background: var(--accent-08);
	flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   UTILITY BUTTONS
   ═══════════════════════════════════════════ */

.utility-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 8px 12px;
	border-radius: 8px;
	font-weight: 600;
	font-size: 0.85rem;
	transition: all 150ms ease;
	min-height: 38px;
	border: 1px solid;
}

.utility-btn-attack {
	background: linear-gradient(180deg, rgba(0, 100, 140, 0.5) 0%, rgba(0, 70, 110, 0.6) 100%);
	border-color: rgba(34, 211, 238, 0.25);
	color: rgba(200, 240, 255, 0.95);
}

.utility-btn-attack:hover:not(:disabled) {
	background: linear-gradient(180deg, rgba(0, 130, 180, 0.6) 0%, rgba(0, 100, 150, 0.65) 100%);
	border-color: rgba(34, 211, 238, 0.45);
	box-shadow: 0 0 14px rgba(34, 211, 238, 0.15);
}

.utility-btn-attack:active:not(:disabled) {
	transform: scale(0.97);
}

.utility-btn-pass {
	background: linear-gradient(180deg, rgba(40, 40, 55, 0.8) 0%, rgba(25, 25, 40, 0.9) 100%);
	border-color: var(--accent-25);
	color: rgba(255, 255, 255, 0.75);
}

.utility-btn-pass:hover:not(:disabled) {
	background: linear-gradient(180deg, rgba(50, 50, 65, 0.9) 0%, rgba(35, 35, 50, 0.95) 100%);
	border-color: var(--accent-40);
}

.utility-btn-run {
	background: linear-gradient(180deg, rgba(120, 30, 30, 0.7) 0%, rgba(90, 20, 20, 0.8) 100%);
	border-color: rgba(255, 60, 60, 0.2);
	color: rgba(255, 255, 255, 0.8);
}

.utility-btn-run:hover:not(:disabled) {
	background: linear-gradient(180deg, rgba(150, 40, 40, 0.8) 0%, rgba(110, 30, 30, 0.9) 100%);
	border-color: rgba(255, 60, 60, 0.35);
	box-shadow: 0 0 10px rgba(255, 60, 60, 0.15);
}

.utility-btn-disabled,
.utility-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}
</style>
