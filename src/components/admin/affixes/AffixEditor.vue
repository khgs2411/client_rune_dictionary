<template>
	<div v-if="!store.draft" class="h-full flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/10">
		<div class="text-center">
			<Icon icon="game-icons:scroll-unfurled" class="h-12 w-12 mx-auto mb-3 opacity-20" />
			<p class="text-sm">Select an affix to edit</p>
			<p class="text-xs mt-1 opacity-70">or create a new one</p>
		</div>
	</div>

	<div v-else class="h-full flex flex-col border rounded-lg bg-muted/10 overflow-hidden">
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-md bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
					<Icon icon="game-icons:scroll-unfurled" class="h-4 w-4 text-white" />
				</div>
				<div class="flex-1 min-w-0">
					<Input
						:model-value="store.draft.hash"
						placeholder='e.g., "$DEAL$ $X$ $Y$ Damage"'
						class="h-7 font-mono text-sm max-w-[280px]"
						@update:model-value="(v) => store.updateDraft({ hash: v as string })" />
					<p v-if="store.draft._id" class="text-[10px] text-muted-foreground">ID: {{ store.draft.affix_id }}</p>
					<p v-else class="text-[10px] text-muted-foreground">Creating new</p>
				</div>
			</div>

			<div v-if="store.hasUnsavedChanges" class="flex items-center gap-1 text-amber-500">
				<Icon icon="radix-icons:dot-filled" class="h-4 w-4" />
				<span class="text-xs">Unsaved</span>
			</div>
		</div>

		<!-- Error -->
		<div v-if="store.error" class="mx-4 mt-3 text-destructive text-sm bg-destructive/10 p-2 rounded">
			{{ store.error }}
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto p-4 space-y-5 overscroll-contain" @wheel.stop>
			<!-- Basic Info Section -->
			<section class="space-y-3">
				<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Basic Info</h3>

				<div class="grid gap-3">
					<!-- Tier -->
					<div class="space-y-1">
						<Label class="text-xs">Tier</Label>
						<TierTabControl v-model="tierModel" :get-rule-count="() => 0" />
					</div>

					<!-- Weight -->
					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<Label class="text-xs">Weight</Label>
							<span class="text-xs text-muted-foreground font-mono">{{ store.draft.weight }}</span>
						</div>
						<Slider
							:model-value="[store.draft.weight]"
							:min="1"
							:max="200"
							:step="1"
							class="w-full"
							@update:model-value="(v) => store.updateDraft({ weight: v?.[0] })" />
					</div>

					<!-- Potency -->
					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<Label class="text-xs">Potency</Label>
							<span class="text-xs text-muted-foreground font-mono">{{ store.draft.potency.toFixed(1) }}</span>
						</div>
						<Slider
							:model-value="[store.draft.potency]"
							:min="0.1"
							:max="2"
							:step="0.1"
							class="w-full"
							@update:model-value="(v) => store.updateDraft({ potency: v?.[0] })" />
					</div>
				</div>
			</section>

			<!-- Attributes Section -->
			<section class="space-y-3">
				<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Attributes</h3>

				<RelationshipEditor
					label="Associated Attributes"
					:model-value="store.draft.attribute_ids"
					:items="attributeItems"
					empty-text="No attributes selected"
					@update:model-value="(v) => store.updateDraft({ attribute_ids: v })" />

				<RelationshipEditor
					label="Required Attributes"
					:model-value="store.draft.required_attribute_ids"
					:items="attributeItems"
					empty-text="No required attributes"
					@update:model-value="(v) => store.updateDraft({ required_attribute_ids: v })" />
			</section>

			<!-- Affix Relationships Section -->
			<section class="space-y-3">
				<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Affix Relationships</h3>

				<RelationshipEditor
					label="Blocked Affixes"
					:model-value="store.draft.blocked_affix_ids"
					:items="affixItems"
					empty-text="No blocked affixes"
					@update:model-value="(v) => store.updateDraft({ blocked_affix_ids: v })" />

				<RelationshipEditor
					label="Required Affixes"
					:model-value="store.draft.require_affix_ids"
					:items="affixItems"
					empty-text="No required affixes"
					@update:model-value="(v) => store.updateDraft({ require_affix_ids: v })" />
			</section>

			<!-- Definition Section -->
			<section class="space-y-3">
				<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Context Compiler</h3>
				<DefinitionEditor />
			</section>
		</div>

		<!-- Actions Footer -->
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
				<Button size="sm" @click="store.saveAffix" :disabled="!canSave || store.isSaving">
					{{ store.isSaving ? "Saving..." : store.draft._id ? "Save" : "Create" }}
				</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAffixesStore } from "@/stores/affixes.store";
import TierTabControl from "../attributes/TierTabControl.vue";
import RelationshipEditor from "./RelationshipEditor.vue";
import DefinitionEditor from "./DefinitionEditor.vue";

const store = useAffixesStore();

const tierModel = computed({
	get: () => store.draft?.tier ?? 1,
	set: (v: 1 | 2 | 3 | 4) => store.updateDraft({ tier: v }),
});

const attributeItems = computed(() =>
	store.allAttributes.map((a) => ({
		id: a.attribute_id,
		name: a.name,
	}))
);

const affixItems = computed(() => {
	const currentId = store.draft?.affix_id;
	return store.affixes
		.filter((a) => a.affix_id !== currentId)
		.map((a) => ({
			id: a.affix_id,
			name: a.hash,
		}));
});

const canSave = computed(() => {
	if (!store.draft) return false;
	if (!store.draft.hash.trim()) return false;
	if (store.draft.attribute_ids.length === 0) return false;
	return store.hasUnsavedChanges;
});

async function handleDelete() {
	if (!store.draft?._id) return;
	if (!confirm(`Delete affix "${store.draft.hash}"?`)) return;
	await store.deleteAffix(store.draft._id);
}
</script>
