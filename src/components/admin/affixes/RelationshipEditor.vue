<template>
	<div :class="['rel-editor', isActive && 'rel-editor--active']">
		<div class="rel-row">
			<span class="rel-label">{{ label }}</span>

			<div class="rel-chips">
				<template v-if="modelValue.length > 0">
					<span v-for="id in modelValue" :key="id" class="sel-chip" :title="getItemName(id)">
						<span class="sel-text">{{ getItemName(id) }}</span>
						<button type="button" class="sel-x" @click="removeItem(id)">
							<Icon icon="radix-icons:cross-2" class="h-2.5 w-2.5" />
						</button>
					</span>
				</template>
				<span v-else class="rel-empty">{{ emptyText }}</span>
			</div>

			<button type="button" :class="['rel-toggle', isActive && 'rel-toggle--active']" @click="emit('open-picker')">
				<Icon icon="radix-icons:pencil-1" class="h-3 w-3" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
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
	isActive?: boolean;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: number[]];
	"open-picker": [];
}>();

function getItemName(id: number): string {
	const item = props.items.find((i) => i.id === id);
	return item?.name ?? String(id);
}

function removeItem(id: number) {
	emit(
		"update:modelValue",
		props.modelValue.filter((i) => i !== id)
	);
}
</script>

<style scoped>
.rel-editor {
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(255, 255, 255, 0.03);
	transition: border-color 0.2s ease;
}

.rel-editor--active {
	border-color: rgba(155, 126, 216, 0.25);
	background: rgba(155, 126, 216, 0.04);
}

.rel-row {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	min-height: 36px;
}

.rel-label {
	font-size: 0.72rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.85);
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
	gap: 4px;
	padding: 2px 8px;
	font-size: 0.7rem;
	border-radius: 4px;
	background: rgba(155, 126, 216, 0.12);
	color: #9b7ed8;
	max-width: 260px;
	cursor: default;
}

.sel-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-width: 0;
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
	color: rgba(255, 255, 255, 0.55);
	font-style: italic;
}

.rel-toggle {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 5px;
	border: 1px solid rgba(155, 126, 216, 0.2);
	background: rgba(155, 126, 216, 0.06);
	color: rgba(155, 126, 216, 0.6);
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
</style>
