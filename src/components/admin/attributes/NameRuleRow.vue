<template>
	<div class="p-3 border rounded-lg bg-background/50 space-y-3">
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
			<div class="flex rounded-lg border overflow-hidden">
				<button
					type="button"
					:class="[
						'px-3 py-1 text-xs transition-colors',
						localRule.position === 'PREFIX' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
					]"
					@click="setPosition('PREFIX')">
					Prefix
				</button>
				<button
					type="button"
					:class="[
						'px-3 py-1 text-xs transition-colors',
						localRule.position === 'SUFFIX' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
					]"
					@click="setPosition('SUFFIX')">
					Suffix
				</button>
			</div>

			<!-- Delete Button -->
			<Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" @click="$emit('delete')">
				<Icon icon="radix-icons:trash" class="h-4 w-4 text-destructive" />
			</Button>
		</div>

		<!-- Weight Slider -->
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<Label class="text-xs">Weight</Label>
				<span class="text-xs text-muted-foreground">{{ localRule.weight.toFixed(2) }}</span>
			</div>
			<Slider v-model="weightArray" :min="0.1" :max="1" :step="0.05" class="w-full" @update:model-value="onWeightChange" />
			<p class="text-xs text-muted-foreground">Lower = rarer (0.1 legendary, 1.0 common)</p>
		</div>

		<!-- Restricted Attributes -->
		<div class="space-y-1.5">
			<Label class="text-xs">Restricted Attributes</Label>
			<p class="text-xs text-muted-foreground mb-1">Components that cannot be combined with this one</p>
			<div class="flex flex-wrap gap-1">
				<span
					v-for="id in localRule.restrictedNameIds"
					:key="id"
					class="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-muted/50">
					{{ getAttributeName(id) }}
					<Icon
						icon="radix-icons:cross-2"
						class="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
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
import { Button } from "@/components/ui/button";
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
