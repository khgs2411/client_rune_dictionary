<template>
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between mb-4">
			<div>
				<h3 class="text-lg font-semibold">Loadout</h3>
				<p class="text-sm text-muted-foreground">Equip skills to use in combat</p>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
			<!-- Left: Equipped Skills -->
			<div class="flex flex-col">
				<h4 class="font-medium mb-3 flex items-center gap-2">
					<Icon icon="game-icons:shoulder-armor" class="h-4 w-4 text-primary" />
					Equipped Skills ({{ equippedSkills.length }}/{{ maxSlots }})
				</h4>

				<div class="grid grid-cols-2 gap-3">
					<div
						v-for="slot in maxSlots"
						:key="slot"
						class="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center relative"
						:class="equippedSkills[slot - 1] ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
						@click="equippedSkills[slot - 1] && unequipSkill(slot - 1)">
						<template v-if="equippedSkills[slot - 1]">
							<div class="text-center p-2">
								<Icon icon="game-icons:magic-swirl" class="h-8 w-8 mx-auto mb-1 text-primary" />
								<p class="text-xs font-medium truncate">{{ equippedSkills[slot - 1].name }}</p>
								<p class="text-xs text-muted-foreground">Tier {{ equippedSkills[slot - 1].tier }}</p>
							</div>
							<Button variant="ghost" size="icon-sm" class="absolute top-1 right-1 h-5 w-5 opacity-50 hover:opacity-100" @click.stop="unequipSkill(slot - 1)">
								<Icon icon="radix-icons:cross-2" class="h-3 w-3" />
							</Button>
						</template>
						<template v-else>
							<div class="text-center text-muted-foreground">
								<Icon icon="radix-icons:plus" class="h-6 w-6 mx-auto mb-1 opacity-50" />
								<p class="text-xs">Slot {{ slot }}</p>
							</div>
						</template>
					</div>
				</div>

				<!-- Stats preview -->
				<div class="mt-4 p-3 border rounded-lg bg-muted/30">
					<h5 class="text-sm font-medium mb-2">Loadout Stats</h5>
					<div class="grid grid-cols-2 gap-2 text-xs">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Equipped:</span>
							<span class="font-medium">{{ equippedSkills.length }}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Empty Slots:</span>
							<span class="font-medium">{{ maxSlots - equippedSkills.length }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Available Skills -->
			<div class="flex flex-col">
				<h4 class="font-medium mb-3 flex items-center gap-2">
					<Icon icon="game-icons:scroll-unfurled" class="h-4 w-4 text-primary" />
					Available Skills ({{ availableSkills.length }})
				</h4>

				<div class="flex-1 overflow-auto border rounded-lg">
					<div v-if="loading" class="p-8 text-center text-muted-foreground">Loading skills...</div>

					<div v-else-if="availableSkills.length === 0" class="p-8 text-center text-muted-foreground">
						<Icon icon="game-icons:empty-hourglass" class="h-12 w-12 mx-auto mb-2 opacity-50" />
						<p>No skills available</p>
						<p class="text-xs">Forge skills in the Skill Forge tab</p>
					</div>

					<div v-else class="p-2 space-y-2">
						<div
							v-for="skill in availableSkills"
							:key="skill.ability_id"
							class="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
							:class="{ 'opacity-50': isEquipped(skill.ability_id) }"
							@click="!isEquipped(skill.ability_id) && equipSkill(skill)">
							<div class="flex items-center justify-between">
								<span class="font-medium">{{ skill.name }}</span>
								<div class="flex items-center gap-2">
									<span class="text-xs px-2 py-0.5 bg-primary/20 rounded">Tier {{ skill.tier }}</span>
									<Button v-if="!isEquipped(skill.ability_id) && equippedSkills.length < maxSlots" variant="outline" size="sm" @click.stop="equipSkill(skill)"> Equip </Button>
									<span v-else-if="isEquipped(skill.ability_id)" class="text-xs text-muted-foreground">Equipped</span>
								</div>
							</div>
							<div v-if="skill.slots" class="mt-2 space-y-1">
								<div v-for="(slot, idx) in Object.entries(skill.slots)" :key="idx" class="text-xs text-muted-foreground">
									{{ slot[1].text }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Error display -->
		<div v-if="error" class="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded">
			{{ error }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { SkillsAPI } from "@/api/skills.api";
import { useAuthStore } from "@/stores/auth.store";
import type { AbilityModel } from "@/common/ability.types";

const skillsApi = new SkillsAPI();
const authStore = useAuthStore();

const maxSlots = 4;

const availableSkills = ref<AbilityModel[]>([]);
const equippedSkills = ref<AbilityModel[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function loadSkills() {
	try {
		availableSkills.value = await skillsApi.findByUser(authStore.username);
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load skills";
	} finally {
		loading.value = false;
	}
}

function isEquipped(abilityId: number): boolean {
	return equippedSkills.value.some((s) => s.ability_id === abilityId);
}

function equipSkill(skill: AbilityModel) {
	if (equippedSkills.value.length >= maxSlots) return;
	if (isEquipped(skill.ability_id)) return;
	equippedSkills.value.push(skill);
}

function unequipSkill(index: number) {
	equippedSkills.value.splice(index, 1);
}

onMounted(loadSkills);
</script>
