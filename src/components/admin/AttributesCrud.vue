<template>
	<div class="space-y-4">
		<!-- Header with Create button -->
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-medium text-muted-foreground">{{ attributes.length }} attributes</h3>
			<Button @click="showCreateForm = true" size="sm" :disabled="showCreateForm">
				<Plus class="h-4 w-4 mr-1" />
				New Attribute
			</Button>
		</div>

		<!-- Error message -->
		<div v-if="error" class="text-destructive text-sm bg-destructive/10 p-2 rounded">
			{{ error }}
		</div>

		<!-- Create/Edit Form (inline collapsible) -->
		<div v-if="showCreateForm || editingAttribute" class="border rounded-lg p-4 space-y-4 bg-muted/30">
			<div class="flex items-center justify-between">
				<h4 class="font-medium">{{ editingAttribute ? "Edit Attribute" : "Create Attribute" }}</h4>
				<Button variant="ghost" size="icon" class="h-6 w-6" @click="closeForm">
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="grid gap-3">
				<div class="space-y-1.5">
					<Label for="attribute-name">Name</Label>
					<Input id="attribute-name" v-model="formData.name" placeholder="e.g. Fire, Physical, Melee" />
				</div>

				<div class="space-y-1.5">
					<Label for="attribute-weight">Weight</Label>
					<Input id="attribute-weight" v-model.number="formData.weight" type="number" step="0.1" placeholder="1.0" />
					<p class="text-xs text-muted-foreground">Higher = more common in generation (0.1 - 1.0)</p>
				</div>
			</div>

			<div class="flex gap-2 pt-2">
				<Button @click="handleSubmit" :disabled="saving" size="sm">
					{{ saving ? "Saving..." : editingAttribute ? "Update" : "Create" }}
				</Button>
				<Button variant="outline" @click="closeForm" size="sm">Cancel</Button>
			</div>
		</div>

		<!-- Loading state -->
		<div v-if="loading" class="text-center py-8 text-muted-foreground">Loading attributes...</div>

		<!-- Attributes Table -->
		<Table v-else-if="attributes.length > 0">
			<TableHeader>
				<TableRow>
					<TableHead class="w-16">ID</TableHead>
					<TableHead>Name</TableHead>
					<TableHead class="w-24">Weight</TableHead>
					<TableHead class="w-24 text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow v-for="attribute in attributes" :key="attribute._id">
					<TableCell class="font-mono text-xs">{{ attribute.attribute_id }}</TableCell>
					<TableCell>{{ attribute.name }}</TableCell>
					<TableCell>{{ attribute.weight }}</TableCell>
					<TableCell class="text-right">
						<div class="flex gap-1 justify-end">
							<Button variant="ghost" size="icon" class="h-7 w-7" @click="startEdit(attribute)">
								<Pencil class="h-3.5 w-3.5" />
							</Button>
							<Button variant="ghost" size="icon" class="h-7 w-7 text-destructive" @click="handleDelete(attribute)">
								<Trash2 class="h-3.5 w-3.5" />
							</Button>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>

		<!-- Empty state -->
		<div v-else class="text-center py-8 text-muted-foreground">No attributes found. Create one to get started.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { Plus, Pencil, Trash2, X } from "lucide-vue-next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { AttributesAPI } from "@/api/attributes.api";
import type { AttributeModel } from "@/common/attribute.types";

const attributesApi = new AttributesAPI();

const attributes = ref<AttributeModel[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const showCreateForm = ref(false);
const editingAttribute = ref<AttributeModel | null>(null);

const formData = reactive({
	name: "",
	weight: 1.0,
});

async function refresh() {
	try {
		attributes.value = await attributesApi.findAll();
		error.value = null;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load attributes";
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
	editingAttribute.value = null;
	resetForm();
}

function startEdit(attribute: AttributeModel) {
	editingAttribute.value = attribute;
	showCreateForm.value = false;
	formData.name = attribute.name;
	formData.weight = attribute.weight;
}

async function handleSubmit() {
	if (!formData.name.trim()) {
		error.value = "Name is required";
		return;
	}

	saving.value = true;
	error.value = null;

	try {
		if (editingAttribute.value) {
			await attributesApi.update({
				id: editingAttribute.value._id,
				name: formData.name,
				weight: formData.weight,
			});
		} else {
			await attributesApi.create({
				name: formData.name,
				weight: formData.weight,
			});
		}
		await refresh();
		closeForm();
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to save attribute";
	} finally {
		saving.value = false;
	}
}

async function handleDelete(attribute: AttributeModel) {
	if (!confirm(`Delete attribute "${attribute.name}"?`)) return;

	try {
		await attributesApi.delete(attribute._id);
		await refresh();
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to delete attribute";
	}
}
</script>
