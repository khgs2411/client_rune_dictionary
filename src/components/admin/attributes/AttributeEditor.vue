<template>
	<div v-if="!store.draft" class="h-full flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/10">
		<div class="text-center">
			<Icon icon="game-icons:rune-stone" class="h-12 w-12 mx-auto mb-3 opacity-20" />
			<p class="text-sm">Select an attribute to edit</p>
			<p class="text-xs mt-1 opacity-70">or create a new one</p>
		</div>
	</div>

	<div v-else class="h-full flex flex-col border rounded-lg bg-muted/10 overflow-hidden">
		<!-- Header - fixed -->
		<div class="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-md bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
					<Icon icon="game-icons:rune-stone" class="h-4 w-4 text-white" />
				</div>
				<div>
					<h2 class="font-semibold">{{ store.draft.name || "New Attribute" }}</h2>
					<p v-if="store.draft._id" class="text-[10px] text-muted-foreground">ID: {{ store.draft.attribute_id }}</p>
					<p v-else class="text-[10px] text-muted-foreground">Creating new</p>
				</div>
			</div>

			<div v-if="store.hasUnsavedChanges" class="flex items-center gap-1 text-amber-500">
				<Icon icon="radix-icons:dot-filled" class="h-4 w-4" />
				<span class="text-xs">Unsaved</span>
			</div>
		</div>

		<!-- Error - fixed -->
		<div v-if="store.error" class="mx-4 mt-3 text-destructive text-sm bg-destructive/10 p-2 rounded">
			{{ store.error }}
		</div>

		<!-- Scrollable Content - this is the only scrolling part -->
		<div class="flex-1 overflow-y-auto p-4 space-y-5 overscroll-contain" @wheel.stop>
			<!-- Basic Info Section -->
			<section class="space-y-3">
				<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Basic Info</h3>

				<div class="grid gap-3">
					<!-- Name -->
					<div class="space-y-1">
						<Label for="attr-name" class="text-xs">Name</Label>
						<Input
							id="attr-name"
							:model-value="store.draft.name"
							placeholder="e.g. Fire, Physical"
							class="h-8"
							@update:model-value="(v) => store.updateDraft({ name: v as string })" />
					</div>

					<!-- Weight -->
					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<Label class="text-xs">Weight</Label>
							<span class="text-xs text-muted-foreground font-mono">{{ store.draft.weight.toFixed(2) }}</span>
						</div>
						<Slider
							:model-value="[store.draft.weight]"
							:min="0.1"
							:max="1"
							:step="0.05"
							class="w-full"
							@update:model-value="(v) => store.updateDraft({ weight: v[0] })" />
					</div>

					<!-- Toggles -->
					<div class="flex gap-4 pt-1">
						<label class="flex items-center gap-2 cursor-pointer">
							<Switch v-model="isElementType" />
							<span class="text-xs">Element</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<Switch v-model="isFoundational" />
							<span class="text-xs">Foundational</span>
						</label>
					</div>
				</div>
			</section>

			<!-- Naming Engine Section -->
			<section class="space-y-3">
				<div class="flex items-center justify-between">
					<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Naming Rules</h3>
					<Button size="sm" variant="outline" class="h-7 text-xs" @click="store.addNameRule(activeTier)">
						<Icon icon="radix-icons:plus" class="h-3 w-3 mr-1" />
						Add
					</Button>
				</div>

				<!-- Tier Tabs -->
				<TierTabControl v-model="activeTier" :get-rule-count="store.getRuleCountForTier" />

				<!-- Rules for Active Tier -->
				<div class="space-y-2">
					<div v-if="currentTierRules.length === 0" class="border rounded p-3 text-center text-muted-foreground text-xs">
						No rules for Tier {{ activeTier }}
					</div>

					<TransitionGroup name="list" tag="div" class="space-y-2">
						<NameRuleRow
							v-for="rule in currentTierRules"
							:key="rule.id"
							:rule="rule"
							:available-attributes="store.attributes"
							@update="(updates) => store.updateNameRule(activeTier, rule.id, updates)"
							@delete="store.deleteNameRule(activeTier, rule.id)" />
					</TransitionGroup>
				</div>
			</section>
		</div>

		<!-- Actions Footer - fixed -->
		<div class="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
			<Button
				v-if="store.draft._id"
				variant="ghost"
				size="sm"
				class="text-destructive hover:bg-destructive/10"
				@click="handleDelete"
				:disabled="store.isSaving">
				<Icon icon="radix-icons:trash" class="h-4 w-4 mr-1" />
				Delete
			</Button>
			<div v-else></div>

			<div class="flex gap-2">
				<Button variant="outline" size="sm" @click="store.discardChanges" :disabled="!store.hasUnsavedChanges || store.isSaving">
					Discard
				</Button>
				<Button size="sm" @click="store.saveAttribute" :disabled="!canSave || store.isSaving">
					{{ store.isSaving ? "Saving..." : store.draft._id ? "Save" : "Create" }}
				</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAttributesStore } from "@/stores/attributes.store";
import TierTabControl from "./TierTabControl.vue";
import NameRuleRow from "./NameRuleRow.vue";

const store = useAttributesStore();
const activeTier = ref<1 | 2 | 3 | 4>(1);

// Computed refs for Switch v-model (converts number <-> boolean)
const isElementType = computed({
	get: () => store.draft?.type === 1,
	set: (v: boolean) => store.updateDraft({ type: v ? 1 : 0 }),
});

const isFoundational = computed({
	get: () => store.draft?.foundational === 1,
	set: (v: boolean) => store.updateDraft({ foundational: v ? 1 : 0 }),
});

const currentTierRules = computed(() => {
	if (!store.draft?.name_components?.tiers) return [];
	return store.draft.name_components.tiers[activeTier.value] ?? [];
});

const canSave = computed(() => {
	if (!store.draft) return false;
	if (!store.draft.name.trim()) return false;
	return store.hasUnsavedChanges;
});

async function handleDelete() {
	if (!store.draft?._id) return;
	if (!confirm(`Delete "${store.draft.name}"?`)) return;
	await store.deleteAttribute(store.draft._id);
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
	transition: all 0.15s ease;
}

.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateX(-5px);
}
</style>
