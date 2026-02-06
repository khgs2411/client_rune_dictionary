<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
				<!-- Backdrop -->
				<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="handleClose" />

				<!-- Modal Container - @wheel.stop prevents scroll from bubbling to camera controls -->
				<Tabs
					v-model="activeTab"
					class="relative z-10 w-[1100px] h-[85vh] bg-background/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
					@wheel.stop>
					<!-- Header -->
					<div class="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
								<Database class="h-6 w-6 text-white" />
							</div>
							<div>
								<h2 class="text-xl font-bold">Admin Panel</h2>
								<p class="text-xs text-muted-foreground">Manage game data: Attributes and Affixes</p>
							</div>
						</div>

						<!-- Tabs -->
						<TabsList class="bg-muted/50 p-1">
							<TabsTrigger value="attributes" class="gap-2 data-[state=active]:bg-background">
								<Icon icon="game-icons:rune-stone" class="h-4 w-4" />
								Attributes
							</TabsTrigger>
							<TabsTrigger value="affixes" class="gap-2 data-[state=active]:bg-background">
								<Icon icon="game-icons:scroll-unfurled" class="h-4 w-4" />
								Affixes
							</TabsTrigger>
						</TabsList>

						<!-- Close Button -->
						<Button variant="ghost" size="icon" @click="handleClose" class="hover:bg-destructive/10 hover:text-destructive">
							<X class="h-4 w-4" />
						</Button>
					</div>

					<!-- Content Area - calc height minus header -->
					<div class="h-[calc(85vh-88px)] p-6">
						<TabsContent value="attributes" class="mt-0 h-full">
							<!-- Attributes - Split Pane Layout -->
							<div class="h-full grid grid-cols-[280px_1fr] gap-6">
								<div class="h-full overflow-hidden flex flex-col">
									<AttributeList @unsaved-warning="showUnsavedWarning = true" />
								</div>
								<div class="h-full overflow-hidden">
									<AttributeEditor />
								</div>
							</div>
						</TabsContent>

						<TabsContent value="affixes" class="mt-0 h-full">
							<AffixDesigner />
						</TabsContent>
					</div>
				</Tabs>

				<!-- Unsaved Changes Dialog -->
				<div
					v-if="showUnsavedWarning"
					class="absolute inset-0 z-20 flex items-center justify-center bg-black/50"
					@click.self="showUnsavedWarning = false">
					<div class="bg-background border rounded-lg p-6 shadow-xl max-w-sm">
						<h3 class="font-bold mb-2">Unsaved Changes</h3>
						<p class="text-sm text-muted-foreground mb-4">You have unsaved changes. Do you want to discard them?</p>
						<div class="flex gap-2 justify-end">
							<Button variant="outline" @click="showUnsavedWarning = false">Cancel</Button>
							<Button variant="destructive" @click="discardAndClose">Discard</Button>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Database, X } from "lucide-vue-next";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributeList, AttributeEditor } from "./attributes";
import { AffixDesigner } from "./affixes";
import { useAttributesStore } from "@/stores/attributes.store";
import { useAffixesStore } from "@/stores/affixes.store";
import { useSettingsStore } from "@/stores/settings.store";

const modelValue = defineModel<boolean>("open", { default: false });
const settingsStore = useSettingsStore();
const activeTab = ref("attributes");
const showUnsavedWarning = ref(false);
const attributesStore = useAttributesStore();
const affixesStore = useAffixesStore();

// Load data when panel opens
watch(modelValue, async (isOpen) => {
	// Disable game controls while panel is open
	settingsStore.gameControlsDisabled = isOpen;

	if (isOpen) {
		await attributesStore.loadAttributes();
	} else {
		// Clean up when closing
		attributesStore.discardChanges();
		attributesStore.forceSelectAttribute(null);
		affixesStore.discardChanges();
		affixesStore.forceSelectAffix(null);
	}
});

function handleClose() {
	if (attributesStore.hasUnsavedChanges || affixesStore.hasUnsavedChanges) {
		showUnsavedWarning.value = true;
		return;
	}
	modelValue.value = false;
}

function discardAndClose() {
	attributesStore.discardChanges();
	affixesStore.discardChanges();
	showUnsavedWarning.value = false;
	modelValue.value = false;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
