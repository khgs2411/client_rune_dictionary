<template>
	<div class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 space-y-2">
		<!-- Utility Buttons (Run / Pass) -->
		<div class="flex gap-2">
			<button
				@click="handlePass"
				:disabled="!isPlayerTurn"
				class="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-1">
				<Icon icon="lucide:skip-forward" class="w-4 h-4" />
				Pass
			</button>
			<button
				@click="emitLeaveMatch"
				:disabled="isLeaving"
				class="flex-1 px-3 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-1">
				<Icon icon="lucide:log-out" class="w-4 h-4" />
				{{ isLeaving ? "Leaving..." : "Run" }}
			</button>
		</div>

		<!-- 8-Slot Action Bar -->
		<div class="grid grid-cols-4 sm:grid-cols-8 gap-1">
			<TooltipProvider>
				<Tooltip v-for="slot in actionSlots" :key="slot.id">
					<TooltipTrigger as-child>
						<button
							@click="handleActionClick(slot)"
							:disabled="!isPlayerTurn"
							:class="[
								'relative aspect-square bg-secondary hover:bg-secondary/80 rounded-md transition-colors flex items-center justify-center p-1 min-h-[44px]',
								slot.isActive && 'ring-2 ring-primary',
								!isPlayerTurn && 'opacity-50 cursor-not-allowed',
							]">
							<Icon :icon="slot.icon" class="w-6 h-6" />
							<!-- Keybind indicator -->
							<span class="absolute bottom-0.5 right-0.5 text-[10px] text-muted-foreground font-mono">
								{{ slot.keybind }}
							</span>
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">
						<p class="font-semibold">{{ slot.name }}</p>
						<p class="text-xs text-muted-foreground">{{ slot.description }}</p>
						<p class="text-xs text-muted-foreground mt-1">Hotkey: {{ slot.keybind }}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
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

// Keyboard shortcuts using VueUse
const keys = useMagicKeys();

// Watch for 1-8 keys
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
	if (!props.isPlayerTurn) {
		console.warn("[ActionBar] Cannot perform action - not your turn");
		return;
	}
	console.log(`[ActionBar] Action ${slot.actionType} clicked`);
	emit("action", slot.actionType);
}

function handlePass() {
	if (!props.isPlayerTurn) {
		console.warn("[ActionBar] Cannot pass - not your turn");
		return;
	}
	console.log("[ActionBar] Pass button clicked");
	emit("action", "pass");
}

function emitLeaveMatch() {
	emit("leaveMatch");
}
</script>
