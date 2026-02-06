<template>
	<div class="h-full flex flex-col overflow-hidden">
		<!-- Header with New Button -->
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-medium text-muted-foreground">{{ store.affixes.length }} affixes</span>
			<Button size="sm" @click="handleCreate" :disabled="store.hasUnsavedChanges">
				<Icon icon="radix-icons:plus" class="h-4 w-4 mr-1" />
				New
			</Button>
		</div>

		<!-- Search -->
		<div class="relative mb-3">
			<Icon icon="radix-icons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input v-model="store.searchQuery" placeholder="Search by hash..." class="pl-9" />
		</div>

		<!-- List -->
		<div class="flex-1 overflow-y-auto border rounded-lg bg-muted/10 overscroll-contain" @wheel.stop>
			<div v-if="store.isLoading" class="p-4 text-center text-muted-foreground text-sm">Loading...</div>
			<div v-else-if="store.filteredAffixes.length === 0" class="p-4 text-center text-muted-foreground text-sm">
				{{ store.searchQuery ? "No matches found" : "No affixes yet" }}
			</div>
			<template v-else>
				<div
					v-for="affix in store.filteredAffixes"
					:key="affix._id"
					class="px-3 py-2.5 border-b last:border-b-0 cursor-pointer transition-all"
					:class="[
						isSelected(affix) ? 'border-l-2 border-l-primary bg-primary/5' : 'hover:bg-muted/30',
						store.hasUnsavedChanges && !isSelected(affix) ? 'opacity-50' : '',
					]"
					@click="handleSelect(affix)">
					<div class="flex items-center justify-between">
						<span class="font-medium text-sm font-mono truncate">{{ affix.hash }}</span>
						<span :class="['text-xs font-semibold', tierColorClass(affix.tier)]">T{{ affix.tier }}</span>
					</div>
					<div class="flex gap-2 mt-0.5 flex-wrap items-center">
						<span class="text-[10px] text-muted-foreground">W: {{ affix.weight }}</span>
						<span v-if="affix.definition" class="text-[10px] text-green-500">Compiled</span>
						<span v-else class="text-[10px] text-amber-500">No definition</span>
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
import { useAffixesStore } from "@/stores/affixes.store";
import type { AffixModel } from "@/common/affix.types";

const store = useAffixesStore();

const emit = defineEmits<{
	"unsaved-warning": [];
}>();

function isSelected(affix: AffixModel): boolean {
	return store.selectedId === affix._id;
}

function tierColorClass(tier: number): string {
	switch (tier) {
		case 1:
			return "text-zinc-400";
		case 2:
			return "text-green-500";
		case 3:
			return "text-blue-500";
		case 4:
			return "text-purple-500";
		default:
			return "text-muted-foreground";
	}
}

function handleSelect(affix: AffixModel) {
	if (store.hasUnsavedChanges && store.selectedId !== affix._id) {
		emit("unsaved-warning");
		return;
	}
	store.selectAffix(affix._id);
}

function handleCreate() {
	if (store.hasUnsavedChanges) {
		emit("unsaved-warning");
		return;
	}
	store.createNewAffix();
}
</script>
