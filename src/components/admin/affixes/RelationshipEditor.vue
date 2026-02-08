<template>
	<div :class="['rel-editor', pickerOpen && 'rel-editor--open']">
		<!-- Compact row: label, chips, toggle button -->
		<div class="rel-row">
			<span class="rel-label">{{ label }}</span>

			<div class="rel-chips">
				<template v-if="modelValue.length > 0">
					<span v-for="id in modelValue" :key="id" class="sel-chip">
						{{ getItemName(id) }}
						<button type="button" class="sel-x" @click="toggleItem(id)">
							<Icon icon="radix-icons:cross-2" class="h-2.5 w-2.5" />
						</button>
					</span>
				</template>
				<span v-else class="rel-empty">{{ emptyText }}</span>
			</div>

			<button
				type="button"
				:class="['rel-toggle', pickerOpen && 'rel-toggle--active']"
				@click="pickerOpen = !pickerOpen">
				<Icon :icon="pickerOpen ? 'radix-icons:cross-2' : 'radix-icons:plus'" class="h-3 w-3" />
			</button>
		</div>

		<!-- Picker panel (expandable) -->
		<Transition name="picker">
			<div v-if="pickerOpen" class="picker-panel" @wheel.stop>
				<input
					v-if="items.length > 6"
					v-model="search"
					type="text"
					class="picker-search"
					placeholder="Filter..." />

				<div class="picker-grid" :style="{ overscrollBehavior: 'contain' }">
					<button
						v-for="item in filteredItems"
						:key="item.id"
						type="button"
						:class="['pick-chip', isSelected(item.id) && 'pick-chip--on']"
						@click="toggleItem(item.id)">
						<span class="pick-dot" />
						<span class="pick-name">{{ item.name }}</span>
					</button>
				</div>

				<div v-if="filteredItems.length === 0" class="picker-none">No matches</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";

interface Item {
	id: number;
	name: string;
}

const props = defineProps<{
	modelValue: number[];
	label: string;
	items: Item[];
	emptyText?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: number[]];
}>();

const pickerOpen = ref(false);
const search = ref("");

const filteredItems = computed(() => {
	if (!search.value) return props.items;
	const q = search.value.toLowerCase();
	return props.items.filter((item) => item.name.toLowerCase().includes(q));
});

function isSelected(id: number): boolean {
	return props.modelValue.includes(id);
}

function getItemName(id: number): string {
	const item = props.items.find((i) => i.id === id);
	return item?.name ?? String(id);
}

function toggleItem(id: number) {
	if (isSelected(id)) {
		emit(
			"update:modelValue",
			props.modelValue.filter((i) => i !== id)
		);
	} else {
		emit("update:modelValue", [...props.modelValue, id]);
	}
}
</script>

<style scoped>
.rel-editor {
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.05);
	background: rgba(255, 255, 255, 0.02);
	overflow: hidden;
	transition: border-color 0.2s ease;
}

.rel-editor--open {
	border-color: rgba(155, 126, 216, 0.2);
}

/* ── Compact row ── */
.rel-row {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	min-height: 36px;
}

.rel-label {
	font-size: 0.68rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.35);
	white-space: nowrap;
	flex-shrink: 0;
}

.rel-chips {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	align-items: center;
	min-width: 0;
}

.sel-chip {
	display: inline-flex;
	align-items: center;
	gap: 3px;
	padding: 1px 7px;
	font-size: 0.62rem;
	border-radius: 4px;
	background: rgba(155, 126, 216, 0.12);
	color: #9b7ed8;
	white-space: nowrap;
}

.sel-x {
	display: flex;
	align-items: center;
	border: none;
	background: none;
	padding: 0;
	color: rgba(155, 126, 216, 0.4);
	cursor: pointer;
	transition: color 0.1s;
}

.sel-x:hover {
	color: #f87171;
}

.rel-empty {
	font-size: 0.6rem;
	color: rgba(255, 255, 255, 0.12);
	font-style: italic;
}

/* ── Toggle button ── */
.rel-toggle {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 5px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: transparent;
	color: rgba(255, 255, 255, 0.3);
	cursor: pointer;
	transition: all 0.15s ease;
}

.rel-toggle:hover {
	border-color: rgba(155, 126, 216, 0.3);
	color: #9b7ed8;
}

.rel-toggle--active {
	background: rgba(155, 126, 216, 0.15);
	border-color: rgba(155, 126, 216, 0.35);
	color: #9b7ed8;
}

/* ── Picker panel ── */
.picker-panel {
	border-top: 1px solid rgba(155, 126, 216, 0.08);
	background: rgba(0, 0, 0, 0.12);
	padding: 8px 10px 10px;
}

.picker-search {
	width: 100%;
	padding: 4px 8px;
	font-size: 0.68rem;
	color: rgba(255, 255, 255, 0.7);
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 5px;
	outline: none;
	margin-bottom: 8px;
	transition: border-color 0.15s ease;
}

.picker-search:focus {
	border-color: rgba(155, 126, 216, 0.3);
}

.picker-search::placeholder {
	color: rgba(255, 255, 255, 0.15);
}

.picker-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	max-height: 140px;
	overflow-y: auto;
	overscroll-behavior: contain;
}

/* ── Toggle chips ── */
.pick-chip {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 3px 9px;
	font-size: 0.65rem;
	border-radius: 5px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: transparent;
	color: rgba(255, 255, 255, 0.3);
	cursor: pointer;
	transition: all 0.12s ease;
}

.pick-chip:hover:not(.pick-chip--on) {
	border-color: rgba(255, 255, 255, 0.12);
	color: rgba(255, 255, 255, 0.5);
}

.pick-chip--on {
	background: rgba(155, 126, 216, 0.15);
	border-color: rgba(155, 126, 216, 0.3);
	color: #b8a0e3;
}

.pick-dot {
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	flex-shrink: 0;
	transition: all 0.12s ease;
}

.pick-chip--on .pick-dot {
	background: #9b7ed8;
	box-shadow: 0 0 6px rgba(155, 126, 216, 0.5);
}

.pick-name {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 180px;
}

.picker-none {
	font-size: 0.62rem;
	color: rgba(255, 255, 255, 0.15);
	text-align: center;
	padding: 6px 0;
}

/* ── Transition ── */
.picker-enter-active {
	transition: all 0.2s ease-out;
}

.picker-leave-active {
	transition: all 0.15s ease-in;
}

.picker-enter-from,
.picker-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>
