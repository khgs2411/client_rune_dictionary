<template>
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between mb-4">
			<div>
				<h3 class="text-lg font-semibold">Skill Forge</h3>
				<p class="text-sm text-muted-foreground">Select attributes to generate a new skill</p>
			</div>
			<Button @click="generateSkill" :disabled="generating || selectedAttributes.length === 0" class="gap-2">
				<Icon v-if="generating" icon="radix-icons:update" class="h-4 w-4 animate-spin" />
				<Icon v-else icon="game-icons:magic-swirl" class="h-4 w-4" />
				{{ generating ? "Forging..." : "Forge Skill" }}
			</Button>
		</div>

		<div class="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
			<!-- Left: Attribute Selection -->
			<div class="flex flex-col gap-4">
				<div class="border rounded-lg p-4 space-y-4 flex-1 overflow-auto">
					<h4 class="font-medium flex items-center gap-2">
						<Icon icon="game-icons:fire-gem" class="h-4 w-4 text-primary" />
						Select Attributes ({{ selectedAttributes.length }})
					</h4>
					<p class="text-xs text-muted-foreground">Choose 1 or more attributes to influence skill generation</p>

					<div v-if="runesLoading" class="text-sm text-muted-foreground">Loading attributes...</div>
					<div v-else-if="runes.length === 0" class="text-sm text-muted-foreground">No attributes available. Seed the database first.</div>
					<div v-else class="grid grid-cols-2 gap-2">
						<label
							v-for="attr in runes"
							:key="attr._id"
							class="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
							:class="{ 'bg-primary/10 border-primary': selectedAttributes.includes(attr.attribute_id) }">
							<input type="checkbox" :value="attr.attribute_id" v-model="selectedAttributes" class="rounded" />
							<span class="flex-1 text-sm">{{ attr.name }}</span>
							<span class="text-xs text-muted-foreground">{{ attr.weight }}</span>
						</label>
					</div>
				</div>
			</div>

			<!-- Right: Owned Skills -->
			<div class="flex flex-col gap-4">
				<div class="border rounded-lg p-4 flex-1 overflow-auto">
					<h4 class="font-medium mb-4 flex items-center gap-2">
						<Icon icon="game-icons:scroll-unfurled" class="h-4 w-4 text-primary" />
						Your Skills ({{ skills.length }})
					</h4>

					<div v-if="skillsLoading" class="text-center py-8 text-muted-foreground">Loading skills...</div>

					<div v-else-if="skills.length === 0" class="text-center py-8 text-muted-foreground">
						<Icon icon="game-icons:empty-hourglass" class="h-12 w-12 mx-auto mb-2 opacity-50" />
						<p>No skills yet</p>
						<p class="text-xs">Forge your first skill to get started</p>
					</div>

					<div v-else class="space-y-2">
						<div
							v-for="skill in skills"
							:key="skill.ability_id"
							class="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
							:class="{ 'ring-2 ring-primary': selectedSkill?.ability_id === skill.ability_id }"
							@click="selectedSkill = skill">
							<div class="flex items-center justify-between">
								<span class="font-medium">{{ skill.name }}</span>
								<span class="text-xs px-2 py-0.5 bg-primary/20 rounded">Tier {{ skill.tier }}</span>
							</div>
							<p v-if="skill.description" class="text-xs text-muted-foreground mt-1">{{ skill.description }}</p>
						</div>
					</div>
				</div>

				<!-- Skill Detail Panel -->
				<div v-if="selectedSkill" class="border rounded-lg p-4 bg-muted/30 max-h-64 overflow-auto">
					<div class="flex items-center justify-between mb-3">
						<h4 class="font-medium">{{ selectedSkill.name }}</h4>
						<Button variant="ghost" size="icon" class="h-6 w-6" @click="selectedSkill = null">
							<Icon icon="radix-icons:cross-2" class="h-3 w-3" />
						</Button>
					</div>

					<div class="space-y-2">
						<div v-for="(slot, index) in Object.entries(selectedSkill.slots)" :key="index" class="text-sm p-2 bg-background/50 rounded">
							<div class="flex items-center gap-2">
								<span class="text-xs text-muted-foreground">Slot {{ slot[0] }}:</span>
								<span>{{ slot[1].text }}</span>
							</div>
							<div v-if="slot[1].effects && slot[1].effects.length > 0" class="mt-1 pl-4 text-xs text-muted-foreground">
								<div v-for="(effect, ei) in slot[1].effects" :key="ei">{{ effect.type }} - {{ effect.action }}</div>
							</div>
						</div>
					</div>

					<div class="mt-3 flex gap-2 text-xs text-muted-foreground">
						<span>Affixes: {{ selectedSkill.affixes.join(", ") }}</span>
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
import { AttributesAPI } from "@/api/attributes.api";
import { SkillsAPI } from "@/api/skills.api";
import { useAuthStore } from "@/stores/auth.store";
import type { AttributeModel } from "@/common/attribute.types";
import type { AbilityModel } from "@/common/ability.types";

const attributesApi = new AttributesAPI();
const skillsApi = new SkillsAPI();
const authStore = useAuthStore();

// Data
const runes = ref<AttributeModel[]>([]);
const skills = ref<AbilityModel[]>([]);
const runesLoading = ref(true);
const skillsLoading = ref(true);
const generating = ref(false);
const error = ref<string | null>(null);

// Selection state
const selectedAttributes = ref<number[]>([]);
const selectedSkill = ref<AbilityModel | null>(null);

async function loadRunes() {
	try {
		runes.value = await attributesApi.findAll();
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load attributes";
	} finally {
		runesLoading.value = false;
	}
}

async function loadSkills() {
	try {
		skills.value = await skillsApi.findByUser(authStore.username);
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load skills";
	} finally {
		skillsLoading.value = false;
	}
}

async function generateSkill() {
	if (selectedAttributes.value.length === 0) return;

	generating.value = true;
	error.value = null;

	try {
		const newSkill = await skillsApi.generate(authStore.username, selectedAttributes.value);
		skills.value.unshift(newSkill);
		selectedSkill.value = newSkill;
		selectedAttributes.value = [];
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to generate skill";
	} finally {
		generating.value = false;
	}
}

onMounted(() => {
	loadRunes();
	loadSkills();
});
</script>
