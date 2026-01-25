<template>
	<div class="space-y-4">
		<!-- Header with Create button -->
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-medium text-muted-foreground">{{ affixes.length }} affixes</h3>
			<Button @click="showCreateForm = true" size="sm" :disabled="showCreateForm || attributesLoading">
				<Plus class="h-4 w-4 mr-1" />
				New Affix
			</Button>
		</div>

		<!-- Error message -->
		<div v-if="error" class="text-destructive text-sm bg-destructive/10 p-2 rounded">
			{{ error }}
		</div>

		<!-- Create/Edit Form (inline collapsible) -->
		<div v-if="showCreateForm || editingAffix" class="border rounded-lg p-4 space-y-4 bg-muted/30">
			<div class="flex items-center justify-between">
				<h4 class="font-medium">{{ editingAffix ? "Edit Affix" : "Create Affix" }}</h4>
				<Button variant="ghost" size="icon" class="h-6 w-6" @click="closeForm">
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="grid gap-3">
				<!-- Hash -->
				<div class="space-y-1.5">
					<Label for="affix-hash">Hash (identifier)</Label>
					<Input id="affix-hash" v-model="formData.hash" placeholder="e.g., fire_damage_instant" />
				</div>

				<!-- Tier -->
				<div class="space-y-1.5">
					<Label for="affix-tier">Tier</Label>
					<Select v-model="formData.tier">
						<SelectTrigger>
							<SelectValue placeholder="Select tier" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1">Tier 1</SelectItem>
							<SelectItem value="2">Tier 2</SelectItem>
							<SelectItem value="3">Tier 3</SelectItem>
							<SelectItem value="4">Tier 4</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<!-- Weight & Potency -->
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<Label for="affix-weight">Weight</Label>
						<Input id="affix-weight" v-model.number="formData.weight" type="number" placeholder="100" />
					</div>
					<div class="space-y-1.5">
						<Label for="affix-potency">Potency</Label>
						<Input id="affix-potency" v-model.number="formData.potency" type="number" placeholder="1" />
					</div>
				</div>

				<!-- Attribute IDs (multi-select with checkboxes) -->
				<div class="space-y-1.5">
					<Label>Associated Attributes</Label>
					<div v-if="attributesLoading" class="text-sm text-muted-foreground">Loading attributes...</div>
					<div v-else class="border rounded p-2 max-h-32 overflow-y-auto space-y-1">
						<label v-for="attribute in availableAttributes" :key="attribute._id" class="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
							<input type="checkbox" :value="attribute.attribute_id" v-model="formData.attribute_ids" class="rounded border-input" />
							{{ attribute.name }}
							<span class="text-xs text-muted-foreground">({{ attribute.attribute_id }})</span>
						</label>
					</div>
				</div>
			</div>

			<div class="flex gap-2 pt-2">
				<Button @click="handleSubmit" :disabled="saving" size="sm">
					{{ saving ? "Saving..." : editingAffix ? "Update" : "Create" }}
				</Button>
				<Button variant="outline" @click="closeForm" size="sm">Cancel</Button>
			</div>
		</div>

		<!-- Loading state -->
		<div v-if="loading" class="text-center py-8 text-muted-foreground">Loading affixes...</div>

		<!-- Affixes Table -->
		<Table v-else-if="affixes.length > 0">
			<TableHeader>
				<TableRow>
					<TableHead class="w-16">ID</TableHead>
					<TableHead>Hash</TableHead>
					<TableHead class="w-16">Tier</TableHead>
					<TableHead class="w-20">Weight</TableHead>
					<TableHead>Attributes</TableHead>
					<TableHead class="w-24 text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow v-for="affix in affixes" :key="affix._id">
					<TableCell class="font-mono text-xs">{{ affix.affix_id }}</TableCell>
					<TableCell class="font-mono text-xs">{{ affix.hash }}</TableCell>
					<TableCell>{{ affix.tier }}</TableCell>
					<TableCell>{{ affix.weight }}</TableCell>
					<TableCell>
						<div class="flex flex-wrap gap-1">
							<span v-for="attributeId in affix.attribute_ids" :key="attributeId" class="text-xs bg-muted px-1.5 py-0.5 rounded">
								{{ getAttributeName(attributeId) }}
							</span>
						</div>
					</TableCell>
					<TableCell class="text-right">
						<div class="flex gap-1 justify-end">
							<Button variant="ghost" size="icon" class="h-7 w-7" @click="startEdit(affix)">
								<Pencil class="h-3.5 w-3.5" />
							</Button>
							<Button variant="ghost" size="icon" class="h-7 w-7 text-destructive" @click="handleDelete(affix)">
								<Trash2 class="h-3.5 w-3.5" />
							</Button>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>

		<!-- Empty state -->
		<div v-else class="text-center py-8 text-muted-foreground">No affixes found. Create one to get started.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { Plus, Pencil, Trash2, X } from "lucide-vue-next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { AffixesAPI } from "@/api/affixes.api";
import { AttributesAPI } from "@/api/attributes.api";
import type { AffixModel } from "@/common/affix.types";
import type { AttributeModel } from "@/common/attribute.types";

const affixesApi = new AffixesAPI();
const attributesApi = new AttributesAPI();

const affixes = ref<AffixModel[]>([]);
const availableAttributes = ref<AttributeModel[]>([]);
const loading = ref(true);
const attributesLoading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const showCreateForm = ref(false);
const editingAffix = ref<AffixModel | null>(null);

const formData = reactive({
	hash: "",
	tier: "1",
	weight: 100,
	potency: 1,
	attribute_ids: [] as number[],
});

async function refresh() {
	try {
		affixes.value = await affixesApi.findAll();
		error.value = null;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load affixes";
	}
}

async function loadAttributes() {
	try {
		availableAttributes.value = await attributesApi.findAll();
	} catch (e) {
		console.error("Failed to load attributes:", e);
	} finally {
		attributesLoading.value = false;
	}
}

onMounted(async () => {
	await Promise.all([refresh(), loadAttributes()]);
	loading.value = false;
});

function getAttributeName(attributeId: number): string {
	const attribute = availableAttributes.value.find((a) => a.attribute_id === attributeId);
	return attribute?.name ?? String(attributeId);
}

function resetForm() {
	formData.hash = "";
	formData.tier = "1";
	formData.weight = 100;
	formData.potency = 1;
	formData.attribute_ids = [];
}

function closeForm() {
	showCreateForm.value = false;
	editingAffix.value = null;
	resetForm();
}

function startEdit(affix: AffixModel) {
	editingAffix.value = affix;
	showCreateForm.value = false;
	formData.hash = affix.hash;
	formData.tier = String(affix.tier);
	formData.weight = affix.weight;
	formData.potency = affix.potency;
	formData.attribute_ids = [...affix.attribute_ids];
}

async function handleSubmit() {
	if (!formData.hash.trim()) {
		error.value = "Hash is required";
		return;
	}
	if (formData.attribute_ids.length === 0) {
		error.value = "At least one attribute must be selected";
		return;
	}

	saving.value = true;
	error.value = null;

	try {
		if (editingAffix.value) {
			await affixesApi.update({
				id: editingAffix.value._id,
				hash: formData.hash,
				tier: Number(formData.tier) as 1 | 2 | 3 | 4,
				weight: formData.weight,
				potency: formData.potency,
				attribute_ids: formData.attribute_ids,
				required_attribute_ids: [],
				blocked_affix_ids: [],
			});
		} else {
			await affixesApi.create({
				hash: formData.hash,
				tier: Number(formData.tier) as 1 | 2 | 3 | 4,
				weight: formData.weight,
				potency: formData.potency,
				attribute_ids: formData.attribute_ids,
				required_attribute_ids: [],
				blocked_affix_ids: [],
			});
		}
		await refresh();
		closeForm();
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to save affix";
	} finally {
		saving.value = false;
	}
}

async function handleDelete(affix: AffixModel) {
	if (!confirm(`Delete affix "${affix.hash}"?`)) return;

	try {
		await affixesApi.delete(affix._id);
		await refresh();
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to delete affix";
	}
}
</script>
