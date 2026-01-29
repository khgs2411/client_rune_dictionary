<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="forgeStore.isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
				<!-- Backdrop -->
				<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="forgeStore.closeForge" />

				<!-- Modal Panel -->
				<div
					class="relative bg-background/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
					<!-- Header -->
					<div class="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
								<Icon icon="game-icons:anvil" class="h-5 w-5 text-white" />
							</div>
							<div>
								<h2 class="text-xl font-bold">The Rune Forge</h2>
								<p class="text-xs text-muted-foreground">Combine runes to forge powerful abilities</p>
							</div>
						</div>
						<Button variant="ghost" size="icon" @click="forgeStore.closeForge">
							<Icon icon="radix-icons:cross-2" class="h-4 w-4" />
						</Button>
					</div>

					<!-- Content: 2-column grid -->
					<div class="grid grid-cols-2 gap-6 p-6 flex-1 overflow-hidden">
						<!-- Left Column: Selection -->
						<div class="flex flex-col gap-4 overflow-hidden">
							<!-- Loading State -->
							<div v-if="forgeStore.isLoadingAttributes" class="py-8 text-muted-foreground text-center">
								<Icon icon="radix-icons:update" class="h-8 w-8 animate-spin mx-auto mb-2" />
								<p class="text-sm">Loading runes...</p>
							</div>

							<!-- Empty State -->
							<div
								v-else-if="forgeStore.attributes.length === 0"
								class="py-8 text-center text-muted-foreground">
								<Icon icon="game-icons:empty-hourglass" class="h-12 w-12 mx-auto mb-2 opacity-50" />
								<p>No runes available</p>
								<p class="text-xs">Seed the database first</p>
							</div>

							<!-- Rune Selector -->
							<template v-else>
								<div class="flex-1 overflow-y-auto pr-2">
									<RuneSelector
										:fundamental-attributes="forgeStore.fundamentalAttributes"
										:other-attributes="forgeStore.otherAttributes"
										:selected-ids="forgeStore.selectedAttributeIds"
										:disabled="forgeStore.isForging"
										@toggle="forgeStore.toggleAttribute"
										@clear="forgeStore.clearSelection" />
								</div>

								<!-- Validation Error -->
								<div
									v-if="forgeStore.validationError && forgeStore.selectedAttributeIds.length > 0"
									class="p-3 bg-amber-500/10 text-amber-500 text-sm rounded border border-amber-500/30">
									<div class="flex items-center gap-2">
										<Icon icon="radix-icons:exclamation-triangle" class="h-4 w-4 shrink-0" />
										<span>{{ forgeStore.validationError }}</span>
									</div>
								</div>

								<!-- Channel Button -->
								<ChannelButton
									:disabled="!forgeStore.canChannel"
									:loading="forgeStore.isForging"
									@click="forgeStore.channel" />
							</template>

							<!-- API Error Display -->
							<div
								v-if="forgeStore.error"
								class="p-3 bg-destructive/10 text-destructive text-sm rounded">
								{{ forgeStore.error }}
							</div>
						</div>

						<!-- Right Column: Result -->
						<div class="flex flex-col items-center justify-center border-l border-border pl-6">
							<!-- Result Card -->
							<Transition name="card-appear" mode="out-in">
								<div v-if="forgeStore.forgedAbility" class="text-center">
									<p class="text-sm text-muted-foreground mb-4">Ability Forged!</p>
									<AbilityCard :ability="forgeStore.forgedAbility" />
								</div>
								<div v-else class="text-center text-muted-foreground">
									<div class="w-24 h-24 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
										<Icon icon="game-icons:magic-portal" class="h-12 w-12 opacity-30" />
									</div>
									<p class="font-medium">Ready to Forge</p>
									<p class="text-sm mt-1">Select runes and channel to create an ability</p>
								</div>
							</Transition>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { useForgeStore } from "@/stores/forge.store";
import RuneSelector from "./RuneSelector.vue";
import ChannelButton from "./ChannelButton.vue";
import AbilityCard from "./AbilityCard.vue";

const forgeStore = useForgeStore();
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

.card-appear-enter-active {
	transition: all 0.3s ease-out;
}

.card-appear-leave-active {
	transition: all 0.2s ease-in;
}

.card-appear-enter-from {
	opacity: 0;
	transform: scale(0.9) translateY(10px);
}

.card-appear-leave-to {
	opacity: 0;
	transform: scale(0.95);
}
</style>
