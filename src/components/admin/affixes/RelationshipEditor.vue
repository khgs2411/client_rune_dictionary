<template>
	<div class="space-y-1.5">
		<div class="flex items-center justify-between">
			<Label class="rel-label">{{ label }}</Label>
			<span class="rel-count">{{ modelValue.length }} selected</span>
		</div>

		<!-- Selected Items -->
		<div class="rel-container">
			<template v-if="modelValue.length > 0">
				<span
					v-for="id in modelValue"
					:key="id"
					class="rel-chip">
					{{ getItemName(id) }}
					<button type="button" class="chip-remove" @click="removeItem(id)">
						<Icon icon="radix-icons:cross-2" class="h-2.5 w-2.5" />
					</button>
				</span>
			</template>
			<span v-else class="rel-empty">{{ emptyText }}</span>
		</div>

		<!-- Select to Add -->
		<Select v-model="selectedItemToAdd" @update:model-value="handleSelectItem">
			<SelectTrigger class="rel-trigger">
				<SelectValue placeholder="Add..." />
			</SelectTrigger>
			<SelectContent>
				<SelectItem v-for="item in availableItems" :key="item.id" :value="String(item.id)" class="text-xs">
					{{ item.name }}
				</SelectItem>
				<div v-if="availableItems.length === 0" class="rel-no-items">
					No items available
				</div>
			</SelectContent>
		</Select>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const selectedItemToAdd = ref<string>("");

const availableItems = computed(() => props.items.filter((item) => !props.modelValue.includes(item.id)));

function getItemName(id: number): string {
	const item = props.items.find((i) => i.id === id);
	return item?.name ?? String(id);
}

function handleSelectItem(value: string) {
	if (!value) return;
	const id = Number(value);
	if (!props.modelValue.includes(id)) {
		emit("update:modelValue", [...props.modelValue, id]);
	}
	// Reset selection after adding
	selectedItemToAdd.value = "";
}

function removeItem(id: number) {
	emit(
		"update:modelValue",
		props.modelValue.filter((i) => i !== id)
	);
}
</script>

<style scoped>
.rel-label {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.4);
}

.rel-count {
	font-size: 0.6rem;
	color: rgba(255, 255, 255, 0.2);
}

.rel-container {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	min-height: 28px;
	padding: 6px;
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.03);
}

.rel-chip {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 2px 6px;
	font-size: 0.6rem;
	border-radius: 4px;
	background: rgba(155, 126, 216, 0.12);
	color: #9b7ed8;
}

.chip-remove:hover {
	color: #f87171;
}

.rel-empty {
	font-size: 0.6rem;
	color: rgba(255, 255, 255, 0.2);
}

.rel-trigger {
	height: 28px;
	font-size: 0.72rem;
}

.rel-no-items {
	padding: 8px;
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.3);
	text-align: center;
}
</style>
