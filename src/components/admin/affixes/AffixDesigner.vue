<template>
	<div class="h-full grid grid-cols-[280px_1fr] gap-6">
		<AffixList @unsaved-warning="showUnsavedWarning = true" />
		<AffixEditor v-if="store.selectedId || store.draft" />
		<div v-else class="flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/10">
			<div class="text-center">
				<Icon icon="game-icons:scroll-unfurled" class="h-12 w-12 mx-auto mb-3 opacity-20" />
				<p class="text-sm">Select an affix to edit</p>
				<p class="text-xs mt-1 opacity-70">or create a new one</p>
			</div>
		</div>

		<!-- Unsaved Changes Dialog -->
		<div
			v-if="showUnsavedWarning"
			class="fixed inset-0 z-30 flex items-center justify-center bg-black/50"
			@click.self="showUnsavedWarning = false">
			<div class="bg-background border rounded-lg p-6 shadow-xl max-w-sm">
				<h3 class="font-bold mb-2">Unsaved Changes</h3>
				<p class="text-sm text-muted-foreground mb-4">You have unsaved changes. Do you want to discard them?</p>
				<div class="flex gap-2 justify-end">
					<Button variant="outline" @click="showUnsavedWarning = false">Cancel</Button>
					<Button variant="destructive" @click="handleDiscard">Discard</Button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { useAffixesStore } from "@/stores/affixes.store";
import AffixList from "./AffixList.vue";
import AffixEditor from "./AffixEditor.vue";

const store = useAffixesStore();
const showUnsavedWarning = ref(false);

onMounted(async () => {
	await Promise.all([store.loadAffixes(), store.loadContextTokens(), store.loadAttributes()]);
});

function handleDiscard() {
	store.discardChanges();
	showUnsavedWarning.value = false;
}
</script>
