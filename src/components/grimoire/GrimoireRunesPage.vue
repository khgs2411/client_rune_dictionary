<template>
	<div class="grid grid-cols-2 gap-6 h-full">
		<!-- Left Page: List -->
		<div class="flex flex-col">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold">Runes Library</h3>
				<Button variant="outline" size="sm" @click="handleCreate" class="gap-2">
					<Icon icon="radix-icons:plus" class="h-4 w-4" />
					New Rune
				</Button>
			</div>

			<div class="flex-1 overflow-auto border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead class="w-20">Weight</TableHead>
							<TableHead class="w-16">Type</TableHead>
							<TableHead class="w-16 text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow v-for="rune in runes" :key="rune._id" class="cursor-pointer" :class="{ 'bg-accent': selectedId === rune._id }" @click="selectRune(rune)">
							<TableCell class="font-medium">{{ rune.name }}</TableCell>
							<TableCell>{{ rune.weight }}</TableCell>
							<TableCell>{{ rune.type }}</TableCell>
							<TableCell class="text-right">
								<Button variant="ghost" size="icon-sm" @click.stop="handleDelete(rune._id)">
									<Icon icon="radix-icons:trash" class="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
						<TableEmpty v-if="runes.length === 0" :colspan="4">
							<div class="py-8 text-center text-muted-foreground">No runes found. Create your first rune!</div>
						</TableEmpty>
					</TableBody>
				</Table>
			</div>

			<div v-if="loading" class="mt-2 text-sm text-muted-foreground">Loading...</div>
			<div v-if="error" class="mt-2 text-sm text-destructive">{{ error }}</div>
		</div>

		<!-- Right Page: Form -->
		<div class="flex flex-col">
			<h3 class="text-lg font-semibold mb-4">
				{{ isEditing ? "Edit Rune" : "New Rune" }}
			</h3>

			<form @submit.prevent="handleSubmit" class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input id="name" v-model="form.name" placeholder="e.g. Fire" />
				</div>

				<div class="space-y-2">
					<Label for="weight">Weight</Label>
					<Input id="weight" v-model.number="form.weight" type="number" placeholder="100" />
				</div>

				<div class="space-y-2">
					<Label for="type">Type</Label>
					<Select v-model="formType">
						<SelectTrigger>
							<SelectValue placeholder="Select type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1">Elemental</SelectItem>
							<SelectItem value="2">Physical</SelectItem>
							<SelectItem value="3">Arcane</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Separator class="my-4" />

				<div class="flex justify-end gap-2">
					<Button variant="outline" type="button" @click="resetForm">Cancel</Button>
					<Button type="submit" :disabled="saving">
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RunesAPI } from "@/api/runes.api";
import { RuneModel, RuneCreationData } from "@/common/rune.types";

const api = new RunesAPI();

// State
const runes = ref<RuneModel[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const selectedId = ref<string | null>(null);

// Form
const form = ref<RuneCreationData>({
	name: "",
	weight: 100,
	type: 1,
});

// Select workaround (needs string value)
const formType = computed({
	get: () => String(form.value.type),
	set: (val) => {
		form.value.type = parseInt(val, 10);
	},
});

const isEditing = computed(() => selectedId.value !== null);

// Load runes
async function loadRunes() {
	loading.value = true;
	error.value = null;
	try {
		runes.value = await api.findAll();
	} catch (e: any) {
		error.value = e.message || "Failed to load runes";
	} finally {
		loading.value = false;
	}
}

// Select a rune for editing
function selectRune(rune: RuneModel) {
	selectedId.value = rune._id;
	form.value = {
		name: rune.name,
		weight: rune.weight,
		type: rune.type,
	};
}

// Create new
function handleCreate() {
	resetForm();
}

// Reset form
function resetForm() {
	selectedId.value = null;
	form.value = { name: "", weight: 100, type: 1 };
}

// Submit (create or update)
async function handleSubmit() {
	saving.value = true;
	try {
		if (selectedId.value) {
			await api.update({ id: selectedId.value, ...form.value });
		} else {
			await api.create(form.value);
		}
		await loadRunes();
		resetForm();
	} catch (e: any) {
		error.value = e.message || "Failed to save";
	} finally {
		saving.value = false;
	}
}

// Delete
async function handleDelete(id: string) {
	if (!confirm("Delete this rune?")) return;
	try {
		await api.delete(id);
		if (selectedId.value === id) resetForm();
		await loadRunes();
	} catch (e: any) {
		error.value = e.message || "Failed to delete";
	}
}

onMounted(() => {
	loadRunes();
});
</script>
