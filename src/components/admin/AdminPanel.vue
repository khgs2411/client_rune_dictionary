<template>
	<Sheet v-model:open="modelValue" @update:open="$emit('update:open', $event)">
		<SheetContent side="right" class="w-[500px] sm:max-w-xl overflow-y-auto" @wheel.stop>
			<SheetHeader>
				<SheetTitle class="text-primary flex items-center gap-2">
					<Database class="h-5 w-5" />
					Admin Panel
				</SheetTitle>
				<SheetDescription>Manage game data: Runes and Aspects</SheetDescription>
			</SheetHeader>

			<div class="py-4">
				<Tabs v-model="activeTab" class="w-full">
					<TabsList class="grid w-full grid-cols-2">
						<TabsTrigger value="runes">Runes</TabsTrigger>
						<TabsTrigger value="aspects">Aspects</TabsTrigger>
					</TabsList>
					<TabsContent value="runes" class="mt-4">
						<RunesCrud />
					</TabsContent>
					<TabsContent value="aspects" class="mt-4">
						<AspectsCrud />
					</TabsContent>
				</Tabs>
			</div>
		</SheetContent>
	</Sheet>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Database } from "lucide-vue-next";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RunesCrud from "./RunesCrud.vue";
import AspectsCrud from "./AspectsCrud.vue";

const modelValue = defineModel<boolean>("open", { default: false });
const activeTab = ref("runes");
</script>
