<template>
	<div v-if="!store.draft" class="editor-empty">
		<Icon icon="game-icons:rune-stone" class="empty-icon" />
		<p class="empty-title">Select an attribute to edit</p>
		<p class="empty-hint">or create a new one</p>
	</div>

	<div v-else class="editor-frame">
		<!-- Header -->
		<div class="editor-header">
			<div class="header-left">
				<div class="header-icon-box">
					<Icon icon="game-icons:rune-stone" class="header-icon" />
				</div>
				<div>
					<h2 class="editor-title">{{ store.draft.name || "New Attribute" }}</h2>
					<p v-if="store.draft._id" class="editor-id">ID: {{ store.draft.attribute_id }}</p>
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
						<Label for="attr-name" class="field-label">Name</Label>
						<Input
							id="attr-name"
							:model-value="store.draft.name"
							placeholder="e.g. Fire, Physical"
							class="dark-input"
							@update:model-value="(v) => store.updateDraft({ name: v as string })" />
					</div>

					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<Label class="field-label">Weight</Label>
							<span class="field-value">{{ store.draft.weight.toFixed(2) }}</span>
						</div>
						<Slider
							:model-value="[store.draft.weight]"
							:min="0.1"
							:max="1"
							:step="0.05"
							class="w-full"
							@update:model-value="(v) => store.updateDraft({ weight: v[0] })" />
					</div>

					<div class="flex gap-4 pt-1">
						<label class="flex items-center gap-2 cursor-pointer">
							<Switch v-model="isElementType" />
							<span class="toggle-label">Element</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<Switch v-model="isFoundational" />
							<span class="toggle-label">Foundational</span>
						</label>
					</div>
				</div>
			</section>

			<!-- Naming Engine Section -->
			<section class="editor-section">
				<div class="flex items-center justify-between">
					<h3 class="section-heading">Naming Rules</h3>
					<button class="add-rule-btn" @click="store.addNameRule(activeTier)">
						<Icon icon="radix-icons:plus" class="h-3 w-3" />
						Add
					</button>
				</div>

				<TierTabControl v-model="activeTier" :get-rule-count="store.getRuleCountForTier" />

				<div class="space-y-2">
					<div v-if="currentTierRules.length === 0" class="rules-empty">
						No rules for Tier {{ activeTier }}
					</div>

					<TransitionGroup name="list" tag="div" class="space-y-2">
						<NameRuleRow
							v-for="rule in currentTierRules"
							:key="rule.id"
							:rule="rule"
							:tier="activeTier"
							:available-attributes="store.attributes"
							:is-picker-active="activePickerRule === `rule-${activeTier}-${rule.id}`"
							@update="(updates) => store.updateNameRule(activeTier, rule.id, updates)"
							@delete="store.deleteNameRule(activeTier, rule.id)"
							@open-picker="(payload) => emit('open-picker', payload)" />
					</TransitionGroup>
				</div>
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
				<button class="save-btn" :disabled="!canSave || store.isSaving" @click="store.saveAttribute">
					{{ store.isSaving ? "Saving..." : store.draft._id ? "Save" : "Create" }}
				</button>
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

defineProps<{
	activePickerRule?: string | null;
}>();

const emit = defineEmits<{
	"open-picker": [payload: { ruleKey: string; label: string; items: { id: number; name: string }[]; tier: 1 | 2 | 3 | 4; ruleId: number }];
}>();

const store = useAttributesStore();
const activeTier = ref<1 | 2 | 3 | 4>(1);

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
	color: rgba(255, 255, 255, 0.6);
}

.empty-hint {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.4);
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
}

.header-icon {
	width: 16px;
	height: 16px;
	color: #9b7ed8;
}

.editor-title {
	font-size: 0.9rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.9);
}

.editor-id {
	font-size: 0.6rem;
	color: rgba(255, 255, 255, 0.45);
}

.unsaved-indicator {
	display: flex;
	align-items: center;
	gap: 4px;
	color: #f59e0b;
	font-size: 0.7rem;
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
}

.editor-section:last-child {
	margin-bottom: 0;
}

.section-heading {
	font-size: 0.65rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.75);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	margin-bottom: 12px;
	padding-bottom: 6px;
	border-bottom: 1px solid rgba(155, 126, 216, 0.15);
}

.field-label {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.85);
}

.field-value {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.7);
	font-family: monospace;
}

.toggle-label {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.85);
}

.dark-input {
	background: rgba(255, 255, 255, 0.04);
	border-color: rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.85);
	height: 32px;
	font-size: 0.82rem;
}

.dark-input::placeholder {
	color: rgba(255, 255, 255, 0.3);
}

.add-rule-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	font-size: 0.68rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.75);
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 5px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.add-rule-btn:hover {
	color: rgba(255, 255, 255, 0.8);
	border-color: rgba(255, 255, 255, 0.2);
}

.rules-empty {
	padding: 16px;
	text-align: center;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	border: 1px solid rgba(255, 255, 255, 0.04);
	border-radius: 6px;
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
	color: rgba(255, 255, 255, 0.75);
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
