<template>
	<div class="h-full flex flex-col overflow-hidden">
		<!-- Header with New Button -->
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-medium text-muted-foreground">{{ store.attributes.length }} attributes</span>
			<Button size="sm" @click="handleCreate" :disabled="store.hasUnsavedChanges">
				<Icon icon="radix-icons:plus" class="h-4 w-4 mr-1" />
				New
			</Button>
		</div>

		<!-- Search -->
		<div class="relative mb-3">
			<Icon icon="radix-icons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input v-model="store.searchQuery" placeholder="Search attributes..." class="pl-9" />
		</div>

		<!-- List - this is the scrollable part -->
		<div class="flex-1 overflow-y-auto border rounded-lg bg-muted/10 overscroll-contain" @wheel.stop>
			<div v-if="store.isLoading" class="p-4 text-center text-muted-foreground text-sm">Loading...</div>
			<div v-else-if="store.filteredAttributes.length === 0" class="p-4 text-center text-muted-foreground text-sm">
				{{ store.searchQuery ? "No matches found" : "No attributes yet" }}
			</div>
			<template v-else>
				<div
					v-for="attr in store.filteredAttributes"
					:key="attr._id"
					class="px-3 py-2.5 border-b last:border-b-0 cursor-pointer transition-all"
					:class="[
						isSelected(attr) ? 'border-l-2 border-l-primary bg-primary/5' : 'hover:bg-muted/30',
						store.hasUnsavedChanges && !isSelected(attr) ? 'opacity-50' : '',
					]"
					@click="handleSelect(attr)">
					<div class="flex items-center justify-between">
						<span class="font-medium text-sm">{{ attr.name }}</span>
						<span class="text-xs text-muted-foreground tabular-nums">{{ attr.weight }}</span>
					</div>
					<div class="flex gap-2 mt-0.5 flex-wrap">
						<span v-if="attr.foundational === 1" class="text-[10px] text-yellow-500 font-medium">Foundational</span>
						<span v-if="attr.type === 1" class="text-[10px] text-amber-500 font-medium">Element</span>
						<span v-if="hasNameComponents(attr)" class="text-[10px] text-blue-400">
							{{ getNameComponentCount(attr) }} rules
						</span>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttributesStore } from "@/stores/attributes.store";
import type { AttributeModel } from "@/common/attribute.types";

const store = useAttributesStore();

const emit = defineEmits<{
	"unsaved-warning": [];
}>();

function isSelected(attr: AttributeModel): boolean {
	return store.selectedId === attr._id;
}

function hasNameComponents(attr: AttributeModel): boolean {
	if (!attr.name_components?.tiers) return false;
	const tiers = attr.name_components.tiers;
	return Object.values(tiers).some((tier) => tier && tier.length > 0);
}

function getNameComponentCount(attr: AttributeModel): number {
	if (!attr.name_components?.tiers) return 0;
	const tiers = attr.name_components.tiers;
	return Object.values(tiers).reduce((sum, tier) => sum + (tier?.length ?? 0), 0);
}

function handleSelect(attr: AttributeModel) {
	if (store.hasUnsavedChanges && store.selectedId !== attr._id) {
		emit("unsaved-warning");
		return;
	}
	store.selectAttribute(attr._id);
}

function handleCreate() {
	if (store.hasUnsavedChanges) {
		emit("unsaved-warning");
		return;
	}
	store.createNewAttribute();
}
</script>
