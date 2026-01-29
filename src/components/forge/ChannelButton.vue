<template>
	<button
		class="channel-button relative px-8 py-3 rounded-lg font-bold text-lg tracking-wider transition-all duration-300"
		:class="[
			disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95',
		]"
		:disabled="disabled || loading"
		@click="emit('click')">
		<!-- Gradient Background -->
		<div class="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />

		<!-- Inner Glow -->
		<div
			class="absolute inset-[2px] rounded-md bg-gradient-to-br from-violet-500/20 to-indigo-500/20"
			:class="{ 'animate-pulse': !disabled && !loading }" />

		<!-- Outer Glow Effect -->
		<div
			v-if="!disabled && !loading"
			class="absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 opacity-50 blur-md -z-10" />

		<!-- Content -->
		<span class="relative flex items-center justify-center gap-2 text-white">
			<Icon v-if="loading" icon="radix-icons:update" class="h-5 w-5 animate-spin" />
			<Icon v-else icon="game-icons:magic-gate" class="h-5 w-5" />
			<span>{{ loading ? "CHANNELING..." : "CHANNEL" }}</span>
		</span>
	</button>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
	disabled?: boolean;
	loading?: boolean;
}

withDefaults(defineProps<Props>(), {
	disabled: false,
	loading: false,
});

const emit = defineEmits<{
	click: [];
}>();
</script>

<style scoped>
.channel-button {
	box-shadow:
		0 0 20px rgba(139, 92, 246, 0.3),
		inset 0 0 20px rgba(139, 92, 246, 0.1);
}

.channel-button:not(:disabled):hover {
	box-shadow:
		0 0 30px rgba(139, 92, 246, 0.5),
		inset 0 0 30px rgba(139, 92, 246, 0.2);
}
</style>
