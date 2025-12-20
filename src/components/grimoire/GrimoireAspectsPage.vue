<template>
	<div class="grid grid-cols-2 gap-6 h-full">
		<!-- Left Page: List -->
		<div class="flex flex-col">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold">Aspects Library</h3>
				<Button variant="outline" size="sm" @click="handleCreate" class="gap-2">
					<Icon icon="radix-icons:plus" class="h-4 w-4" />
					New Aspect
				</Button>
			</div>

			<div class="flex-1 overflow-auto border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Hash</TableHead>
							<TableHead class="w-16">Tier</TableHead>
							<TableHead class="w-20">Weight</TableHead>
							<TableHead class="w-16 text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow v-for="aspect in aspects" :key="aspect._id" class="cursor-pointer" :class="{ 'bg-accent': selectedId === aspect._id }" @click="selectAspect(aspect)">
							<TableCell class="font-mono text-sm">{{ aspect.hash }}</TableCell>
							<TableCell>{{ aspect.tier }}</TableCell>
							<TableCell>{{ aspect.weight }}</TableCell>
							<TableCell class="text-right">
								<Button variant="ghost" size="icon-sm" @click.stop="handleDelete(aspect._id)">
									<Icon icon="radix-icons:trash" class="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
						<TableEmpty v-if="aspects.length === 0" :colspan="4">
							<div class="py-8 text-center text-muted-foreground">No aspects found. Create your first aspect!</div>
						</TableEmpty>
					</TableBody>
				</Table>
			</div>

			<div v-if="loading" class="mt-2 text-sm text-muted-foreground">Loading...</div>
			<div v-if="error" class="mt-2 text-sm text-destructive">{{ error }}</div>
		</div>

		<!-- Right Page: Form -->
		<div class="flex flex-col overflow-auto">
			<h3 class="text-lg font-semibold mb-4">
				{{ isEditing ? "Edit Aspect" : "New Aspect" }}
			</h3>

			<form @submit.prevent="handleSubmit" class="space-y-4">
				<!-- Core Info -->
				<div class="space-y-2">
					<Label for="hash">Hash (Unique ID) <span class="text-destructive">*</span></Label>
					<Input id="hash" v-model="form.hash" placeholder="ASPECT_FIRE_DMG" :class="{ 'border-destructive': validationErrors.hash }" />
					<p v-if="validationErrors.hash" class="text-xs text-destructive">{{ validationErrors.hash }}</p>
				</div>

				<div class="grid grid-cols-3 gap-2">
					<div class="space-y-2">
						<Label for="tier">Tier <span class="text-destructive">*</span></Label>
						<Select v-model="formTier">
							<SelectTrigger>
								<SelectValue placeholder="Tier" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem v-for="t in [1, 2, 3, 4]" :key="t" :value="String(t)">{{ t }}</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div class="space-y-2">
						<Label for="weight">Weight <span class="text-destructive">*</span></Label>
						<Input id="weight" v-model.number="form.weight" type="number" :class="{ 'border-destructive': validationErrors.weight }" />
						<p v-if="validationErrors.weight" class="text-xs text-destructive">{{ validationErrors.weight }}</p>
					</div>
					<div class="space-y-2">
						<Label for="potency">Potency</Label>
						<Input id="potency" v-model.number="form.potency" type="number" step="0.1" />
					</div>
				</div>

				<!-- Rune IDs -->
				<div class="space-y-2">
					<Label for="rune_ids">Rune IDs (comma-separated)</Label>
					<Input id="rune_ids" v-model="runeIdsStr" placeholder="1, 2, 3" />
				</div>

				<Separator />

				<!-- Properties (Flags) -->
				<div class="space-y-2">
					<Label class="text-muted-foreground">Properties</Label>
					<div class="grid grid-cols-2 gap-2 text-sm max-h-40 overflow-auto">
						<div v-for="(val, key) in form.properties" :key="key" class="flex items-center gap-2">
							<Switch :checked="val === 1" @update:checked="(v: boolean) => (form.properties[key] = v ? 1 : 0)" />
							<span class="capitalize">{{ formatKey(key) }}</span>
						</div>
					</div>
				</div>

				<Separator />

				<div class="flex justify-end gap-2">
					<Button variant="outline" type="button" @click="resetForm">Cancel</Button>
					<Button type="submit" :disabled="saving || !isFormValid">
						{{ saving ? "Saving..." : "Save" }}
					</Button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AspectsAPI } from "@/api/aspects.api";
import { AspectModel, AspectCreationData } from "@/common/aspect.types";

const api = new AspectsAPI();

// State
const aspects = ref<AspectModel[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const selectedId = ref<string | null>(null);

// Default properties
const defaultProps = {
	is_damage: 0,
	is_typed: 0,
	is_convert: 0,
	is_percent: 0,
	is_duration: 0,
	is_range: 0,
	hit_count: 0,
	cooldown: 0,
	wait_turns: 0,
	is_stun: 0,
	is_slow: 0,
	is_retaliate: 0,
	is_silence: 0,
	is_sleep: 0,
	is_taunt: 0,
	is_fear: 0,
	is_confuse: 0,
	is_charm: 0,
	is_heal: 0,
	is_frenzy: 0,
};

// Form
const form = ref<AspectCreationData>({
	hash: "",
	tier: 1,
	weight: 100,
	potency: 1.0,
	rune_ids: [],
	required_rune_ids: [],
	blocked_aspect_ids: [],
	properties: { ...defaultProps },
});

// Helper for rune IDs input
const runeIdsStr = computed({
	get: () => form.value.rune_ids.join(", "),
	set: (val) => {
		form.value.rune_ids = val
			.split(",")
			.map((s) => parseInt(s.trim(), 10))
			.filter((n) => !isNaN(n));
	},
});

// Select workaround
const formTier = computed({
	get: () => String(form.value.tier),
	set: (val) => {
		form.value.tier = parseInt(val, 10) as 1 | 2 | 3 | 4;
	},
});

const isEditing = computed(() => selectedId.value !== null);

// Validation
const validationErrors = computed(() => {
	const errors: { hash?: string; weight?: string } = {};
	if (!form.value.hash || form.value.hash.trim().length === 0) {
		errors.hash = "Hash is required";
	} else if (form.value.hash.trim().length < 3) {
		errors.hash = "Hash must be at least 3 characters";
	} else if (!/^[A-Z_]+$/i.test(form.value.hash)) {
		errors.hash = "Hash should use UPPER_SNAKE_CASE";
	}
	if (form.value.weight === undefined || form.value.weight === null) {
		errors.weight = "Weight is required";
	} else if (form.value.weight <= 0) {
		errors.weight = "Weight must be greater than 0";
	}
	return errors;
});

const isFormValid = computed(() => Object.keys(validationErrors.value).length === 0);

// Format property key for display
function formatKey(key: string): string {
	return key.replace("is_", "").replace("_", " ");
}

// Load aspects
async function loadAspects() {
	loading.value = true;
	error.value = null;
	try {
		aspects.value = await api.findAll();
	} catch (e: any) {
		error.value = e.message || "Failed to load aspects";
	} finally {
		loading.value = false;
	}
}

// Select aspect for editing
function selectAspect(aspect: AspectModel) {
	selectedId.value = aspect._id;
	form.value = {
		hash: aspect.hash,
		tier: aspect.tier as 1 | 2 | 3 | 4,
		weight: aspect.weight,
		potency: aspect.potency,
		rune_ids: [...aspect.rune_ids],
		required_rune_ids: [...aspect.required_rune_ids],
		blocked_aspect_ids: [...aspect.blocked_aspect_ids],
		properties: { ...aspect.properties },
	};
}

// Create new
function handleCreate() {
	resetForm();
}

// Reset form
function resetForm() {
	selectedId.value = null;
	form.value = {
		hash: "",
		tier: 1,
		weight: 100,
		potency: 1.0,
		rune_ids: [],
		required_rune_ids: [],
		blocked_aspect_ids: [],
		properties: { ...defaultProps },
	};
}

// Submit
async function handleSubmit() {
	saving.value = true;
	try {
		if (selectedId.value) {
			await api.update({ id: selectedId.value, ...form.value });
		} else {
			await api.create(form.value);
		}
		await loadAspects();
		resetForm();
	} catch (e: any) {
		error.value = e.message || "Failed to save";
	} finally {
		saving.value = false;
	}
}

// Delete
async function handleDelete(id: string) {
	if (!confirm("Delete this aspect?")) return;
	try {
		await api.delete(id);
		if (selectedId.value === id) resetForm();
		await loadAspects();
	} catch (e: any) {
		error.value = e.message || "Failed to delete";
	}
}

onMounted(() => {
	loadAspects();
});
</script>
