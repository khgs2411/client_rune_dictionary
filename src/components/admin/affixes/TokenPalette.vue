<template>
	<div class="border rounded p-2 bg-background/50 space-y-2 max-h-48 overflow-y-auto">
		<div v-for="category in groupedTokens" :key="category.name" class="space-y-1">
			<div class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{{ category.name }}</div>
			<div class="flex flex-wrap gap-1">
				<button
					v-for="token in category.tokens"
					:key="token.key"
					type="button"
					:title="token.description"
					:class="[
						'px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors',
						getCategoryClass(token.category),
						token.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-80',
					]"
					:disabled="token.disabled"
					@click="!token.disabled && emit('insert', token.key)">
					{{ token.sign }}
				</button>
			</div>
		</div>

		<div v-if="store.contextTokens.length === 0" class="text-xs text-muted-foreground text-center py-2">Loading tokens...</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAffixesStore } from "@/stores/affixes.store";

const store = useAffixesStore();

const emit = defineEmits<{
	insert: [token: string];
}>();

const groupedTokens = computed(() => {
	const groups: Record<string, typeof store.contextTokens> = {};

	for (const token of store.contextTokens) {
		if (!groups[token.category]) {
			groups[token.category] = [];
		}
		groups[token.category].push(token);
	}

	// Order categories for better UX
	const categoryOrder = ["ACTION", "VALUE", "TIMING", "TYPE", "ATTRIBUTE", "MODIFIER", "CONDITION", "SEQUENCING", "PERCENTAGE", "EFFECT_TYPE", "REFERENCE", "DISPLAY", "DISABLED"];

	return categoryOrder
		.filter((cat) => groups[cat]?.length)
		.map((cat) => ({
			name: cat,
			tokens: groups[cat].sort((a, b) => a.priority - b.priority),
		}));
});

function getCategoryClass(category: string): string {
	switch (category) {
		case "ACTION":
			return "bg-red-500/20 text-red-400 border border-red-500/30";
		case "VALUE":
			return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
		case "TIMING":
			return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
		case "TYPE":
			return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
		case "ATTRIBUTE":
			return "bg-green-500/20 text-green-400 border border-green-500/30";
		case "MODIFIER":
			return "bg-pink-500/20 text-pink-400 border border-pink-500/30";
		case "CONDITION":
			return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
		case "SEQUENCING":
			return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
		case "PERCENTAGE":
			return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
		case "EFFECT_TYPE":
			return "bg-violet-500/20 text-violet-400 border border-violet-500/30";
		case "REFERENCE":
			return "bg-teal-500/20 text-teal-400 border border-teal-500/30";
		case "DISPLAY":
			return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
		case "DISABLED":
			return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
		default:
			return "bg-muted text-muted-foreground border border-border";
	}
}
</script>
