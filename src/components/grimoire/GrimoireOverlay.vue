<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="settings.debug.showGrimoire" class="fixed inset-0 z-50 flex items-center justify-center">
				<!-- Backdrop -->
				<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="close" />
				<!-- Book Container -->
				<Tabs v-model="activeTab" class="relative z-10 w-[900px] h-[80vh] bg-background/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl flex flex-col overflow-hidden">
					<!-- Header with Tabs -->
					<div class="flex items-center justify-between border-b border-border px-4 py-2 shrink-0">
						<TabsList class="bg-muted/50">
							<TabsTrigger value="runes" class="gap-2">
								<Icon icon="game-icons:fire-gem" class="h-4 w-4" />
								Runes
							</TabsTrigger>
							<TabsTrigger value="aspects" class="gap-2">
								<Icon icon="game-icons:magic-swirl" class="h-4 w-4" />
								Aspects
							</TabsTrigger>
						</TabsList>
						<Button variant="ghost" size="icon" @click="close">
							<Icon icon="radix-icons:cross-2" class="h-4 w-4" />
						</Button>
					</div>

					<!-- Content Area -->
					<div class="flex-1 overflow-hidden p-6 relative">
						<TabsContent value="runes" class="mt-0 h-full">
							<GrimoireRunesPage />
						</TabsContent>
						<TabsContent value="aspects" class="mt-0 h-full">
							<GrimoireAspectsPage />
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useSettingsStore } from "@/stores/settings.store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GrimoireRunesPage from "./GrimoireRunesPage.vue";
import GrimoireAspectsPage from "./GrimoireAspectsPage.vue";

const settings = useSettingsStore();
const activeTab = ref<"runes" | "aspects">("runes");

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
