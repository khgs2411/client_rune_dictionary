<template>
	<div class="space-y-1.5">
		<div class="flex items-center justify-between">
			<Label class="text-xs">{{ label }}</Label>
			<span class="text-[10px] text-muted-foreground">{{ modelValue.length }} selected</span>
		</div>

		<!-- Selected Items -->
		<div class="flex flex-wrap gap-1 min-h-[28px] p-1.5 border rounded bg-background/50">
			<template v-if="modelValue.length > 0">
				<span
					v-for="id in modelValue"
					:key="id"
					class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">
					{{ getItemName(id) }}
					<button type="button" class="hover:text-destructive" @click="removeItem(id)">
						<Icon icon="radix-icons:cross-2" class="h-2.5 w-2.5" />
					</button>
				</span>
			</template>
			<span v-else class="text-[10px] text-muted-foreground">{{ emptyText }}</span>
		</div>

		<!-- Select to Add -->
		<Select v-model="selectedItemToAdd" @update:model-value="handleSelectItem">
			<SelectTrigger class="h-7 text-xs">
				<SelectValue placeholder="Add..." />
			</SelectTrigger>
			<SelectContent>
				<SelectItem v-for="item in availableItems" :key="item.id" :value="String(item.id)" class="text-xs">
					{{ item.name }}
				</SelectItem>
				<div v-if="availableItems.length === 0" class="py-2 px-2 text-xs text-muted-foreground text-center">
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
