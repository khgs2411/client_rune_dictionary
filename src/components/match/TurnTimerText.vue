<template>
	<div v-if="isVisible" class="text-center">
		<span class="text-sm font-semibold text-foreground flex items-center justify-center gap-1">
			<Icon icon="lucide:clock" class="w-4 h-4" />
			TURN TIMER:
			<span :class="seconds < 5 ? 'text-destructive animate-pulse' : 'text-primary'" class="font-mono"> {{ seconds }}s </span>
		</span>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
	seconds: number;
	isVisible: boolean;
}>();
</script>
