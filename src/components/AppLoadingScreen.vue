<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="visible" class="fixed inset-0 z-[70] bg-background flex items-center justify-center">
				<div class="text-center space-y-4">
					<!-- Loading Spinner -->
					<div class="relative mx-auto w-16 h-16">
						<svg class="animate-spin h-16 w-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>

					<!-- Loading Message -->
					<div class="space-y-2">
						<h2 class="text-xl font-semibold text-foreground">{{ message }}</h2>
						<p v-if="subMessage" class="text-sm text-muted-foreground">{{ subMessage }}</p>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
interface Props {
	visible: boolean;
	message?: string;
	subMessage?: string;
}

withDefaults(defineProps<Props>(), {
	visible: false,
	message: "Loading...",
	subMessage: undefined,
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
