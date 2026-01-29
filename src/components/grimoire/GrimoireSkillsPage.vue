<template>
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between mb-6">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
					<Icon icon="game-icons:scroll-unfurled" class="h-5 w-5 text-white" />
				</div>
				<div>
					<h3 class="text-lg font-semibold">Your Skills</h3>
					<p class="text-xs text-muted-foreground">{{ skills.length }} abilities forged</p>
				</div>
			</div>
			<Button @click="openForge" class="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
				<Icon icon="game-icons:anvil" class="h-4 w-4" />
				Open Rune Forge
			</Button>
		</div>

		<div class="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
			<!-- Left: Skills List -->
			<div class="flex flex-col overflow-hidden">
				<div class="flex items-center gap-2 mb-3">
					<Icon icon="game-icons:book-pile" class="h-4 w-4 text-primary" />
					<h4 class="font-medium">Skill Collection</h4>
				</div>

				<div class="flex-1 overflow-y-auto border rounded-lg bg-muted/20">
					<div v-if="skillsLoading" class="p-8 text-center text-muted-foreground">
						<Icon icon="radix-icons:update" class="h-8 w-8 animate-spin mx-auto mb-2" />
						<p>Loading skills...</p>
					</div>

					<div v-else-if="skills.length === 0" class="p-8 text-center text-muted-foreground">
						<Icon icon="game-icons:empty-hourglass" class="h-12 w-12 mx-auto mb-2 opacity-50" />
						<p class="font-medium">No skills yet</p>
						<p class="text-xs mt-1">Open the Rune Forge to create your first ability</p>
					</div>

					<div v-else class="p-3 space-y-2">
						<div
							v-for="skill in skills"
							:key="skill.ability_id"
							class="group p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer"
							:class="
								selectedSkill?.ability_id === skill.ability_id
									? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
									: 'border-transparent bg-background/50 hover:border-border hover:bg-background'
							"
							@click="selectedSkill = skill">
							<div class="flex items-start justify-between gap-3">
								<div class="flex items-center gap-3">
									<!-- Skill Icon -->
									<div
										class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
										:style="{ backgroundColor: getSkillColor(skill) + '20' }">
										<Icon
											:icon="getSkillIcon(skill)"
											class="h-5 w-5"
											:style="{ color: getSkillColor(skill) }" />
									</div>
									<div>
										<p class="font-semibold">{{ skill.name }}</p>
										<p class="text-xs text-muted-foreground mt-0.5">
											{{ getSkillPreview(skill) }}
										</p>
									</div>
								</div>
								<span
									class="text-xs px-2 py-1 rounded-full font-medium shrink-0"
									:style="{
										backgroundColor: getTierColor(skill.tier) + '20',
										color: getTierColor(skill.tier),
									}">
									Tier {{ skill.tier }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Skill Detail Panel -->
			<div class="flex flex-col overflow-hidden">
				<div class="flex items-center gap-2 mb-3">
					<Icon icon="game-icons:book-cover" class="h-4 w-4 text-primary" />
					<h4 class="font-medium">Skill Details</h4>
				</div>

				<div class="flex-1 border rounded-lg bg-muted/20 overflow-hidden">
					<Transition name="slide-fade" mode="out-in">
						<div v-if="selectedSkill" :key="selectedSkill.ability_id" class="h-full flex flex-col">
							<!-- Skill Header -->
							<div class="p-4 border-b border-border bg-background/50">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div
											class="w-12 h-12 rounded-lg flex items-center justify-center"
											:style="{ backgroundColor: getSkillColor(selectedSkill) + '20' }">
											<Icon
												:icon="getSkillIcon(selectedSkill)"
												class="h-6 w-6"
												:style="{ color: getSkillColor(selectedSkill) }" />
										</div>
										<div>
											<h4 class="font-bold text-lg">{{ selectedSkill.name }}</h4>
											<span
												class="text-xs px-2 py-0.5 rounded-full"
												:style="{
													backgroundColor: getTierColor(selectedSkill.tier) + '20',
													color: getTierColor(selectedSkill.tier),
												}">
												Tier {{ selectedSkill.tier }}
											</span>
										</div>
									</div>
									<Button variant="ghost" size="icon" class="h-8 w-8" @click="selectedSkill = null">
										<Icon icon="radix-icons:cross-2" class="h-4 w-4" />
									</Button>
								</div>
							</div>

							<!-- Skill Effects -->
							<div class="flex-1 overflow-y-auto p-4 space-y-3">
								<div
									v-for="(slot, index) in Object.entries(selectedSkill.slots)"
									:key="index"
									class="p-3 bg-background/50 rounded-lg border border-border/50">
									<div class="flex items-start gap-2">
										<div class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
											<span class="text-xs font-bold text-primary">{{ slot[0] }}</span>
										</div>
										<div class="flex-1">
											<p class="text-sm">{{ slot[1].text }}</p>
											<div v-if="slot[1].effects && slot[1].effects.length > 0" class="mt-2 space-y-1">
												<div
													v-for="(effect, ei) in slot[1].effects"
													:key="ei"
													class="text-xs text-muted-foreground flex items-center gap-1">
													<Icon icon="radix-icons:dot-filled" class="h-3 w-3" />
													<span>{{ effect.type }} - {{ effect.action }}</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div v-else class="h-full flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
									<Icon icon="game-icons:book-cover" class="h-8 w-8 opacity-50" />
								</div>
								<p class="font-medium">No Skill Selected</p>
								<p class="text-sm mt-1">Select a skill from the list to view details</p>
							</div>
						</div>
					</Transition>
				</div>
			</div>
		</div>

		<!-- Error display -->
		<div v-if="error" class="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded border border-destructive/30">
			<div class="flex items-center gap-2">
				<Icon icon="radix-icons:exclamation-triangle" class="h-4 w-4" />
				<span>{{ error }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { CharactersAPI } from "@/api/characters.api";
import { useAuthStore } from "@/stores/auth.store";
import { useForgeStore } from "@/stores/forge.store";
import type { AbilityModel } from "@/common/ability.types";

const charactersApi = new CharactersAPI();
const authStore = useAuthStore();
const forgeStore = useForgeStore();

// Data
const skills = ref<AbilityModel[]>([]);
const skillsLoading = ref(true);
const error = ref<string | null>(null);

// Selection state
const selectedSkill = ref<AbilityModel | null>(null);

async function loadSkills() {
	try {
		skills.value = await charactersApi.getAbilities(authStore.username);
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load skills";
	} finally {
		skillsLoading.value = false;
	}
}

function openForge() {
	forgeStore.openForge();
}

function getSkillPreview(skill: AbilityModel): string {
	const slots = skill.slots;
	if (!slots) return "No description";
	const slotKeys = Object.keys(slots).sort();
	if (slotKeys.length === 0) return "No description";
	const text = slots[Number(slotKeys[0])]?.text ?? "No description";
	return text.length > 60 ? text.substring(0, 60) + "..." : text;
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
		1: "#6b7280", // gray
		2: "#22c55e", // green
		3: "#3b82f6", // blue
		4: "#a855f7", // purple
		5: "#f59e0b", // amber
	};
	return colors[tier] || "#6b7280";
}

// Watch for newly forged abilities and add them to the list
watch(
	() => forgeStore.forgedAbility,
	(newAbility) => {
		if (newAbility) {
			const exists = skills.value.some((s) => s.ability_id === newAbility.ability_id);
			if (!exists) {
				skills.value.unshift(newAbility);
			}
		}
	},
);

onMounted(() => {
	loadSkills();
});
</script>

<style scoped>
.slide-fade-enter-active {
	transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
	transition: all 0.15s ease-in;
}

.slide-fade-enter-from {
	opacity: 0;
	transform: translateX(10px);
}

.slide-fade-leave-to {
	opacity: 0;
	transform: translateX(-10px);
}
</style>
