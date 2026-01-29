<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- Fundamental Runes Section -->
		<div class="space-y-3">
			<div class="flex items-center gap-2">
				<Icon icon="game-icons:gem-chain" class="h-4 w-4 text-amber-500" />
				<span class="text-sm font-semibold tracking-wider uppercase text-amber-500">Fundamental Runes</span>
				<span class="text-xs text-muted-foreground">(Required)</span>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<button
					v-for="attr in fundamentalAttributes"
					:key="attr.attribute_id"
					class="rune-button group relative p-3 rounded-lg border-2 transition-all duration-200"
					:class="[
						isSelected(attr.attribute_id)
							? 'border-amber-500 bg-amber-500/20 ring-2 ring-amber-500/30'
							: 'border-border hover:border-amber-500/50 hover:bg-amber-500/10',
						disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
					]"
					:disabled="disabled"
					@click="emit('toggle', attr.attribute_id)">
					<!-- Rune Icon -->
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
							:style="{
								backgroundColor: `${getAttributeColor(attr.name)}20`,
								borderColor: getAttributeColor(attr.name),
							}"
							:class="isSelected(attr.attribute_id) ? 'border-2' : 'border'">
							<Icon
								:icon="getAttributeIcon(attr.name)"
								class="h-5 w-5"
								:style="{ color: getAttributeColor(attr.name) }" />
						</div>
						<div class="flex-1 text-left">
							<p class="font-medium text-sm">{{ attr.name }}</p>
							<p class="text-xs text-muted-foreground">{{ getAttributeTypeLabel(attr.type) }}</p>
						</div>
					</div>

					<!-- Selection Indicator -->
					<div
						v-if="isSelected(attr.attribute_id)"
						class="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
						<Icon icon="radix-icons:check" class="h-3 w-3 text-white" />
					</div>
				</button>
			</div>
		</div>

		<!-- Other Runes Section -->
		<div v-if="otherAttributes.length > 0" class="space-y-3">
			<div class="flex items-center gap-2">
				<Icon icon="game-icons:magic-palm" class="h-4 w-4 text-purple-500" />
				<span class="text-sm font-semibold tracking-wider uppercase text-purple-500">Modifier Runes</span>
				<span class="text-xs text-muted-foreground">(Optional)</span>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<button
					v-for="attr in otherAttributes"
					:key="attr.attribute_id"
					class="rune-button group relative p-3 rounded-lg border-2 transition-all duration-200"
					:class="[
						isSelected(attr.attribute_id)
							? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/30'
							: 'border-border hover:border-purple-500/50 hover:bg-purple-500/10',
						disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
					]"
					:disabled="disabled"
					@click="emit('toggle', attr.attribute_id)">
					<!-- Rune Icon -->
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
							:style="{
								backgroundColor: `${getAttributeColor(attr.name)}20`,
								borderColor: getAttributeColor(attr.name),
							}"
							:class="isSelected(attr.attribute_id) ? 'border-2' : 'border'">
							<Icon
								:icon="getAttributeIcon(attr.name)"
								class="h-5 w-5"
								:style="{ color: getAttributeColor(attr.name) }" />
						</div>
						<div class="flex-1 text-left">
							<p class="font-medium text-sm">{{ attr.name }}</p>
							<p class="text-xs text-muted-foreground">{{ getAttributeTypeLabel(attr.type) }}</p>
						</div>
					</div>

					<!-- Selection Indicator -->
					<div
						v-if="isSelected(attr.attribute_id)"
						class="absolute top-1 right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
						<Icon icon="radix-icons:check" class="h-3 w-3 text-white" />
					</div>
				</button>
			</div>
		</div>

		<!-- Selection Summary -->
		<div v-if="selectedCount > 0" class="flex items-center justify-between text-sm border-t border-border pt-3">
			<span class="text-muted-foreground">
				{{ selectedCount }} rune{{ selectedCount === 1 ? "" : "s" }} selected
			</span>
			<button
				v-if="!disabled"
				class="text-xs text-muted-foreground hover:text-foreground transition-colors"
				@click="emit('clear')">
				Clear all
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import type { AttributeModel } from "@/common/attribute.types";
import { E_AttributeType, ATTRIBUTE_TYPE_LABELS } from "@/common/attribute.types";

interface Props {
	fundamentalAttributes: AttributeModel[];
	otherAttributes: AttributeModel[];
	selectedIds: number[];
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
});

const emit = defineEmits<{
	toggle: [id: number];
	clear: [];
}>();

const selectedCount = computed(() => props.selectedIds.length);

function isSelected(id: number): boolean {
	return props.selectedIds.includes(id);
}

function getAttributeColor(name: string): string {
	const colorMap: Record<string, string> = {
		fire: "#ef4444",
		frost: "#3b82f6",
		water: "#0ea5e9",
		earth: "#a16207",
		wind: "#22c55e",
		light: "#fbbf24",
		shadow: "#7c3aed",
		arcane: "#a855f7",
		lightning: "#facc15",
		physical: "#78716c",
		slash: "#dc2626",
		pierce: "#059669",
		blunt: "#78716c",
	};
	return colorMap[name.toLowerCase()] || "#6b7280";
}

function getAttributeIcon(name: string): string {
	const iconMap: Record<string, string> = {
		fire: "game-icons:fire",
		frost: "game-icons:snowflake-2",
		water: "game-icons:water-drop",
		earth: "game-icons:stone-block",
		wind: "game-icons:wind-slap",
		light: "game-icons:sun",
		shadow: "game-icons:evil-moon",
		arcane: "game-icons:magic-swirl",
		lightning: "game-icons:lightning-bolt",
		physical: "game-icons:sword-clash",
		slash: "game-icons:sword-wound",
		pierce: "game-icons:pierced-body",
		blunt: "game-icons:hammer-drop",
	};
	return iconMap[name.toLowerCase()] || "game-icons:fire-gem";
}

function getAttributeTypeLabel(type: number): string {
	return ATTRIBUTE_TYPE_LABELS[type as E_AttributeType] || "Unknown";
}
</script>
