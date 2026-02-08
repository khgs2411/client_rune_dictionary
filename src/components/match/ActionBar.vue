<template>
	<div class="action-bar-wrapper relative">
		<!-- Panel background -->
		<div class="absolute inset-0 rounded-xl action-panel-bg" />
		<div class="absolute inset-0 rounded-xl action-panel-border" />

		<div class="relative z-10 p-3 space-y-2">
			<!-- 8-Slot Ability Bar -->
			<div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
				<TooltipProvider v-for="index in 8" :key="index" :delay-duration="0" :skip-delay-duration="0">
					<Tooltip>
						<TooltipTrigger as-child>
							<span v-if="getSlot(index)" class="inline-block">
								<button
									@click="handleAbilityClick(getSlot(index)!)"
									:disabled="!isPlayerTurn"
									:class="[
										'ability-slot relative rounded-lg flex items-center justify-center p-1 min-h-[44px] transition-all duration-150',
										isPlayerTurn ? 'ability-slot-active' : 'ability-slot-disabled',
									]">
									<!-- Tier accent line -->
									<div class="absolute top-0 left-1 right-1 h-[2px] rounded-full" :style="{ background: tierColor(getSlot(index)!.tier) }" />
									<!-- Ability icon -->
									<Icon icon="game-icons:spell-book" class="w-6 h-6 relative z-10" />
									<!-- Keybind -->
									<span class="absolute bottom-0.5 right-1 text-[9px] text-white/25 font-mono font-bold">{{ index }}</span>
									<!-- Active glow underline -->
									<div v-if="isPlayerTurn" class="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-cyan-400/30" />
								</button>
							</span>
							<!-- Empty slot -->
							<button
								v-else
								disabled
								class="empty-slot relative rounded-lg flex items-center justify-center p-1 min-h-[44px]">
								<Icon icon="game-icons:padlock" class="w-4 h-4 text-white/10" />
								<span class="text-[9px] text-white/15 font-mono font-bold absolute bottom-0.5 right-1">{{ index }}</span>
							</button>
						</TooltipTrigger>
						<TooltipContent v-if="getSlot(index)" side="top" :side-offset="8" class="max-w-[220px] bg-[rgba(10,15,30,0.96)] text-white border-[rgba(0,200,255,0.15)] backdrop-blur-sm px-3 py-2.5">
							<div class="flex items-center gap-2 mb-1.5">
								<span class="font-bold text-white text-sm">{{ getSlot(index)!.name }}</span>
								<span
									class="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
									:style="{ background: `${tierColor(getSlot(index)!.tier)}25`, color: tierColor(getSlot(index)!.tier) }">
									T{{ getSlot(index)!.tier }}
								</span>
							</div>
							<div v-for="(slot, slotIdx) in getSlot(index)!.slots" :key="slotIdx" class="text-xs text-white/60 leading-relaxed">
								{{ slot.text }}
							</div>
							<p class="text-[10px] text-cyan-400/60 mt-1.5 font-mono">Key: {{ index }}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<!-- Utility Buttons (Attack / Pass / Run) -->
			<div class="flex gap-1.5">
				<button
					@click="handleAttack"
					:disabled="!isPlayerTurn"
					:class="[
						'flex-[2] px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-150 min-h-[38px] flex items-center justify-center gap-1.5',
						isPlayerTurn ? 'utility-btn-attack' : 'utility-btn-disabled',
					]">
					<Icon icon="game-icons:sword-clash" class="w-4 h-4" />
					Attack
				</button>
				<button
					@click="handlePass"
					:disabled="!isPlayerTurn"
					:class="[
						'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-150 min-h-[38px] flex items-center justify-center gap-1.5',
						isPlayerTurn ? 'utility-btn-pass' : 'utility-btn-disabled',
					]">
					<Icon icon="lucide:skip-forward" class="w-4 h-4" />
					Pass
				</button>
				<button
					@click="emitLeaveMatch"
					:disabled="isLeaving"
					class="flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-150 min-h-[38px] flex items-center justify-center gap-1.5 utility-btn-run">
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
/* Panel background */
.action-panel-bg {
	background: linear-gradient(180deg, rgba(10, 15, 30, 0.94) 0%, rgba(8, 12, 25, 0.96) 100%);
	backdrop-filter: blur(12px);
}

.action-panel-border {
	border: 1px solid rgba(0, 200, 255, 0.1);
	box-shadow:
		inset 0 1px 0 rgba(255, 255, 255, 0.04),
		0 -4px 20px rgba(0, 0, 0, 0.4);
}

/* Ability slots (equipped) */
.ability-slot {
	background: linear-gradient(180deg, rgba(30, 40, 60, 0.8) 0%, rgba(20, 28, 45, 0.9) 100%);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.ability-slot-active {
	color: rgba(255, 255, 255, 0.9);
	cursor: pointer;
}

.ability-slot-active:hover {
	background: linear-gradient(180deg, rgba(0, 180, 230, 0.15) 0%, rgba(0, 140, 200, 0.1) 100%);
	border-color: rgba(0, 200, 255, 0.3);
	box-shadow: 0 0 14px rgba(0, 200, 255, 0.12);
	transform: translateY(-2px);
}

.ability-slot-active:active {
	transform: translateY(1px) scale(0.96);
	box-shadow: 0 0 6px rgba(0, 200, 255, 0.08);
}

.ability-slot-disabled {
	color: rgba(255, 255, 255, 0.25);
	cursor: not-allowed;
	opacity: 0.5;
}

/* Empty / locked slots */
.empty-slot {
	background: rgba(12, 16, 28, 0.6);
	border: 1px dashed rgba(255, 255, 255, 0.06);
	cursor: not-allowed;
}

/* Utility buttons - Attack (primary) */
.utility-btn-attack {
	background: linear-gradient(180deg, rgba(0, 100, 140, 0.5) 0%, rgba(0, 70, 110, 0.6) 100%);
	border: 1px solid rgba(0, 200, 255, 0.2);
	color: rgba(200, 240, 255, 0.95);
}

.utility-btn-attack:hover {
	background: linear-gradient(180deg, rgba(0, 130, 180, 0.6) 0%, rgba(0, 100, 150, 0.65) 100%);
	border-color: rgba(0, 200, 255, 0.4);
	box-shadow: 0 0 12px rgba(0, 200, 255, 0.15);
}

.utility-btn-attack:active {
	transform: scale(0.97);
}

.utility-btn-attack:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

/* Utility buttons - Pass */
.utility-btn-pass {
	background: linear-gradient(180deg, rgba(40, 50, 70, 0.8) 0%, rgba(30, 38, 55, 0.9) 100%);
	border: 1px solid rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.8);
}

.utility-btn-pass:hover {
	background: linear-gradient(180deg, rgba(50, 60, 80, 0.9) 0%, rgba(40, 48, 65, 0.95) 100%);
	border-color: rgba(255, 255, 255, 0.15);
}

.utility-btn-pass:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

/* Utility buttons - Run */
.utility-btn-run {
	background: linear-gradient(180deg, rgba(120, 30, 30, 0.7) 0%, rgba(90, 20, 20, 0.8) 100%);
	border: 1px solid rgba(255, 60, 60, 0.2);
	color: rgba(255, 255, 255, 0.8);
}

.utility-btn-run:hover {
	background: linear-gradient(180deg, rgba(150, 40, 40, 0.8) 0%, rgba(110, 30, 30, 0.9) 100%);
	border-color: rgba(255, 60, 60, 0.35);
	box-shadow: 0 0 10px rgba(255, 60, 60, 0.15);
}

.utility-btn-run:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

/* Disabled utility fallback */
.utility-btn-disabled {
	background: rgba(20, 25, 40, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.04);
	color: rgba(255, 255, 255, 0.2);
	cursor: not-allowed;
}
</style>
