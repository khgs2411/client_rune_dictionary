<template>
	<div class="space-y-4">
		<!-- Header with Create button -->
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-medium text-muted-foreground">{{ runes.length }} runes</h3>
			<Button @click="showCreateForm = true" size="sm" :disabled="showCreateForm">
				<Plus class="h-4 w-4 mr-1" />
				New Rune
			</Button>
		</div>

		<!-- Error message -->
		<div v-if="error" class="text-destructive text-sm bg-destructive/10 p-2 rounded">
			{{ error }}
		</div>

		<!-- Create/Edit Form (inline collapsible) -->
		<div v-if="showCreateForm || editingRune" class="border rounded-lg p-4 space-y-4 bg-muted/30">
			<div class="flex items-center justify-between">
				<h4 class="font-medium">{{ editingRune ? "Edit Rune" : "Create Rune" }}</h4>
				<Button variant="ghost" size="icon" class="h-6 w-6" @click="closeForm">
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="grid gap-3">
				<div class="space-y-1.5">
					<Label for="rune-name">Name</Label>
					<Input id="rune-name" v-model="formData.name" placeholder="e.g. Fire, Physical, Melee" />
				</div>

				<div class="space-y-1.5">
					<Label for="rune-weight">Weight</Label>
					<Input id="rune-weight" v-model.number="formData.weight" type="number" step="0.1" placeholder="1.0" />
					<p class="text-xs text-muted-foreground">Higher = more common in generation (0.1 - 1.0)</p>
				</div>
			</div>

			<div class="flex gap-2 pt-2">
				<Button @click="handleSubmit" :disabled="saving" size="sm">
					{{ saving ? "Saving..." : editingRune ? "Update" : "Create" }}
				</Button>
				<Button variant="outline" @click="closeForm" size="sm">Cancel</Button>
			</div>
		</div>

		<!-- Loading state -->
		<div v-if="loading" class="text-center py-8 text-muted-foreground">Loading runes...</div>

		<!-- Runes Table -->
		<Table v-else-if="runes.length > 0">
			<TableHeader>
				<TableRow>
					<TableHead class="w-16">ID</TableHead>
					<TableHead>Name</TableHead>
					<TableHead class="w-24">Weight</TableHead>
					<TableHead class="w-24 text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow v-for="rune in runes" :key="rune._id">
					<TableCell class="font-mono text-xs">{{ rune.rune_id }}</TableCell>
					<TableCell>{{ rune.name }}</TableCell>
					<TableCell>{{ rune.weight }}</TableCell>
					<TableCell class="text-right">
						<div class="flex gap-1 justify-end">
							<Button variant="ghost" size="icon" class="h-7 w-7" @click="startEdit(rune)">
								<Pencil class="h-3.5 w-3.5" />
							</Button>
							<Button variant="ghost" size="icon" class="h-7 w-7 text-destructive" @click="handleDelete(rune)">
								<Trash2 class="h-3.5 w-3.5" />
							</Button>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>

		<!-- Empty state -->
		<div v-else class="text-center py-8 text-muted-foreground">No runes found. Create one to get started.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { Plus, Pencil, Trash2, X } from "lucide-vue-next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { RunesAPI } from "@/api/runes.api";
import type { RuneModel } from "@/common/rune.types";

const runesApi = new RunesAPI();

const runes = ref<RuneModel[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const showCreateForm = ref(false);
const editingRune = ref<RuneModel | null>(null);

const formData = reactive({
	name: "",
	weight: 1.0,
});

async function refresh() {
	try {
		runes.value = await runesApi.findAll();
		error.value = null;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load runes";
	}
}

onMounted(async () => {
	await refresh();
	loading.value = false;
});

function resetForm() {
	formData.name = "";
	formData.weight = 1.0;
}

function closeForm() {
	showCreateForm.value = false;
	editingRune.value = null;
	resetForm();
}

function startEdit(rune: RuneModel) {
	editingRune.value = rune;
	showCreateForm.value = false;
	formData.name = rune.name;
	formData.weight = rune.weight;
}

async function handleSubmit() {
	if (!formData.name.trim()) {
		error.value = "Name is required";
		return;
	}

	saving.value = true;
	error.value = null;

	try {
		if (editingRune.value) {
			await runesApi.update({
				id: editingRune.value._id,
				name: formData.name,
				weight: formData.weight,
			});
		} else {
			await runesApi.create({
				name: formData.name,
				weight: formData.weight,
			});
		}
		await refresh();
		closeForm();
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to save rune";
	} finally {
		saving.value = false;
	}
}

async function handleDelete(rune: RuneModel) {
	if (!confirm(`Delete rune "${rune.name}"?`)) return;

	try {
		await runesApi.delete(rune._id);
		await refresh();
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to delete rune";
	}
}
</script>
