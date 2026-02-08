<template>
	<div class="rule-card">
		<div class="flex items-center gap-3">
			<!-- Fragment Name -->
			<div class="flex-1">
				<Input
					v-model="localRule.name"
					placeholder="e.g. Flaming"
					class="dark-input"
					@update:model-value="emitUpdate" />
			</div>

			<!-- Position Toggle -->
			<div class="pos-toggle">
				<button
					type="button"
					:class="['pos-btn', localRule.position === 'PREFIX' && 'pos-btn--active']"
					@click="setPosition('PREFIX')">
					Prefix
				</button>
				<button
					type="button"
					:class="['pos-btn', localRule.position === 'SUFFIX' && 'pos-btn--active']"
					@click="setPosition('SUFFIX')">
					Suffix
				</button>
			</div>

			<!-- Delete Button -->
			<button type="button" class="rule-delete" @click="$emit('delete')">
				<Icon icon="radix-icons:trash" class="h-4 w-4" />
			</button>
		</div>

		<!-- Weight Slider -->
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<Label class="rule-label">Weight</Label>
				<span class="rule-value">{{ localRule.weight.toFixed(2) }}</span>
			</div>
			<Slider v-model="weightArray" :min="0.1" :max="1" :step="0.05" class="w-full" @update:model-value="onWeightChange" />
			<p class="rule-hint">Lower = rarer (0.1 legendary, 1.0 common)</p>
		</div>

		<!-- Restricted Attributes -->
		<div class="space-y-1.5">
			<div class="flex items-center justify-between">
				<Label class="rule-label">Restricted Attributes</Label>
				<button type="button" :class="['picker-toggle', pickerOpen && 'picker-toggle--active']" @click="pickerOpen = !pickerOpen">
					<Icon :icon="pickerOpen ? 'radix-icons:cross-2' : 'radix-icons:plus'" class="h-3 w-3" />
				</button>
			</div>

			<!-- Selected tags -->
			<div v-if="localRule.restrictedNameIds.length > 0" class="flex flex-wrap gap-1">
				<span v-for="id in localRule.restrictedNameIds" :key="id" class="rule-tag" :title="getAttributeName(id)">
					<span class="tag-text">{{ getAttributeName(id) }}</span>
					<Icon
						icon="radix-icons:cross-2"
						class="ml-1 h-3 w-3 cursor-pointer tag-remove"
						@click="toggleRestriction(id)" />
				</span>
			</div>
			<p v-else class="rule-hint">No restrictions</p>

			<!-- Inline picker -->
			<div v-if="pickerOpen" class="attr-picker">
				<button
					v-for="attr in availableAttributes"
					:key="attr.attribute_id"
					type="button"
					:class="['pick-chip', isRestricted(attr.attribute_id) && 'pick-chip--on']"
					@click="toggleRestriction(attr.attribute_id)">
					<span class="pick-dot" />
					{{ attr.name }}
				</button>
				<span v-if="availableAttributes.length === 0" class="rule-hint">No attributes available</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { I_TieredNameComponent, AttributeModel } from "@/common/attribute.types";
import { E_NamePosition } from "@/common/attribute.types";

const props = defineProps<{
	rule: I_TieredNameComponent;
	availableAttributes: AttributeModel[];
}>();

const emit = defineEmits<{
	update: [updates: Partial<I_TieredNameComponent>];
	delete: [];
}>();

const localRule = ref<I_TieredNameComponent>({ ...props.rule });
const pickerOpen = ref(false);

watch(
	() => props.rule,
	(newRule) => {
		localRule.value = { ...newRule };
	},
	{ deep: true }
);

const weightArray = computed({
	get: () => [localRule.value.weight],
	set: (val: number[]) => {
		localRule.value.weight = val[0];
	},
});

function getAttributeName(id: number): string {
	const attr = props.availableAttributes.find((a) => a.attribute_id === id);
	return attr?.name ?? `ID: ${id}`;
}

function isRestricted(id: number): boolean {
	return localRule.value.restrictedNameIds.includes(id);
}

function setPosition(position: "PREFIX" | "SUFFIX") {
	localRule.value.position = position as E_NamePosition;
	emitUpdate();
}

function onWeightChange(val: number[]) {
	localRule.value.weight = val[0];
	emitUpdate();
}

function toggleRestriction(id: number) {
	if (isRestricted(id)) {
		localRule.value.restrictedNameIds = localRule.value.restrictedNameIds.filter((r) => r !== id);
	} else {
		localRule.value.restrictedNameIds = [...localRule.value.restrictedNameIds, id];
	}
	emitUpdate();
}

function emitUpdate() {
	emit("update", {
		name: localRule.value.name,
		weight: localRule.value.weight,
		position: localRule.value.position,
		restrictedNameIds: localRule.value.restrictedNameIds,
	});
}
</script>

<style scoped>
.rule-card {
	padding: 12px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(255, 255, 255, 0.03);
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.dark-input {
	background: rgba(255, 255, 255, 0.04);
	border-color: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.85);
	height: 32px;
	font-size: 0.82rem;
}

.dark-input::placeholder {
	color: rgba(255, 255, 255, 0.2);
}

.pos-toggle {
	display: flex;
	border-radius: 6px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.pos-btn {
	padding: 4px 12px;
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.45);
	background: transparent;
	border: none;
	cursor: pointer;
	transition: all 0.15s ease;
}

.pos-btn:hover:not(.pos-btn--active) {
	background: rgba(255, 255, 255, 0.04);
}

.pos-btn--active {
	background: rgba(155, 126, 216, 0.25);
	color: rgba(255, 255, 255, 0.9);
}

.rule-delete {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 6px;
	border: none;
	background: transparent;
	color: rgba(248, 113, 113, 0.6);
	cursor: pointer;
	transition: all 0.15s ease;
}

.rule-delete:hover {
	background: rgba(248, 113, 113, 0.1);
	color: #f87171;
}

.rule-label {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.5);
}

.rule-value {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.35);
	font-family: monospace;
}

.rule-hint {
	font-size: 0.68rem;
	color: rgba(255, 255, 255, 0.25);
}

/* ── Tags ── */
.rule-tag {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 4px;
	font-size: 0.7rem;
	background: rgba(155, 126, 216, 0.12);
	color: #9b7ed8;
	max-width: 180px;
}

.tag-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-width: 0;
}

.tag-remove:hover {
	color: #f87171;
}

/* ── Picker toggle ── */
.picker-toggle {
	width: 22px;
	height: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 5px;
	border: 1px solid rgba(155, 126, 216, 0.2);
	background: rgba(155, 126, 216, 0.06);
	color: rgba(155, 126, 216, 0.6);
	cursor: pointer;
	transition: all 0.15s ease;
}

.picker-toggle:hover {
	border-color: rgba(155, 126, 216, 0.3);
	color: #9b7ed8;
}

.picker-toggle--active {
	background: rgba(155, 126, 216, 0.15);
	border-color: rgba(155, 126, 216, 0.35);
	color: #9b7ed8;
}

/* ── Inline picker ── */
.attr-picker {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	padding: 8px;
	border-radius: 6px;
	border: 1px solid rgba(155, 126, 216, 0.1);
	background: rgba(0, 0, 0, 0.12);
}

.pick-chip {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 3px 9px;
	font-size: 0.65rem;
	border-radius: 5px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: transparent;
	color: rgba(255, 255, 255, 0.35);
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
</style>
