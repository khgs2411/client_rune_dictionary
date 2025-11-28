<template>
	<!-- MMO-style Action Bar - Draggable, 8 slots + Run/Pass -->
	<div
		ref="container"
		:style="{
			left: `${x}px`,
			top: `${y}px`,
		}"
		class="fixed select-none pointer-events-auto">
		<div class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 space-y-2">
			<!-- Drag Handle -->
			<div ref="handle" class="flex items-center justify-center py-1 cursor-move hover:bg-muted/50 rounded transition-colors" title="Drag to reposition">
				<div class="flex gap-1">
					<div class="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
					<div class="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
					<div class="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
				</div>
			</div>

			<!-- Utility Buttons (Run / Pass) -->
			<div class="flex gap-2">
				<button
					@click="handlePass"
					:disabled="!props.isPlayerTurn"
					:class="[
						'flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md font-medium text-xs sm:text-sm transition-colors min-h-[44px] sm:min-h-0',
						!props.isPlayerTurn && 'opacity-50 cursor-not-allowed hover:bg-secondary',
					]">
					Pass
				</button>
				<button
					@click="emitLeaveMatch"
					:disabled="isLeaving"
					class="flex-1 px-3 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-medium text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0">
					{{ isLeaving ? "Leaving..." : "Run" }}
				</button>
			</div>

			<!-- 8-Slot Action Bar (Horizontal) -->
			<div class="grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-2">
				<button
					v-for="slot in actionSlots"
					:key="slot.id"
					@click="handleActionClick(slot.id)"
					:disabled="!props.isPlayerTurn"
					:class="[
						'relative aspect-square bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md font-medium text-xs sm:text-sm transition-colors flex flex-col items-center justify-center p-1 min-h-[44px] sm:min-h-0',
						slot.isActive && 'ring-2 ring-primary',
						!props.isPlayerTurn && 'opacity-50 cursor-not-allowed hover:bg-secondary',
					]"
					:title="`${slot.name} (Hotkey: ${slot.keybind})`">
					<!-- Action name -->
					<span class="text-[10px] sm:text-xs font-semibold truncate w-full text-center">
						{{ slot.name }}
					</span>

					<!-- Keybind indicator -->
					<span class="absolute bottom-0.5 right-0.5 text-[8px] sm:text-[10px] text-muted-foreground font-mono">
						{{ slot.keybind }}
					</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDraggable, useLocalStorage, watchDebounced } from "@vueuse/core";
import { onMounted, onUnmounted, ref } from "vue";

// Props
const props = defineProps<{
	isLeaving: boolean;
	isPlayerTurn: boolean;
}>();

// Emits
const emit = defineEmits<{
	leaveMatch: [];
}>();


const container = ref<HTMLElement | null>(null);
const handle = ref<HTMLElement | null>(null);

// Persist position in localStorage
// Default: bottom-right with 16px margin (matching original "bottom-4 right-4")
const initialX = window.innerWidth - 470;
const initialY = window.innerHeight - 160;
const defaultX = Math.max(16, initialX); // ~600px for 8-slot horizontal bar
const defaultY = Math.max(16, initialY); // ~160px total height with drag handle

const savedPosition = useLocalStorage("match-action-bar-position", {
	x: defaultX,
	y: defaultY,
});

// Draggable composable - x and y manage position
const { x, y } = useDraggable(container, {
	initialValue: { x: savedPosition.value.x, y: savedPosition.value.y },
	handle,
});

// Sync position to localStorage (debounced and rounded)
watchDebounced(
	[x, y],
	([newX, newY]) => {
		const roundedX = Math.round(newX);
		const roundedY = Math.round(newY);

		// Update refs to rounded values
		x.value = roundedX;
		y.value = roundedY;

		// Save to localStorage
		savedPosition.value = { x: roundedX, y: roundedY };
	},
	{ debounce: 300 },
);


const actionSlots = ref([
	{ id: 1, name: "Attack", keybind: "1", isActive: false },
	{ id: 2, name: "Attack", keybind: "2", isActive: false },
	{ id: 3, name: "Attack", keybind: "3", isActive: false },
	{ id: 4, name: "Attack", keybind: "4", isActive: false },
	{ id: 5, name: "Attack", keybind: "5", isActive: false },
	{ id: 6, name: "Attack", keybind: "6", isActive: false },
	{ id: 7, name: "Attack", keybind: "7", isActive: false },
	{ id: 8, name: "Attack", keybind: "8", isActive: false },
]);

function handleKeyPress(event: KeyboardEvent) {
	const key = event.key;

	// Check if key is 1-8
	if (key >= "1" && key <= "8") {
		// Turn validation happens inside handleActionClick
		const slotIndex = parseInt(key) - 1;
		const slot = actionSlots.value[slotIndex];

		if (slot) {
			event.preventDefault();
			handleActionClick(slot.id);
		}
	}
}

function handleActionClick(slotId: number) {
	if (!props.isPlayerTurn) {
		console.warn("[ActionBar] Cannot perform action - not your turn");
		return;
	}
	console.log(`[ActionBar] Action ${slotId} clicked`);
	// TODO: Send action to match server via WebSocket
}

function handlePass() {
	if (!props.isPlayerTurn) {
		console.warn("[ActionBar] Cannot pass - not your turn");
		return;
	}
	console.log("[ActionBar] Pass button clicked");
	// TODO: Send pass action to match server via WebSocket
}

function emitLeaveMatch() {
	emit("leaveMatch");
}


onMounted(() => {
	window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeyPress);
});
</script>
