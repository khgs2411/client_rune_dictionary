<script setup lang="ts">
import { cn } from "@/lib/utils";
import { motion } from "motion-v";
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
	variant?: ButtonVariants["variant"];
	size?: ButtonVariants["size"];
	class?: HTMLAttributes["class"];
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	as: "button",
});

const buttonClasses = computed(() => 
	cn(
		buttonVariants({ variant: props.variant, size: props.size }), 
		props.class
	)
);

// Clean animation objects following motion-vue patterns
const buttonInitial = { scale: 1 };
const buttonHover = { 
	scale: 1.02,
	transition: { 
		type: 'spring' as const, 
		stiffness: 300, 
		damping: 20 
	}
};
const buttonTap = { 
	scale: 0.98,
	transition: { 
		type: 'spring' as const, 
		stiffness: 400, 
		damping: 25 
	}
};
</script>

<template>
	<motion.button
		v-if="as === 'button' || !as"
		data-slot="button"
		:class="buttonClasses"
		:disabled="disabled"
		:initial="buttonInitial"
		:whileHover="disabled ? buttonInitial : buttonHover"
		:whileTap="disabled ? buttonInitial : buttonTap">
		<slot />
	</motion.button>

	<!-- Fallback for non-button elements -->
	<Primitive 
		v-else 
		data-slot="button" 
		:as="as" 
		:as-child="asChild" 
		:class="buttonClasses">
		<slot />
	</Primitive>
</template>
