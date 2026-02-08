<template>
	<div class="picker-panel" @wheel.stop>
		<!-- Header -->
		<div class="picker-header">
			<span class="picker-title">{{ label }}</span>
			<button type="button" class="picker-close" @click="emit('close')">
				<Icon icon="radix-icons:cross-2" class="h-3.5 w-3.5" />
			</button>
		</div>

		<!-- Search -->
		<div class="picker-search-wrap">
			<Icon icon="radix-icons:magnifying-glass" class="search-icon" />
			<input v-model="search" type="text" class="picker-search" placeholder="Filter..." />
		</div>

		<!-- Toggle list -->
		<div class="picker-list">
			<button
				v-for="item in filteredItems"
				:key="item.id"
				type="button"
				:class="['pick-row', isSelected(item.id) && 'pick-row--on']"
				@click="toggle(item.id)">
				<span class="pick-dot" />
				<span class="pick-name">{{ item.name }}</span>
			</button>

			<div v-if="filteredItems.length === 0" class="picker-none">No matches</div>
		</div>

		<!-- Footer summary -->
		<div class="picker-footer">
			<span class="picker-summary">{{ selectedCount }} selected</span>
		</div>
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
}>();

const emit = defineEmits<{
	"update:modelValue": [value: number[]];
	close: [];
}>();

const search = ref("");

const filteredItems = computed(() => {
	if (!search.value) return props.items;
	const q = search.value.toLowerCase();
	return props.items.filter((item) => item.name.toLowerCase().includes(q));
});

const selectedCount = computed(() => props.modelValue.length);

function isSelected(id: number): boolean {
	return props.modelValue.includes(id);
}

function toggle(id: number) {
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
.picker-panel {
	height: 100%;
	display: flex;
	flex-direction: column;
	border-radius: 10px;
	border: 1px solid rgba(155, 126, 216, 0.15);
	background: rgba(255, 255, 255, 0.02);
	overflow: hidden;
}

.picker-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 14px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	flex-shrink: 0;
}

.picker-title {
	font-size: 0.72rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.75);
}

.picker-close {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 5px;
	border: none;
	background: transparent;
	color: rgba(255, 255, 255, 0.3);
	cursor: pointer;
	transition: all 0.15s ease;
}

.picker-close:hover {
	background: rgba(255, 255, 255, 0.06);
	color: rgba(255, 255, 255, 0.6);
}

/* Search */
.picker-search-wrap {
	position: relative;
	padding: 8px 10px;
	flex-shrink: 0;
}

.search-icon {
	position: absolute;
	left: 18px;
	top: 50%;
	transform: translateY(-50%);
	width: 12px;
	height: 12px;
	color: rgba(255, 255, 255, 0.4);
	pointer-events: none;
}

.picker-search {
	width: 100%;
	padding: 5px 8px 5px 26px;
	font-size: 0.68rem;
	color: rgba(255, 255, 255, 0.9);
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 6px;
	outline: none;
	transition: border-color 0.15s ease;
}

.picker-search:focus {
	border-color: rgba(155, 126, 216, 0.3);
}

.picker-search::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

/* Toggle list */
.picker-list {
	flex: 1;
	overflow-y: auto;
	overscroll-behavior: contain;
	padding: 0 6px;
}

.pick-row {
	width: 100%;
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 7px 10px;
	margin-bottom: 2px;
	font-size: 0.72rem;
	border-radius: 5px;
	border: none;
	background: transparent;
	color: rgba(255, 255, 255, 0.7);
	cursor: pointer;
	transition: all 0.12s ease;
	text-align: left;
}

.pick-row:hover:not(.pick-row--on) {
	background: rgba(255, 255, 255, 0.03);
	color: rgba(255, 255, 255, 0.5);
}

.pick-row--on {
	background: rgba(155, 126, 216, 0.1);
	color: #b8a0e3;
}

.pick-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.08);
	flex-shrink: 0;
	margin-top: 5px;
	transition: all 0.12s ease;
}

.pick-row--on .pick-dot {
	background: #9b7ed8;
	box-shadow: 0 0 6px rgba(155, 126, 216, 0.5);
}

.pick-name {
	white-space: normal;
	word-break: break-word;
	line-height: 1.3;
}

.picker-none {
	font-size: 0.62rem;
	color: rgba(255, 255, 255, 0.45);
	text-align: center;
	padding: 16px 0;
}

/* Footer */
.picker-footer {
	padding: 8px 14px;
	border-top: 1px solid rgba(255, 255, 255, 0.06);
	flex-shrink: 0;
}

.picker-summary {
	font-size: 0.6rem;
	color: rgba(255, 255, 255, 0.6);
}
</style>
