<template>
	<div class="action-bar-wrapper relative">
		<!-- Panel background -->
		<div class="absolute inset-0 rounded-xl action-panel-bg" />
		<div class="absolute inset-0 rounded-xl action-panel-border" />

		<div class="relative z-10 p-3 space-y-2.5">
			<!-- 8-Slot Action Bar -->
			<div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
				<TooltipProvider>
					<Tooltip v-for="slot in actionSlots" :key="slot.id">
						<TooltipTrigger as-child>
							<button
								@click="handleActionClick(slot)"
								:disabled="!isPlayerTurn"
								:class="[
									'action-slot relative aspect-square rounded-lg flex items-center justify-center p-1 min-h-[44px] transition-all duration-150',
									isPlayerTurn ? 'action-slot-active' : 'action-slot-disabled',
									slot.isActive && 'ring-2 ring-cyan-400',
								]">
								<Icon :icon="slot.icon" class="w-6 h-6 relative z-10" />
								<!-- Keybind indicator -->
								<span class="absolute bottom-0.5 right-1 text-[9px] text-white/30 font-mono font-bold">
									{{ slot.keybind }}
								</span>
								<!-- Active glow underline -->
								<div v-if="isPlayerTurn" class="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-cyan-400/30" />
							</button>
						</TooltipTrigger>
						<TooltipContent side="top" class="action-tooltip">
							<p class="font-bold text-white">{{ slot.name }}</p>
							<p class="text-xs text-white/60">{{ slot.description }}</p>
							<p class="text-[10px] text-cyan-400/80 mt-1 font-mono">Key: {{ slot.keybind }}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<!-- Utility Buttons (Run / Pass) -->
			<div class="flex gap-2">
				<button
					@click="handlePass"
					:disabled="!isPlayerTurn"
					:class="[
						'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-150 min-h-[40px] flex items-center justify-center gap-1.5',
						isPlayerTurn ? 'utility-btn-pass' : 'utility-btn-disabled',
					]">
					<Icon icon="lucide:skip-forward" class="w-4 h-4" />
					Pass
				</button>
				<button
					@click="emitLeaveMatch"
					:disabled="isLeaving"
					class="flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-150 min-h-[40px] flex items-center justify-center gap-1.5 utility-btn-run">
					<Icon icon="lucide:log-out" class="w-4 h-4" />
					{{ isLeaving ? "Leaving..." : "Run" }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useMagicKeys } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface ActionSlot {
	id: number;
	name: string;
	description: string;
	icon: string;
	keybind: string;
	isActive: boolean;
	actionType: string;
}

const props = defineProps<{
	isLeaving: boolean;
	isPlayerTurn: boolean;
}>();

const emit = defineEmits<{
	leaveMatch: [];
	action: [string];
}>();

const actionSlots = ref<ActionSlot[]>([
	{ id: 1, name: "Attack", description: "Basic physical attack", icon: "game-icons:sword-clash", keybind: "1", isActive: false, actionType: "attack" },
	{ id: 2, name: "Defend", description: "Reduce incoming damage", icon: "game-icons:shield", keybind: "2", isActive: false, actionType: "defend" },
	{ id: 3, name: "Fire", description: "Deal fire damage", icon: "game-icons:flame", keybind: "3", isActive: false, actionType: "fire" },
	{ id: 4, name: "Ice", description: "Deal ice damage", icon: "game-icons:frozen-orb", keybind: "4", isActive: false, actionType: "ice" },
	{ id: 5, name: "Heal", description: "Restore HP", icon: "game-icons:healing", keybind: "5", isActive: false, actionType: "heal" },
	{ id: 6, name: "Buff", description: "Increase stats", icon: "game-icons:biceps", keybind: "6", isActive: false, actionType: "buff" },
	{ id: 7, name: "Item", description: "Use an item", icon: "game-icons:potion-ball", keybind: "7", isActive: false, actionType: "item" },
	{ id: 8, name: "Special", description: "Ultimate ability", icon: "game-icons:star-swirl", keybind: "8", isActive: false, actionType: "special" },
]);

const keys = useMagicKeys();

watchEffect(() => {
	if (!props.isPlayerTurn) return;

	for (let i = 1; i <= 8; i++) {
		const keyRef = keys[i.toString()];
		if (keyRef?.value) {
			const slot = actionSlots.value[i - 1];
			if (slot) {
				handleActionClick(slot);
			}
		}
	}
});

function handleActionClick(slot: ActionSlot) {
	if (!props.isPlayerTurn) return;
	emit("action", slot.actionType);
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

/* Action slots */
.action-slot {
	background: linear-gradient(180deg, rgba(30, 40, 60, 0.8) 0%, rgba(20, 28, 45, 0.9) 100%);
	border: 1px solid rgba(255, 255, 255, 0.06);
}

.action-slot-active {
	color: rgba(255, 255, 255, 0.9);
	cursor: pointer;
}

.action-slot-active:hover {
	background: linear-gradient(180deg, rgba(0, 180, 230, 0.2) 0%, rgba(0, 140, 200, 0.15) 100%);
	border-color: rgba(0, 200, 255, 0.3);
	box-shadow: 0 0 12px rgba(0, 200, 255, 0.15);
	transform: translateY(-1px);
}

.action-slot-active:active {
	transform: translateY(1px) scale(0.96);
	box-shadow: 0 0 6px rgba(0, 200, 255, 0.1);
}

.action-slot-disabled {
	color: rgba(255, 255, 255, 0.2);
	cursor: not-allowed;
	opacity: 0.5;
}

/* Tooltip styling */
.action-tooltip {
	background: rgba(10, 15, 30, 0.95) !important;
	border: 1px solid rgba(0, 200, 255, 0.15) !important;
	backdrop-filter: blur(8px);
}

/* Utility buttons */
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

.utility-btn-disabled {
	background: rgba(20, 25, 40, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.04);
	color: rgba(255, 255, 255, 0.2);
	cursor: not-allowed;
}
</style>
