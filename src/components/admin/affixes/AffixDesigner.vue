<template>
	<div class="h-full grid grid-cols-[280px_1fr] gap-6">
		<AffixList @unsaved-warning="showUnsavedWarning = true" />
		<AffixEditor v-if="store.selectedId || store.draft" />
		<div v-else class="affix-empty">
			<div class="text-center">
				<Icon icon="game-icons:scroll-unfurled" class="h-12 w-12 mx-auto mb-3 opacity-20" />
				<p class="text-sm">Select an affix to edit</p>
				<p class="text-xs mt-1 opacity-70">or create a new one</p>
			</div>
		</div>

		<!-- Unsaved Changes Dialog -->
		<div
			v-if="showUnsavedWarning"
			class="fixed inset-0 z-30 flex items-center justify-center"
			style="background: rgba(0, 0, 0, 0.6)"
			@click.self="showUnsavedWarning = false">
			<div class="unsaved-dialog">
				<h3 class="unsaved-title">Unsaved Changes</h3>
				<p class="unsaved-text">You have unsaved changes. Do you want to discard them?</p>
				<div class="flex gap-2 justify-end">
					<button class="dialog-cancel" @click="showUnsavedWarning = false">Cancel</button>
					<button class="dialog-discard" @click="handleDiscard">Discard</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
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

<style scoped>
.affix-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	color: rgba(255, 255, 255, 0.2);
}

.affix-empty .text-center p:first-child {
	font-size: 0.82rem;
}

.affix-empty .text-center p:last-child {
	font-size: 0.72rem;
	opacity: 0.5;
}

.unsaved-dialog {
	padding: 24px;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: #0f0f17;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	max-width: 360px;
}

.unsaved-title {
	font-weight: 700;
	font-size: 0.9rem;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 8px;
}

.unsaved-text {
	font-size: 0.78rem;
	color: rgba(255, 255, 255, 0.4);
	margin-bottom: 16px;
}

.dialog-cancel {
	padding: 5px 14px;
	font-size: 0.75rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.5);
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.dialog-cancel:hover {
	border-color: rgba(255, 255, 255, 0.2);
}

.dialog-discard {
	padding: 5px 14px;
	font-size: 0.75rem;
	font-weight: 600;
	color: white;
	background: rgba(239, 68, 68, 0.5);
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.dialog-discard:hover {
	background: rgba(239, 68, 68, 0.7);
}
</style>
