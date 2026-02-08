<template>
	<div class="h-full flex flex-col overflow-hidden">
		<!-- Header with New Button -->
		<div class="list-header">
			<span class="list-count">{{ store.attributes.length }} attributes</span>
			<button class="new-btn" :disabled="store.hasUnsavedChanges" @click="handleCreate">
				<Icon icon="radix-icons:plus" class="h-3.5 w-3.5" />
				New
			</button>
		</div>

		<!-- Search -->
		<div class="search-box">
			<Icon icon="radix-icons:magnifying-glass" class="search-icon" />
			<Input v-model="store.searchQuery" placeholder="Search attributes..." class="search-input" />
		</div>

		<!-- List -->
		<div class="list-container" @wheel.stop>
			<div v-if="store.isLoading" class="list-empty">Loading...</div>
			<div v-else-if="store.filteredAttributes.length === 0" class="list-empty">
				{{ store.searchQuery ? "No matches found" : "No attributes yet" }}
			</div>
			<template v-else>
				<div
					v-for="attr in store.filteredAttributes"
					:key="attr._id"
					class="list-item"
					:class="{
						'list-item--selected': isSelected(attr),
						'list-item--dimmed': store.hasUnsavedChanges && !isSelected(attr),
					}"
					@click="handleSelect(attr)">
					<div class="item-row">
						<span class="item-name">{{ attr.name }}</span>
						<span class="item-weight">{{ attr.weight }}</span>
					</div>
					<div class="item-badges">
						<span v-if="attr.foundational === 1" class="badge badge--yellow">Foundational</span>
						<span v-if="attr.type === 1" class="badge badge--amber">Element</span>
						<span v-if="hasNameComponents(attr)" class="badge badge--blue">
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

<style scoped>
.list-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
}

.list-count {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.3);
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
	color: rgba(255, 255, 255, 0.2);
	pointer-events: none;
}

.search-input {
	padding-left: 32px;
	background: rgba(255, 255, 255, 0.04);
	border-color: rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.8rem;
}

.search-input::placeholder {
	color: rgba(255, 255, 255, 0.2);
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
	color: rgba(255, 255, 255, 0.2);
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

.item-name {
	font-size: 0.82rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.85);
}

.item-weight {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.25);
	font-variant-numeric: tabular-nums;
}

.item-badges {
	display: flex;
	gap: 6px;
	margin-top: 3px;
	flex-wrap: wrap;
}

.badge {
	font-size: 0.6rem;
	font-weight: 600;
}

.badge--yellow {
	color: #eab308;
}

.badge--amber {
	color: #f59e0b;
}

.badge--blue {
	color: #60a5fa;
}
</style>
