<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="settings.debug.showGrimoire" class="fixed inset-0 z-50 flex items-center justify-center">
				<!-- Backdrop -->
				<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="close" />

				<!-- Book Container -->
				<Tabs
					v-model="activeTab"
					class="relative z-10 w-[950px] h-[85vh] bg-background/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl flex flex-col overflow-hidden">
					<!-- Header -->
					<div class="flex items-center justify-between border-b border-border px-6 py-4 shrink-0 bg-muted/30">
						<div class="flex items-center gap-4">
							<!-- Grimoire Icon -->
							<div class="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
								<Icon icon="game-icons:spell-book" class="h-6 w-6 text-white" />
							</div>
							<div>
								<h2 class="text-xl font-bold">Grimoire</h2>
								<p class="text-xs text-muted-foreground">Your collection of arcane knowledge</p>
							</div>
						</div>

						<!-- Tabs -->
						<TabsList class="bg-muted/50 p-1">
							<TabsTrigger value="skills" class="gap-2 data-[state=active]:bg-background">
								<Icon icon="game-icons:scroll-unfurled" class="h-4 w-4" />
								Skills
							</TabsTrigger>
							<TabsTrigger value="loadout" class="gap-2 data-[state=active]:bg-background">
								<Icon icon="game-icons:shoulder-armor" class="h-4 w-4" />
								Loadout
							</TabsTrigger>
						</TabsList>

						<!-- Close Button -->
						<Button variant="ghost" size="icon" @click="close" class="hover:bg-destructive/10 hover:text-destructive">
							<Icon icon="radix-icons:cross-2" class="h-4 w-4" />
						</Button>
					</div>

					<!-- Content Area -->
					<div class="flex-1 overflow-hidden p-6 relative">
						<TabsContent value="skills" class="mt-0 h-full">
							<GrimoireSkillsPage />
						</TabsContent>
						<TabsContent value="loadout" class="mt-0 h-full">
							<GrimoireLoadoutPage />
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</Transition>
	</Teleport>

	<!-- Rune Forge Overlay (separate modal) -->
	<RuneForgeOverlay />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useSettingsStore } from "@/stores/settings.store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GrimoireSkillsPage from "./GrimoireSkillsPage.vue";
import GrimoireLoadoutPage from "./GrimoireLoadoutPage.vue";
import RuneForgeOverlay from "@/components/forge/RuneForgeOverlay.vue";

const settings = useSettingsStore();
const activeTab = ref<"skills" | "loadout">("skills");

function close() {
	settings.debug.showGrimoire = false;
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
