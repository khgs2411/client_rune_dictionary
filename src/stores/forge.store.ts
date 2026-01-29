import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AttributesAPI } from "@/api/attributes.api";
import { SkillsAPI } from "@/api/skills.api";
import { useAuthStore } from "@/stores/auth.store";
import type { AttributeModel } from "@/common/attribute.types";
import type { AbilityModel } from "@/common/ability.types";

export const useForgeStore = defineStore("forge", () => {
	const attributesApi = new AttributesAPI();
	const skillsApi = new SkillsAPI();
	const authStore = useAuthStore();

	// State
	const isOpen = ref(false);
	const isForging = ref(false);
	const selectedAttributeIds = ref<number[]>([]);
	const attributes = ref<AttributeModel[]>([]);
	const forgedAbility = ref<AbilityModel | null>(null);
	const error = ref<string | null>(null);
	const isLoadingAttributes = ref(false);

	// Computed - Separate fundamental (first 4) from other attributes
	const fundamentalAttributes = computed(() => {
		return attributes.value.slice(0, 4);
	});

	const otherAttributes = computed(() => {
		return attributes.value.slice(4);
	});

	const selectedFundamentalIds = computed(() => {
		const fundamentalIds = new Set(fundamentalAttributes.value.map((a) => a.attribute_id));
		return selectedAttributeIds.value.filter((id) => fundamentalIds.has(id));
	});

	const selectedOtherIds = computed(() => {
		const fundamentalIds = new Set(fundamentalAttributes.value.map((a) => a.attribute_id));
		return selectedAttributeIds.value.filter((id) => !fundamentalIds.has(id));
	});

	const hasFundamentalSelected = computed(() => {
		return selectedFundamentalIds.value.length > 0;
	});

	const canChannel = computed(() => {
		return hasFundamentalSelected.value && selectedAttributeIds.value.length > 0 && !isForging.value;
	});

	const validationError = computed(() => {
		if (selectedAttributeIds.value.length === 0) {
			return "Select at least one rune";
		}
		if (!hasFundamentalSelected.value) {
			return "Select at least one fundamental rune";
		}
		return null;
	});

	// Actions
	async function openForge() {
		isOpen.value = true;
		error.value = null;
		forgedAbility.value = null;

		if (attributes.value.length === 0) {
			await loadAttributes();
		}
	}

	function closeForge() {
		isOpen.value = false;
		forgedAbility.value = null;
		error.value = null;
		selectedAttributeIds.value = [];
	}

	async function loadAttributes() {
		isLoadingAttributes.value = true;
		error.value = null;

		try {
			attributes.value = await attributesApi.findAll();
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to load attributes";
		} finally {
			isLoadingAttributes.value = false;
		}
	}

	function toggleAttribute(id: number) {
		const index = selectedAttributeIds.value.indexOf(id);
		if (index === -1) {
			selectedAttributeIds.value.push(id);
		} else {
			selectedAttributeIds.value.splice(index, 1);
		}
	}

	function isSelected(id: number): boolean {
		return selectedAttributeIds.value.includes(id);
	}

	function clearSelection() {
		selectedAttributeIds.value = [];
	}

	async function channel() {
		if (!canChannel.value) return;

		isForging.value = true;
		error.value = null;

		try {
			const newAbility = await skillsApi.generate(authStore.username, selectedAttributeIds.value);
			forgedAbility.value = newAbility;
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to forge ability";
		} finally {
			isForging.value = false;
		}
	}

	return {
		// State
		isOpen,
		isForging,
		selectedAttributeIds,
		attributes,
		forgedAbility,
		error,
		isLoadingAttributes,

		// Computed
		fundamentalAttributes,
		otherAttributes,
		selectedFundamentalIds,
		selectedOtherIds,
		hasFundamentalSelected,
		canChannel,
		validationError,

		// Actions
		openForge,
		closeForge,
		loadAttributes,
		toggleAttribute,
		isSelected,
		clearSelection,
		channel,
	};
});
