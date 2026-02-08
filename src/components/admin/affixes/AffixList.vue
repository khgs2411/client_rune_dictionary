<template>
	<div class="h-full flex flex-col overflow-hidden">
		<!-- Header with New Button -->
		<div class="list-header">
			<span class="list-count">{{ store.affixes.length }} affixes</span>
			<button class="new-btn" :disabled="store.hasUnsavedChanges" @click="handleCreate">
				<Icon icon="radix-icons:plus" class="h-3.5 w-3.5" />
				New
			</button>
		</div>

		<!-- Search -->
		<div class="search-box">
			<Icon icon="radix-icons:magnifying-glass" class="search-icon" />
			<Input v-model="store.searchQuery" placeholder="Search by hash..." class="search-input" />
		</div>

		<!-- List -->
		<div class="list-container" @wheel.stop>
			<div v-if="store.isLoading" class="list-empty">Loading...</div>
			<div v-else-if="store.filteredAffixes.length === 0" class="list-empty">
				{{ store.searchQuery ? "No matches found" : "No affixes yet" }}
			</div>
			<template v-else>
				<div
					v-for="affix in store.filteredAffixes"
					:key="affix._id"
					class="list-item"
					:class="{
						'list-item--selected': isSelected(affix),
						'list-item--dimmed': store.hasUnsavedChanges && !isSelected(affix),
					}"
					@click="handleSelect(affix)">
					<div class="item-row">
						<span class="item-hash">{{ affix.hash }}</span>
						<span :class="['item-tier', tierClass(affix.tier)]">T{{ affix.tier }}</span>
					</div>
					<div class="item-badges">
						<span class="badge badge--muted">W: {{ affix.weight }}</span>
						<span v-if="affix.definition" class="badge badge--green">Compiled</span>
						<span v-else class="badge badge--amber">No definition</span>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
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

function tierClass(tier: number): string {
	switch (tier) {
		case 1: return "tier-1";
		case 2: return "tier-2";
		case 3: return "tier-3";
		case 4: return "tier-4";
		default: return "";
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

<style scoped>
.list-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
}

.list-count {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
}

.new-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 5px 12px;
	font-size: 0.72rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.7);
	background: rgba(155, 126, 216, 0.15);
	border: 1px solid rgba(155, 126, 216, 0.3);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.new-btn:hover:not(:disabled) {
	background: rgba(155, 126, 216, 0.25);
	color: rgba(255, 255, 255, 0.9);
}

.new-btn:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

.search-box {
	position: relative;
	margin-bottom: 10px;
}

.search-icon {
	position: absolute;
	left: 10px;
	top: 50%;
	transform: translateY(-50%);
	width: 14px;
	height: 14px;
	color: rgba(255, 255, 255, 0.45);
	pointer-events: none;
}

.search-input {
	padding-left: 32px;
	background: rgba(255, 255, 255, 0.04);
	border-color: rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.8rem;
}

.search-input::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

.list-container {
	flex: 1;
	overflow-y: auto;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	overscroll-behavior: contain;
}

.list-empty {
	padding: 24px;
	text-align: center;
	font-size: 0.78rem;
	color: rgba(255, 255, 255, 0.5);
}

.list-item {
	padding: 10px 12px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	cursor: pointer;
	transition: all 0.15s ease;
	border-left: 2px solid transparent;
}

.list-item:last-child {
	border-bottom: none;
}

.list-item:hover:not(.list-item--selected) {
	background: rgba(255, 255, 255, 0.03);
}

.list-item--selected {
	border-left-color: #9b7ed8;
	background: rgba(155, 126, 216, 0.08);
}

.list-item--dimmed {
	opacity: 0.4;
}

.item-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.item-hash {
	font-size: 0.82rem;
	font-weight: 600;
	font-family: monospace;
	color: rgba(255, 255, 255, 0.85);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.item-tier {
	font-size: 0.7rem;
	font-weight: 700;
	flex-shrink: 0;
}

.tier-1 { color: #9ca3af; }
.tier-2 { color: #22c55e; }
.tier-3 { color: #3b82f6; }
.tier-4 { color: #a855f7; }

.item-badges {
	display: flex;
	gap: 6px;
	margin-top: 3px;
	flex-wrap: wrap;
	align-items: center;
}

.badge {
	font-size: 0.6rem;
	font-weight: 600;
}

.badge--muted {
	color: rgba(255, 255, 255, 0.5);
}

.badge--green {
	color: #22c55e;
}

.badge--amber {
	color: #f59e0b;
}
</style>
