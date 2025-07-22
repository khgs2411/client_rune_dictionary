<template>
	<div
		:class="[
			'responsive-container',
			containerClass,
			{
				'container-fluid': fluid,
				'container-responsive': !fluid && !fullWidth,
				'w-full': fullWidth,
				'safe-area-padding': safeArea,
			},
		]">
		<slot />
	</div>
</template>

<script setup lang="ts">
interface Props {
	containerClass?: string;
	fluid?: boolean;
	fullWidth?: boolean;
	safeArea?: boolean;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
@import "../../assets/css/styles/utilities/responsive";

.responsive-container {
	// The styles are handled by the imported responsive utilities
	// This component serves as a wrapper for responsive containers
}
</style>
