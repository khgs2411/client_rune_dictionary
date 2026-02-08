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

		<!-- Restricted Attributes — reuses RelationshipEditor from affixes -->
		<RelationshipEditor
			label="Restricted"
			:model-value="localRule.restrictedNameIds"
			:items="attributeItems"
			:is-active="isPickerActive"
			empty-text="No restrictions"
			@update:model-value="onRestrictionsChange"
			@open-picker="handleOpenPicker" />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import RelationshipEditor from "../affixes/RelationshipEditor.vue";
import type { I_TieredNameComponent, AttributeModel } from "@/common/attribute.types";
import { E_NamePosition } from "@/common/attribute.types";

const props = defineProps<{
	rule: I_TieredNameComponent;
	tier: 1 | 2 | 3 | 4;
	availableAttributes: AttributeModel[];
	isPickerActive?: boolean;
}>();

const emit = defineEmits<{
	update: [updates: Partial<I_TieredNameComponent>];
	delete: [];
	"open-picker": [payload: { ruleKey: string; label: string; items: { id: number; name: string }[]; tier: 1 | 2 | 3 | 4; ruleId: number }];
}>();

const localRule = ref<I_TieredNameComponent>({ ...props.rule });

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

const attributeItems = computed(() =>
	props.availableAttributes.map((a) => ({ id: a.attribute_id, name: a.name }))
);

function setPosition(position: "PREFIX" | "SUFFIX") {
	localRule.value.position = position as E_NamePosition;
	emitUpdate();
}

function onWeightChange(val: number[]) {
	localRule.value.weight = val[0];
	emitUpdate();
}

function onRestrictionsChange(value: number[]) {
	localRule.value.restrictedNameIds = value;
	emitUpdate();
}

function handleOpenPicker() {
	emit("open-picker", {
		ruleKey: `rule-${props.tier}-${props.rule.id}`,
		label: `Restricted: ${localRule.value.name || "Rule"}`,
		items: attributeItems.value,
		tier: props.tier,
		ruleId: props.rule.id,
	});
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
	color: rgba(255, 255, 255, 0.3);
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
	color: rgba(255, 255, 255, 0.7);
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
	color: rgba(255, 255, 255, 0.85);
}

.rule-value {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.7);
	font-family: monospace;
}

.rule-hint {
	font-size: 0.68rem;
	color: rgba(255, 255, 255, 0.55);
}
</style>
