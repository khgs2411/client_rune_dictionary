<template>
	<div v-if="!store.draft" class="editor-empty">
		<Icon icon="game-icons:scroll-unfurled" class="empty-icon" />
		<p class="empty-title">Select an affix to edit</p>
		<p class="empty-hint">or create a new one</p>
	</div>

	<div v-else class="editor-frame">
		<!-- Header -->
		<div class="editor-header">
			<div class="header-left">
				<div class="header-icon-box">
					<Icon icon="game-icons:scroll-unfurled" class="header-icon" />
				</div>
				<div class="flex-1 min-w-0">
					<Input
						:model-value="store.draft.hash"
						placeholder='e.g., "$DEAL$ $X$ $Y$ Damage"'
						class="hash-input"
						@update:model-value="(v) => store.updateDraft({ hash: v as string })" />
					<p v-if="store.draft._id" class="editor-id">ID: {{ store.draft.affix_id }}</p>
					<p v-else class="editor-id">Creating new</p>
				</div>
			</div>

			<div v-if="store.hasUnsavedChanges" class="unsaved-indicator">
				<Icon icon="radix-icons:dot-filled" class="h-4 w-4" />
				<span>Unsaved</span>
			</div>
		</div>

		<!-- Error -->
		<div v-if="store.error" class="editor-error">
			{{ store.error }}
		</div>

		<!-- Scrollable Content -->
		<div class="editor-scroll" @wheel.stop>
			<!-- Basic Info Section -->
			<section class="editor-section">
				<h3 class="section-heading">Basic Info</h3>

				<div class="grid gap-3">
					<div class="space-y-1">
						<Label class="field-label">Tier</Label>
						<TierTabControl v-model="tierModel" :get-rule-count="() => 0" />
					</div>

					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<Label class="field-label">Weight</Label>
							<span class="field-value">{{ store.draft.weight }}</span>
						</div>
						<Slider
							:model-value="[store.draft.weight]"
							:min="0"
							:max="1"
							:step="0.01"
							class="w-full"
							@update:model-value="(v) => store.updateDraft({ weight: v?.[0] })" />
					</div>

					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<Label class="field-label">Potency</Label>
							<span class="field-value">{{ store.draft.potency.toFixed(1) }}</span>
						</div>
						<Slider
							:model-value="[store.draft.potency]"
							:min="0"
							:max="100"
							:step="1"
							class="w-full"
							@update:model-value="(v) => store.updateDraft({ potency: v?.[0] })" />
					</div>
				</div>
			</section>

			<!-- Attributes Section -->
			<section class="editor-section">
				<h3 class="section-heading">Attributes</h3>

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
			<section class="editor-section">
				<h3 class="section-heading">Affix Relationships</h3>

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
			<section class="editor-section">
				<h3 class="section-heading">Context Compiler</h3>
				<DefinitionEditor />
			</section>
		</div>

		<!-- Actions Footer -->
		<div class="editor-footer">
			<Button
				v-if="store.draft._id"
				variant="ghost"
				size="sm"
				class="delete-btn"
				@click="handleDelete"
				:disabled="store.isSaving">
				<Icon icon="radix-icons:trash" class="h-4 w-4 mr-1" />
				Delete
			</Button>
			<div v-else></div>

			<div class="flex gap-2">
				<button class="discard-btn" :disabled="!store.hasUnsavedChanges || store.isSaving" @click="store.discardChanges">
					Discard
				</button>
				<button class="save-btn" :disabled="!canSave || store.isSaving" @click="store.saveAffix">
					{{ store.isSaving ? "Saving..." : store.draft._id ? "Save" : "Create" }}
				</button>
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

<style scoped>
.editor-empty {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
}

.empty-icon {
	width: 48px;
	height: 48px;
	color: rgba(255, 255, 255, 0.08);
	margin-bottom: 12px;
}

.empty-title {
	font-size: 0.82rem;
	color: rgba(255, 255, 255, 0.3);
}

.empty-hint {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.15);
	margin-top: 4px;
}

.editor-frame {
	height: 100%;
	display: flex;
	flex-direction: column;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	overflow: hidden;
}

.editor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	flex-shrink: 0;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12px;
	flex: 1;
	min-width: 0;
}

.header-icon-box {
	width: 32px;
	height: 32px;
	border-radius: 6px;
	background: rgba(155, 126, 216, 0.15);
	border: 1px solid rgba(155, 126, 216, 0.25);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.header-icon {
	width: 16px;
	height: 16px;
	color: #9b7ed8;
}

.hash-input {
	height: 28px;
	font-family: monospace;
	font-size: 0.8rem;
	max-width: 280px;
	background: rgba(255, 255, 255, 0.04);
	border-color: rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.85);
}

.editor-id {
	font-size: 0.6rem;
	color: rgba(255, 255, 255, 0.2);
}

.unsaved-indicator {
	display: flex;
	align-items: center;
	gap: 4px;
	color: #f59e0b;
	font-size: 0.7rem;
	flex-shrink: 0;
}

.editor-error {
	margin: 12px 16px 0;
	padding: 8px 12px;
	font-size: 0.78rem;
	color: #f87171;
	background: rgba(239, 68, 68, 0.08);
	border: 1px solid rgba(239, 68, 68, 0.15);
	border-radius: 6px;
}

.editor-scroll {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	overscroll-behavior: contain;
}

.editor-section {
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.editor-section:last-child {
	margin-bottom: 0;
}

.section-heading {
	font-size: 0.65rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.35);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	margin-bottom: 12px;
	padding-bottom: 6px;
	border-bottom: 1px solid rgba(155, 126, 216, 0.15);
}

.field-label {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.4);
}

.field-value {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.3);
	font-family: monospace;
}

.editor-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	border-top: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	flex-shrink: 0;
}

.delete-btn {
	color: #f87171;
}

.delete-btn:hover {
	background: rgba(248, 113, 113, 0.1);
}

.discard-btn {
	padding: 5px 14px;
	font-size: 0.75rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.5);
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.discard-btn:hover:not(:disabled) {
	border-color: rgba(255, 255, 255, 0.2);
}

.discard-btn:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

.save-btn {
	padding: 5px 14px;
	font-size: 0.75rem;
	font-weight: 600;
	color: white;
	background: rgba(155, 126, 216, 0.6);
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.save-btn:hover:not(:disabled) {
	background: rgba(155, 126, 216, 0.8);
}

.save-btn:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}
</style>
