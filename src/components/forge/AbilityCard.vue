<template>
	<div class="ability-card relative w-64 rounded-lg overflow-hidden" :style="{ '--element-color': elementColor }">
		<!-- Card Border/Frame -->
		<div class="absolute inset-0 rounded-lg border-2 pointer-events-none" :style="{ borderColor: elementColor }" />

		<!-- Glow Effect -->
		<div class="absolute inset-0 rounded-lg opacity-30" :style="{ boxShadow: `inset 0 0 30px ${elementColor}` }" />

		<!-- Card Content -->
		<div class="relative bg-card/95 backdrop-blur p-4 flex flex-col gap-3">
			<!-- Art Area (Gradient Placeholder) -->
			<div
				class="h-28 rounded-md flex items-center justify-center"
				:style="{ background: `linear-gradient(135deg, ${elementColor}40, ${elementColor}10)` }">
				<Icon :icon="elementIcon" class="h-16 w-16 opacity-60" :style="{ color: elementColor }" />
			</div>

			<!-- Name Banner -->
			<div class="text-center">
				<h3 class="font-bold text-lg tracking-wide">{{ ability.name }}</h3>
			</div>

			<!-- Description Area -->
			<div class="min-h-16 p-2 bg-muted/50 rounded text-sm text-center text-muted-foreground">
				{{ primarySlotText || "No description available" }}
			</div>

			<!-- Tier Badge -->
			<div v-if="showTier" class="absolute top-2 right-2">
				<span
					class="px-2 py-0.5 text-xs font-semibold rounded-full"
					:style="{ backgroundColor: `${elementColor}30`, color: elementColor }">
					Tier {{ ability.tier }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import type { AbilityModel } from "@/common/ability.types";

interface Props {
	ability: AbilityModel;
	showTier?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showTier: true,
});

const primarySlotText = computed(() => {
	const slots = props.ability.slots;
	if (!slots) return null;

	// Get the first slot (usually slot 1)
	const slotKeys = Object.keys(slots).sort();
	if (slotKeys.length === 0) return null;

	return slots[Number(slotKeys[0])]?.text ?? null;
});

// Extract element from ability name or description for color/icon
const inferredElement = computed(() => {
	const name = props.ability.name.toLowerCase();
	const desc = (primarySlotText.value || "").toLowerCase();
	const combined = `${name} ${desc}`;

	if (combined.includes("fire") || combined.includes("flame") || combined.includes("burn")) return "fire";
	if (combined.includes("frost") || combined.includes("ice") || combined.includes("freeze")) return "frost";
	if (combined.includes("water") || combined.includes("aqua") || combined.includes("hydro")) return "water";
	if (combined.includes("earth") || combined.includes("rock") || combined.includes("stone")) return "earth";
	if (combined.includes("wind") || combined.includes("air") || combined.includes("gust")) return "wind";
	if (combined.includes("light") || combined.includes("holy") || combined.includes("radiant")) return "light";
	if (combined.includes("shadow") || combined.includes("dark") || combined.includes("void")) return "shadow";
	if (combined.includes("arcane") || combined.includes("magic") || combined.includes("mystic")) return "arcane";
	if (combined.includes("lightning") || combined.includes("thunder") || combined.includes("shock")) return "lightning";

	return "arcane"; // Default fallback
});

const elementColor = computed(() => {
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
	};
	return colorMap[inferredElement.value] || "#6b7280";
});

const elementIcon = computed(() => {
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
	};
	return iconMap[inferredElement.value] || "game-icons:magic-swirl";
});
</script>
