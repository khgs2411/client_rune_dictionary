<template>
	<div class="w-5 h-5 rounded flex items-center justify-center" :class="effect.type === 'buff' ? 'bg-green-500/20' : 'bg-red-500/20'">
		<Icon :icon="effect.icon" class="w-3 h-3" :class="effect.type === 'buff' ? 'text-green-500' : 'text-red-500'" />
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
	effect: {
		icon: string;
		type: "buff" | "debuff";
	};
}>();
</script>
