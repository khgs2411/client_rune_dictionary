<template>
	<div class="rule-card">
		<div class="flex items-center gap-3">
			<!-- Fragment Name -->
			<div class="flex-1">
				<Input
					v-model="localRule.name"
					placeholder="e.g. Flaming"
					class="h-8"
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
			<Label class="rule-label">Restricted Attributes</Label>
			<p class="rule-hint mb-1">Components that cannot be combined with this one</p>
			<div class="flex flex-wrap gap-1">
				<span
					v-for="id in localRule.restrictedNameIds"
					:key="id"
					class="rule-tag">
					{{ getAttributeName(id) }}
					<Icon
						icon="radix-icons:cross-2"
						class="ml-1 h-3 w-3 cursor-pointer tag-remove"
						@click="removeRestriction(id)" />
				</span>
				<Select @update:model-value="addRestriction">
					<SelectTrigger class="h-6 w-24 text-xs">
						<SelectValue placeholder="+ Add" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem
							v-for="attr in availableRestrictedAttributes"
							:key="attr.attribute_id"
							:value="attr.attribute_id.toString()">
							{{ attr.name }}
						</SelectItem>
					</SelectContent>
				</Select>
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Local copy for editing
const localRule = ref<I_TieredNameComponent>({ ...props.rule });

// Watch for external changes
watch(
	() => props.rule,
	(newRule) => {
		localRule.value = { ...newRule };
	},
	{ deep: true }
);

// Weight needs to be an array for Slider component
const weightArray = computed({
	get: () => [localRule.value.weight],
	set: (val: number[]) => {
		localRule.value.weight = val[0];
	},
});

const availableRestrictedAttributes = computed(() => {
	return props.availableAttributes.filter((attr) => !localRule.value.restrictedNameIds.includes(attr.attribute_id));
});

function getAttributeName(id: number): string {
	const attr = props.availableAttributes.find((a) => a.attribute_id === id);
	return attr?.name ?? `ID: ${id}`;
}

function setPosition(position: "PREFIX" | "SUFFIX") {
	localRule.value.position = position as E_NamePosition;
	emitUpdate();
}

function onWeightChange(val: number[]) {
	localRule.value.weight = val[0];
	emitUpdate();
}

function addRestriction(value: string) {
	const id = parseInt(value, 10);
	if (!isNaN(id) && !localRule.value.restrictedNameIds.includes(id)) {
		localRule.value.restrictedNameIds = [...localRule.value.restrictedNameIds, id];
		emitUpdate();
	}
}

function removeRestriction(id: number) {
	localRule.value.restrictedNameIds = localRule.value.restrictedNameIds.filter((r) => r !== id);
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
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.03);
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.pos-toggle {
	display: flex;
	border-radius: 6px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.pos-btn {
	padding: 4px 12px;
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.4);
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
	color: #f87171;
	cursor: pointer;
	transition: background 0.15s ease;
}

.rule-delete:hover {
	background: rgba(248, 113, 113, 0.1);
}

.rule-label {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.4);
}

.rule-value {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.3);
	font-family: monospace;
}

.rule-hint {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.2);
}

.rule-tag {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 99px;
	font-size: 0.72rem;
	background: rgba(155, 126, 216, 0.1);
	color: rgba(255, 255, 255, 0.6);
	border: 1px solid rgba(155, 126, 216, 0.2);
}

.tag-remove:hover {
	color: #f87171;
}
</style>
