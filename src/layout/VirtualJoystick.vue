<template>
	<Teleport to="body">
		<div v-if="isMobile && joystick.active.value" class="pointer-events-none fixed inset-0 z-50">
			<!-- Joystick Base -->
			<div
				class="absolute rounded-full border-2 border-primary/30 bg-background/20 backdrop-blur-sm"
				:style="{
					left: `${joystick.startX.value - baseRadius}px`,
					top: `${joystick.startY.value - baseRadius}px`,
					width: `${baseRadius * 2}px`,
					height: `${baseRadius * 2}px`,
				}" />

			<!-- Joystick Handle -->
			<div
				class="absolute rounded-full border-2 border-primary bg-primary/50 shadow-lg backdrop-blur-sm"
				:style="{
					left: `${joystick.x.value - handleRadius}px`,
					top: `${joystick.y.value - handleRadius}px`,
					width: `${handleRadius * 2}px`,
					height: `${handleRadius * 2}px`,
				}" />
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { I_JoystickControls } from "@/composables/composables.types";
import { useBreakpoints } from "@vueuse/core";
import { computed } from "vue";

interface Props {
	joystick: I_JoystickControls;
	baseRadius?: number;
	handleRadius?: number;
}

const props = withDefaults(defineProps<Props>(), {
	baseRadius: 60,
	handleRadius: 30,
});

// Mobile detection using VueUse
const breakpoints = useBreakpoints({
	mobile: 0,
	tablet: 768,
	desktop: 1024,
});

const isMobile = computed(() => breakpoints.smaller("tablet").value);
</script>
