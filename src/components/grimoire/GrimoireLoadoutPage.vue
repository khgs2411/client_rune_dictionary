<template>
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div class="flex items-center gap-3 mb-6">
			<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
				<Icon icon="game-icons:shoulder-armor" class="h-5 w-5 text-white" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Combat Loadout</h3>
				<p class="text-xs text-muted-foreground">Equip skills for your next battle</p>
			</div>
			<!-- Sync indicator -->
			<div v-if="loadoutStore.isSyncing" class="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
				<Icon icon="radix-icons:update" class="h-3 w-3 animate-spin" />
				<span>Saving...</span>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
			<!-- Left: Equipped Skills -->
			<div class="flex flex-col">
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-2">
						<Icon icon="game-icons:crystal-bars" class="h-4 w-4 text-primary" />
						<h4 class="font-medium">Equipped</h4>
					</div>
					<span class="text-xs text-muted-foreground">{{ loadoutStore.equippedCount }}/{{ maxSlots }} slots</span>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div
						v-for="slot in maxSlots"
						:key="slot"
						class="aspect-square rounded-xl border-2 transition-all duration-200 relative overflow-hidden group"
						:class="
							loadoutStore.equippedSlots[slot - 1]
								? 'border-primary bg-primary/5 hover:bg-primary/10'
								: 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
						">
						<!-- Filled Slot -->
						<template v-if="loadoutStore.equippedSlots[slot - 1]">
							<div class="absolute inset-0 flex flex-col items-center justify-center p-3 cursor-pointer" @click="loadoutStore.unequipSkill(slot - 1)">
								<!-- Skill Icon -->
								<div
									class="w-14 h-14 rounded-xl flex items-center justify-center mb-2"
									:style="{ backgroundColor: getSkillColor(loadoutStore.equippedSlots[slot - 1]!) + '20' }">
									<Icon
										:icon="getSkillIcon(loadoutStore.equippedSlots[slot - 1]!)"
										class="h-7 w-7"
										:style="{ color: getSkillColor(loadoutStore.equippedSlots[slot - 1]!) }" />
								</div>
								<p class="text-sm font-medium text-center truncate w-full">
									{{ loadoutStore.equippedSlots[slot - 1]!.name }}
								</p>
								<span
									class="text-xs px-2 py-0.5 rounded-full mt-1"
									:style="{
										backgroundColor: getTierColor(loadoutStore.equippedSlots[slot - 1]!.tier) + '20',
										color: getTierColor(loadoutStore.equippedSlots[slot - 1]!.tier),
									}">
									Tier {{ loadoutStore.equippedSlots[slot - 1]!.tier }}
								</span>
							</div>
							<!-- Unequip Button -->
							<Button
								variant="ghost"
								size="icon"
								class="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive/20 hover:text-destructive"
								@click.stop="loadoutStore.unequipSkill(slot - 1)">
								<Icon icon="radix-icons:cross-2" class="h-3 w-3" />
							</Button>
						</template>

						<!-- Empty Slot -->
						<template v-else>
							<div class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
								<div class="w-12 h-12 rounded-xl border-2 border-dashed border-current/30 flex items-center justify-center mb-2">
									<Icon icon="radix-icons:plus" class="h-5 w-5 opacity-50" />
								</div>
								<p class="text-xs font-medium">Slot {{ slot }}</p>
								<p class="text-xs opacity-50">Empty</p>
							</div>
						</template>
					</div>
				</div>

				<!-- Loadout Stats -->
				<div class="mt-4 p-4 border rounded-xl bg-muted/20">
					<div class="flex items-center gap-2 mb-3">
						<Icon icon="game-icons:chart" class="h-4 w-4 text-primary" />
						<h5 class="text-sm font-medium">Loadout Summary</h5>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div class="p-3 rounded-lg bg-background/50 text-center">
							<p class="text-2xl font-bold text-primary">{{ loadoutStore.equippedCount }}</p>
							<p class="text-xs text-muted-foreground">Equipped</p>
						</div>
						<div class="p-3 rounded-lg bg-background/50 text-center">
							<p class="text-2xl font-bold text-muted-foreground">{{ maxSlots - loadoutStore.equippedCount }}</p>
							<p class="text-xs text-muted-foreground">Available</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Available Skills -->
			<div class="flex flex-col overflow-hidden">
				<div class="flex items-center gap-2 mb-3">
					<Icon icon="game-icons:scroll-unfurled" class="h-4 w-4 text-primary" />
					<h4 class="font-medium">Available Skills</h4>
					<span class="text-xs text-muted-foreground">({{ availableSkills.length }})</span>
				</div>

				<div class="flex-1 overflow-y-auto border rounded-xl bg-muted/20 overscroll-contain" @wheel.stop>
					<div v-if="loading || loadoutStore.isLoading" class="p-8 text-center text-muted-foreground">
						<Icon icon="radix-icons:update" class="h-8 w-8 animate-spin mx-auto mb-2" />
						<p>Loading skills...</p>
					</div>

					<div v-else-if="availableSkills.length === 0" class="p-8 text-center text-muted-foreground">
						<Icon icon="game-icons:empty-hourglass" class="h-12 w-12 mx-auto mb-2 opacity-50" />
						<p class="font-medium">No skills available</p>
						<p class="text-xs mt-1">Forge skills in the Skills tab</p>
					</div>

					<div v-else class="p-3 space-y-2">
						<div
							v-for="skill in availableSkills"
							:key="skill.ability_id"
							class="p-3 rounded-lg border transition-all duration-200"
							:class="
								loadoutStore.isEquipped(skill.ability_id)
									? 'border-primary/30 bg-primary/5 opacity-60'
									: 'border-transparent bg-background/50 hover:border-border hover:bg-background cursor-pointer'
							"
							@click="!loadoutStore.isEquipped(skill.ability_id) && equipToNextSlot(skill)">
							<div class="flex items-center gap-3">
								<!-- Skill Icon -->
								<div
									class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
									:style="{ backgroundColor: getSkillColor(skill) + '20' }">
									<Icon :icon="getSkillIcon(skill)" class="h-5 w-5" :style="{ color: getSkillColor(skill) }" />
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<p class="font-medium truncate">{{ skill.name }}</p>
										<span
											class="text-xs px-1.5 py-0.5 rounded shrink-0"
											:style="{
												backgroundColor: getTierColor(skill.tier) + '20',
												color: getTierColor(skill.tier),
											}">
											T{{ skill.tier }}
										</span>
									</div>
									<p class="text-xs text-muted-foreground truncate mt-0.5">
										{{ getSkillPreview(skill) }}
									</p>
								</div>
								<!-- Action -->
								<div class="shrink-0">
									<template v-if="loadoutStore.isEquipped(skill.ability_id)">
										<span class="text-xs text-primary font-medium">Equipped</span>
									</template>
									<template v-else-if="loadoutStore.equippedCount < maxSlots">
										<Button variant="outline" size="sm" class="h-7 text-xs" @click.stop="equipToNextSlot(skill)">
											<Icon icon="radix-icons:plus" class="h-3 w-3 mr-1" />
											Equip
										</Button>
									</template>
									<template v-else>
										<span class="text-xs text-muted-foreground">Full</span>
									</template>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Error display -->
		<div v-if="error || loadoutStore.error" class="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded border border-destructive/30">
			<div class="flex items-center gap-2">
				<Icon icon="radix-icons:exclamation-triangle" class="h-4 w-4" />
				<span>{{ error || loadoutStore.error }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { CharactersAPI } from "@/api/characters.api";
import { useAuthStore } from "@/stores/auth.store";
import { useLoadoutStore } from "@/stores/loadout.store";
import type { AbilityModel } from "@/common/ability.types";

const charactersApi = new CharactersAPI();
const authStore = useAuthStore();
const loadoutStore = useLoadoutStore();

const maxSlots = 4;

const availableSkills = ref<AbilityModel[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function loadSkills() {
	try {
		availableSkills.value = await charactersApi.getAbilities(authStore.username);
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load skills";
	} finally {
		loading.value = false;
	}
}

function equipToNextSlot(skill: AbilityModel) {
	const nextSlot = loadoutStore.getNextAvailableSlot();
	if (nextSlot !== -1) {
		loadoutStore.equipSkill(skill, nextSlot);
	}
}

function getSkillPreview(skill: AbilityModel): string {
	const slots = skill.slots;
	if (!slots) return "No description";
	const slotKeys = Object.keys(slots).sort();
	if (slotKeys.length === 0) return "No description";
	const text = slots[Number(slotKeys[0])]?.text ?? "No description";
	return text.length > 50 ? text.substring(0, 50) + "..." : text;
}

function getSkillColor(skill: AbilityModel): string {
	const name = skill.name.toLowerCase();
	if (name.includes("fire") || name.includes("flame") || name.includes("burn")) return "#ef4444";
	if (name.includes("frost") || name.includes("ice") || name.includes("freeze")) return "#3b82f6";
	if (name.includes("water") || name.includes("aqua")) return "#0ea5e9";
	if (name.includes("earth") || name.includes("rock") || name.includes("stone")) return "#a16207";
	if (name.includes("wind") || name.includes("air") || name.includes("gust")) return "#22c55e";
	if (name.includes("light") || name.includes("holy") || name.includes("radiant")) return "#fbbf24";
	if (name.includes("shadow") || name.includes("dark") || name.includes("void")) return "#7c3aed";
	if (name.includes("arcane") || name.includes("magic") || name.includes("mystic")) return "#a855f7";
	if (name.includes("lightning") || name.includes("thunder") || name.includes("shock")) return "#facc15";
	return "#6b7280";
}

function getSkillIcon(skill: AbilityModel): string {
	const name = skill.name.toLowerCase();
	if (name.includes("fire") || name.includes("flame")) return "game-icons:fire";
	if (name.includes("frost") || name.includes("ice")) return "game-icons:snowflake-2";
	if (name.includes("water") || name.includes("aqua")) return "game-icons:water-drop";
	if (name.includes("earth") || name.includes("rock")) return "game-icons:stone-block";
	if (name.includes("wind") || name.includes("air")) return "game-icons:wind-slap";
	if (name.includes("light") || name.includes("holy")) return "game-icons:sun";
	if (name.includes("shadow") || name.includes("dark")) return "game-icons:evil-moon";
	if (name.includes("lightning") || name.includes("thunder")) return "game-icons:lightning-bolt";
	return "game-icons:magic-swirl";
}

function getTierColor(tier: number): string {
	const colors: Record<number, string> = {
		1: "#6b7280",
		2: "#22c55e",
		3: "#3b82f6",
		4: "#a855f7",
		5: "#f59e0b",
	};
	return colors[tier] || "#6b7280";
}

onMounted(async () => {
	await Promise.all([loadSkills(), loadoutStore.loadLoadout()]);
});
</script>
