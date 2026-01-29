import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { CharactersAPI, type SlotUpdate } from "@/api/characters.api";
import { useAuthStore } from "@/stores/auth.store";
import type { AbilityModel } from "@/common/ability.types";

export const useLoadoutStore = defineStore("loadout", () => {
	const charactersApi = new CharactersAPI();
	const authStore = useAuthStore();

	const equippedSlots = ref<(AbilityModel | null)[]>([null, null, null, null]);
	const isLoading = ref(false);
	const isSyncing = ref(false);
	const error = ref<string | null>(null);

	const equippedCount = computed(() => equippedSlots.value.filter(Boolean).length);

	const debouncedSync = useDebounceFn(async () => {
		await syncToServer();
	}, 500);

	async function loadLoadout() {
		isLoading.value = true;
		error.value = null;

		try {
			const slots = await charactersApi.getLoadout(authStore.username);
			const newSlots: (AbilityModel | null)[] = [null, null, null, null];
			for (const slot of slots) {
				if (slot.ability && slot.slot_index >= 0 && slot.slot_index <= 3) {
					newSlots[slot.slot_index] = slot.ability;
				}
			}
			equippedSlots.value = newSlots;
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to load loadout";
		} finally {
			isLoading.value = false;
		}
	}

	function equipSkill(skill: AbilityModel, slotIndex: number) {
		if (slotIndex < 0 || slotIndex > 3) return;
		if (isEquipped(skill.ability_id)) return;

		equippedSlots.value[slotIndex] = skill;
		debouncedSync();
	}

	function unequipSkill(slotIndex: number) {
		if (slotIndex < 0 || slotIndex > 3) return;
		equippedSlots.value[slotIndex] = null;
		debouncedSync();
	}

	function isEquipped(abilityId: number): boolean {
		return equippedSlots.value.some((s) => s?.ability_id === abilityId);
	}

	function getNextAvailableSlot(): number {
		const index = equippedSlots.value.findIndex((s) => s === null);
		return index === -1 ? -1 : index;
	}

	async function syncToServer() {
		isSyncing.value = true;
		error.value = null;

		try {
			const slots: (SlotUpdate | null)[] = equippedSlots.value.map((skill, index) => {
				if (skill === null) return null;
				return { ability_id: skill.ability_id, slot_index: index };
			});
			await charactersApi.updateLoadout(authStore.username, slots);
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to save loadout";
		} finally {
			isSyncing.value = false;
		}
	}

	return {
		equippedSlots,
		isLoading,
		isSyncing,
		error,
		equippedCount,
		loadLoadout,
		equipSkill,
		unequipSkill,
		isEquipped,
		getNextAvailableSlot,
		syncToServer,
	};
});
