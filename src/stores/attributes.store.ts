import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AttributesAPI } from "@/api/attributes.api";
import type { AttributeModel, I_AttributeNameComponents, I_TieredNameComponent } from "@/common/attribute.types";
import { E_NamePosition } from "@/common/attribute.types";

export const useAttributesStore = defineStore("attributes", () => {
	const api = new AttributesAPI();

	// State
	const attributes = ref<AttributeModel[]>([]);
	const selectedId = ref<string | null>(null);
	const isLoading = ref(false);
	const isSaving = ref(false);
	const error = ref<string | null>(null);
	const searchQuery = ref("");

	// Draft state for editing (separate from source of truth)
	const draft = ref<AttributeModel | null>(null);
	const hasUnsavedChanges = ref(false);

	// Computed
	const selectedAttribute = computed(() => {
		if (!selectedId.value) return null;
		return attributes.value.find((a) => a._id === selectedId.value) ?? null;
	});

	const filteredAttributes = computed(() => {
		if (!searchQuery.value.trim()) return attributes.value;
		const query = searchQuery.value.toLowerCase();
		return attributes.value.filter((a) => a.name.toLowerCase().includes(query));
	});

	// Actions
	async function loadAttributes() {
		isLoading.value = true;
		error.value = null;

		try {
			attributes.value = await api.findAll();
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to load attributes";
		} finally {
			isLoading.value = false;
		}
	}

	function deepClone<T>(obj: T): T {
		return JSON.parse(JSON.stringify(obj));
	}

	function selectAttribute(id: string | null) {
		if (hasUnsavedChanges.value && id !== selectedId.value) {
			// Caller should handle unsaved changes warning
			return false;
		}

		selectedId.value = id;
		if (id) {
			const attr = attributes.value.find((a) => a._id === id);
			draft.value = attr ? deepClone(attr) : null;
		} else {
			draft.value = null;
		}
		hasUnsavedChanges.value = false;
		return true;
	}

	function forceSelectAttribute(id: string | null) {
		selectedId.value = id;
		if (id) {
			const attr = attributes.value.find((a) => a._id === id);
			draft.value = attr ? deepClone(attr) : null;
		} else {
			draft.value = null;
		}
		hasUnsavedChanges.value = false;
	}

	function createNewAttribute() {
		selectedId.value = null;
		draft.value = {
			_id: "",
			attribute_id: -1,
			name: "",
			weight: 1.0,
			type: 0,
			foundational: 0,
			name_components: { tiers: { 1: [], 2: [], 3: [], 4: [] } },
		};
		hasUnsavedChanges.value = true;
	}

	function updateDraft(updates: Partial<AttributeModel>) {
		if (!draft.value) return;
		Object.assign(draft.value, updates);
		hasUnsavedChanges.value = true;
	}

	function ensureNameComponents(): I_AttributeNameComponents {
		if (!draft.value) {
			return { tiers: { 1: [], 2: [], 3: [], 4: [] } };
		}
		if (!draft.value.name_components) {
			draft.value.name_components = { tiers: { 1: [], 2: [], 3: [], 4: [] } };
		}
		const tiers = draft.value.name_components.tiers;
		if (!tiers[1]) tiers[1] = [];
		if (!tiers[2]) tiers[2] = [];
		if (!tiers[3]) tiers[3] = [];
		if (!tiers[4]) tiers[4] = [];
		return draft.value.name_components;
	}

	function addNameRule(tier: 1 | 2 | 3 | 4) {
		const components = ensureNameComponents();
		const tierRules = components.tiers[tier] ?? [];

		const newId = tierRules.length > 0 ? Math.max(...tierRules.map((r) => r.id)) + 1 : 1;

		const newRule: I_TieredNameComponent = {
			id: newId,
			name: "",
			weight: 0.5,
			position: E_NamePosition.PREFIX,
			restrictedNameIds: [],
			compatibleWith: [],
		};

		tierRules.push(newRule);
		components.tiers[tier] = tierRules;
		hasUnsavedChanges.value = true;
	}

	function updateNameRule(tier: 1 | 2 | 3 | 4, ruleId: number, updates: Partial<I_TieredNameComponent>) {
		const components = ensureNameComponents();
		const tierRules = components.tiers[tier];
		if (!tierRules) return;

		const rule = tierRules.find((r) => r.id === ruleId);
		if (rule) {
			Object.assign(rule, updates);
			hasUnsavedChanges.value = true;
		}
	}

	function deleteNameRule(tier: 1 | 2 | 3 | 4, ruleId: number) {
		const components = ensureNameComponents();
		const tierRules = components.tiers[tier];
		if (!tierRules) return;

		const index = tierRules.findIndex((r) => r.id === ruleId);
		if (index !== -1) {
			tierRules.splice(index, 1);
			hasUnsavedChanges.value = true;
		}
	}

	async function saveAttribute() {
		if (!draft.value) return;

		isSaving.value = true;
		error.value = null;

		try {
			if (draft.value._id) {
				// Update existing
				await api.update({
					id: draft.value._id,
					name: draft.value.name,
					weight: draft.value.weight,
					type: draft.value.type,
					foundational: draft.value.foundational,
					name_components: draft.value.name_components,
				});
			} else {
				// Create new
				const created = await api.create({
					name: draft.value.name,
					weight: draft.value.weight,
					type: draft.value.type,
					foundational: draft.value.foundational,
					name_components: draft.value.name_components,
				});
				selectedId.value = created._id;
			}

			await loadAttributes();

			// Re-select to refresh draft from updated data
			if (selectedId.value) {
				const attr = attributes.value.find((a) => a._id === selectedId.value);
				draft.value = attr ? deepClone(attr) : null;
			}

			hasUnsavedChanges.value = false;
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to save attribute";
		} finally {
			isSaving.value = false;
		}
	}

	async function deleteAttribute(id: string) {
		isSaving.value = true;
		error.value = null;

		try {
			await api.delete(id);
			await loadAttributes();

			if (selectedId.value === id) {
				selectedId.value = null;
				draft.value = null;
				hasUnsavedChanges.value = false;
			}
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to delete attribute";
		} finally {
			isSaving.value = false;
		}
	}

	function discardChanges() {
		if (selectedId.value) {
			const attr = attributes.value.find((a) => a._id === selectedId.value);
			draft.value = attr ? deepClone(attr) : null;
		} else {
			draft.value = null;
		}
		hasUnsavedChanges.value = false;
	}

	function getRuleCountForTier(tier: 1 | 2 | 3 | 4): number {
		if (!draft.value?.name_components?.tiers) return 0;
		return draft.value.name_components.tiers[tier]?.length ?? 0;
	}

	return {
		// State
		attributes,
		selectedId,
		isLoading,
		isSaving,
		error,
		searchQuery,
		draft,
		hasUnsavedChanges,

		// Computed
		selectedAttribute,
		filteredAttributes,

		// Actions
		loadAttributes,
		selectAttribute,
		forceSelectAttribute,
		createNewAttribute,
		updateDraft,
		ensureNameComponents,
		addNameRule,
		updateNameRule,
		deleteNameRule,
		saveAttribute,
		deleteAttribute,
		discardChanges,
		getRuleCountForTier,
	};
});
