import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AffixesAPI } from "@/api/affixes.api";
import { AttributesAPI } from "@/api/attributes.api";
import type {
	AffixModel,
	I_AffixDefinition,
	I_CompilationError,
	I_ContextVariable,
} from "@/common/affix.types";
import type { AttributeModel } from "@/common/attribute.types";

export interface AffixDraft {
	_id?: string;
	affix_id?: number;
	hash: string;
	tier: 1 | 2 | 3 | 4;
	weight: number;
	potency: number;
	attribute_ids: number[];
	required_attribute_ids: number[];
	blocked_affix_ids: number[];
	require_affix_ids: number[];
	definition: I_AffixDefinition | null;
}

export const useAffixesStore = defineStore("affixes", () => {
	const affixesApi = new AffixesAPI();
	const attributesApi = new AttributesAPI();

	// State
	const affixes = ref<AffixModel[]>([]);
	const selectedId = ref<string | null>(null);
	const draft = ref<AffixDraft | null>(null);
	const hasUnsavedChanges = ref(false);
	const isLoading = ref(false);
	const isSaving = ref(false);
	const isCompiling = ref(false);
	const compilationErrors = ref<I_CompilationError[]>([]);
	const compilationWarnings = ref<I_CompilationError[]>([]);
	const searchQuery = ref("");
	const contextTokens = ref<I_ContextVariable[]>([]);
	const tokenCategories = ref<string[]>([]);
	const allAttributes = ref<AttributeModel[]>([]);
	const error = ref<string | null>(null);

	// Computed
	const selectedAffix = computed(() => {
		if (!selectedId.value) return null;
		return affixes.value.find((a) => a._id === selectedId.value) ?? null;
	});

	const filteredAffixes = computed(() => {
		if (!searchQuery.value.trim()) return affixes.value;
		const query = searchQuery.value.toLowerCase();
		return affixes.value.filter((a) => a.hash.toLowerCase().includes(query));
	});

	// Actions
	function deepClone<T>(obj: T): T {
		return JSON.parse(JSON.stringify(obj));
	}

	async function loadAffixes(): Promise<void> {
		isLoading.value = true;
		error.value = null;

		try {
			affixes.value = await affixesApi.findAll();
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to load affixes";
		} finally {
			isLoading.value = false;
		}
	}

	async function loadContextTokens(): Promise<void> {
		try {
			const response = await affixesApi.getContext();
			contextTokens.value = response.tokens;
			tokenCategories.value = response.categories;
		} catch (e) {
			console.error("Failed to load context tokens:", e);
		}
	}

	async function loadAttributes(): Promise<void> {
		try {
			allAttributes.value = await attributesApi.findAll();
		} catch (e) {
			console.error("Failed to load attributes:", e);
		}
	}

	function selectAffix(id: string | null): boolean {
		if (hasUnsavedChanges.value && id !== selectedId.value) {
			return false;
		}

		selectedId.value = id;
		compilationErrors.value = [];
		compilationWarnings.value = [];

		if (id) {
			const affix = affixes.value.find((a) => a._id === id);
			if (affix) {
				draft.value = {
					_id: affix._id,
					affix_id: affix.affix_id,
					hash: affix.hash,
					tier: affix.tier as 1 | 2 | 3 | 4,
					weight: affix.weight,
					potency: affix.potency,
					attribute_ids: [...affix.attribute_ids],
					required_attribute_ids: [...affix.required_attribute_ids],
					blocked_affix_ids: [...affix.blocked_affix_ids],
					require_affix_ids: [...(affix.require_affix_ids || [])],
										definition: affix.definition ? deepClone(affix.definition) : null,
				};
			} else {
				draft.value = null;
			}
		} else {
			draft.value = null;
		}

		hasUnsavedChanges.value = false;
		return true;
	}

	function forceSelectAffix(id: string | null): void {
		selectedId.value = id;
		compilationErrors.value = [];
		compilationWarnings.value = [];

		if (id) {
			const affix = affixes.value.find((a) => a._id === id);
			if (affix) {
				draft.value = {
					_id: affix._id,
					affix_id: affix.affix_id,
					hash: affix.hash,
					tier: affix.tier as 1 | 2 | 3 | 4,
					weight: affix.weight,
					potency: affix.potency,
					attribute_ids: [...affix.attribute_ids],
					required_attribute_ids: [...affix.required_attribute_ids],
					blocked_affix_ids: [...affix.blocked_affix_ids],
					require_affix_ids: [...(affix.require_affix_ids || [])],
										definition: affix.definition ? deepClone(affix.definition) : null,
				};
			} else {
				draft.value = null;
			}
		} else {
			draft.value = null;
		}

		hasUnsavedChanges.value = false;
	}

	function createNewAffix(): void {
		selectedId.value = null;
		compilationErrors.value = [];
		compilationWarnings.value = [];
		draft.value = {
			hash: "",
			tier: 1,
			weight: 100,
			potency: 1,
			attribute_ids: [],
			required_attribute_ids: [],
			blocked_affix_ids: [],
			require_affix_ids: [],
			definition: null,
		};
		hasUnsavedChanges.value = true;
	}

	function updateDraft(updates: Partial<AffixDraft>): void {
		if (!draft.value) return;
		Object.assign(draft.value, updates);
		hasUnsavedChanges.value = true;
	}

	async function compileHash(): Promise<boolean> {
		if (!draft.value || !draft.value.hash.trim()) {
			compilationErrors.value = [
				{
					code: "EMPTY_HASH",
					severity: "ERROR",
					message: "Hash/context string is empty",
				},
			];
			return false;
		}

		// Check for duplicate hash (exclude current affix if editing)
		const trimmedHash = draft.value.hash.trim();
		const duplicate = affixes.value.find(
			(a) => a.hash === trimmedHash && a._id !== draft.value?._id
		);
		if (duplicate) {
			compilationErrors.value = [
				{
					code: "DUPLICATE_HASH",
					severity: "ERROR",
					message: `An affix with this hash already exists (ID: ${duplicate.affix_id})`,
				},
			];
			return false;
		}

		isCompiling.value = true;
		compilationErrors.value = [];
		compilationWarnings.value = [];

		try {
			const result = await affixesApi.compile(draft.value.hash, true);

			compilationErrors.value = result.errors || [];
			compilationWarnings.value = result.warnings || [];

			if (result.success && result.definition) {
				draft.value.definition = result.definition;
				hasUnsavedChanges.value = true;
				return true;
			}

			return false;
		} catch (e) {
			compilationErrors.value = [
				{
					code: "COMPILE_FAILED",
					severity: "ERROR",
					message: e instanceof Error ? e.message : "Compilation failed",
				},
			];
			return false;
		} finally {
			isCompiling.value = false;
		}
	}

	async function saveAffix(): Promise<void> {
		if (!draft.value) return;
		if (!draft.value.hash.trim()) {
			error.value = "Hash is required";
			return;
		}
		if (draft.value.attribute_ids.length === 0) {
			error.value = "At least one attribute must be selected";
			return;
		}

		isSaving.value = true;
		error.value = null;

		try {
			if (draft.value._id) {
				await affixesApi.update({
					id: draft.value._id,
					hash: draft.value.hash,
					tier: draft.value.tier,
					weight: draft.value.weight,
					potency: draft.value.potency,
					attribute_ids: draft.value.attribute_ids,
					required_attribute_ids: draft.value.required_attribute_ids,
					blocked_affix_ids: draft.value.blocked_affix_ids,
					require_affix_ids: draft.value.require_affix_ids,
					definition: draft.value.definition ?? undefined,
				});
			} else {
				const created = await affixesApi.create({
					hash: draft.value.hash,
					tier: draft.value.tier,
					weight: draft.value.weight,
					potency: draft.value.potency,
					attribute_ids: draft.value.attribute_ids,
					required_attribute_ids: draft.value.required_attribute_ids,
					blocked_affix_ids: draft.value.blocked_affix_ids,
					require_affix_ids: draft.value.require_affix_ids,
					definition: draft.value.definition ?? undefined,
				});
				selectedId.value = created._id;
			}

			await loadAffixes();

			if (selectedId.value) {
				const affix = affixes.value.find((a) => a._id === selectedId.value);
				if (affix) {
					draft.value = {
						_id: affix._id,
						affix_id: affix.affix_id,
						hash: affix.hash,
						tier: affix.tier as 1 | 2 | 3 | 4,
						weight: affix.weight,
						potency: affix.potency,
						attribute_ids: [...affix.attribute_ids],
						required_attribute_ids: [...affix.required_attribute_ids],
						blocked_affix_ids: [...affix.blocked_affix_ids],
						require_affix_ids: [...(affix.require_affix_ids || [])],
												definition: affix.definition ? deepClone(affix.definition) : null,
					};
				}
			}

			hasUnsavedChanges.value = false;
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to save affix";
		} finally {
			isSaving.value = false;
		}
	}

	async function deleteAffix(id: string): Promise<void> {
		isSaving.value = true;
		error.value = null;

		try {
			await affixesApi.delete(id);
			await loadAffixes();

			if (selectedId.value === id) {
				selectedId.value = null;
				draft.value = null;
				hasUnsavedChanges.value = false;
			}
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to delete affix";
		} finally {
			isSaving.value = false;
		}
	}

	function discardChanges(): void {
		if (selectedId.value) {
			const affix = affixes.value.find((a) => a._id === selectedId.value);
			if (affix) {
				draft.value = {
					_id: affix._id,
					affix_id: affix.affix_id,
					hash: affix.hash,
					tier: affix.tier as 1 | 2 | 3 | 4,
					weight: affix.weight,
					potency: affix.potency,
					attribute_ids: [...affix.attribute_ids],
					required_attribute_ids: [...affix.required_attribute_ids],
					blocked_affix_ids: [...affix.blocked_affix_ids],
					require_affix_ids: [...(affix.require_affix_ids || [])],
										definition: affix.definition ? deepClone(affix.definition) : null,
				};
			} else {
				draft.value = null;
			}
		} else {
			draft.value = null;
		}
		compilationErrors.value = [];
		compilationWarnings.value = [];
		hasUnsavedChanges.value = false;
	}


	function getAttributeName(attributeId: number): string {
		const attr = allAttributes.value.find((a) => a.attribute_id === attributeId);
		return attr?.name ?? String(attributeId);
	}

	function getAffixHash(affixId: number): string {
		const affix = affixes.value.find((a) => a.affix_id === affixId);
		return affix?.hash ?? String(affixId);
	}

	return {
		// State
		affixes,
		selectedId,
		draft,
		hasUnsavedChanges,
		isLoading,
		isSaving,
		isCompiling,
		compilationErrors,
		compilationWarnings,
		searchQuery,
		contextTokens,
		tokenCategories,
		allAttributes,
		error,

		// Computed
		selectedAffix,
		filteredAffixes,

		// Actions
		loadAffixes,
		loadContextTokens,
		loadAttributes,
		selectAffix,
		forceSelectAffix,
		createNewAffix,
		updateDraft,
		compileHash,
		saveAffix,
		deleteAffix,
		discardChanges,
		getAttributeName,
		getAffixHash,
	};
});
