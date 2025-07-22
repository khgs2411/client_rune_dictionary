<template>
	<div
		:class="[
			'responsive-grid-component',
			gridClass,
			{
				[`grid-cols-${cols}`]: cols && !responsive,
				[`sm:grid-cols-${smCols}`]: smCols,
				[`md:grid-cols-${mdCols}`]: mdCols,
				[`lg:grid-cols-${lgCols}`]: lgCols,
				[`xl:grid-cols-${xlCols}`]: xlCols,
				[`gap-${gapSize}`]: gapSize,
			},
		]"
		:style="customStyle">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
	cols?: number;
	smCols?: number;
	mdCols?: number;
	lgCols?: number;
	xlCols?: number;
	gap?: number | string;
	gapSize?: "sm" | "md" | "lg" | "xl" | "2xl";
	responsive?: boolean;
	gridClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	cols: 1,
	responsive: true,
	gapSize: "md",
});

const customStyle = computed(() => {
	if (props.gap && typeof props.gap === "number") {
		return { gap: `${props.gap}rem` };
	} else if (props.gap && typeof props.gap === "string") {
		return { gap: props.gap };
	}
	return {};
});
</script>

<style lang="scss" scoped>
@import "../../assets/css/styles/mixins/breakpoints";

.responsive-grid-component {
	display: grid;
	width: 100%;

	// Default responsive behavior
	grid-template-columns: repeat(1, 1fr);

	// Gap sizes
	&.gap-sm {
		gap: 0.5rem;
	}
	&.gap-md {
		gap: 1rem;
	}
	&.gap-lg {
		gap: 1.5rem;
	}
	&.gap-xl {
		gap: 2rem;
	}
	&.gap-2xl {
		gap: 3rem;
	}

	// Grid column classes
	@for $i from 1 through 12 {
		&.grid-cols-#{$i} {
			grid-template-columns: repeat($i, 1fr);
		}

		@include breakpoint-up("sm") {
			&.sm\:grid-cols-#{$i} {
				grid-template-columns: repeat($i, 1fr);
			}
		}

		@include breakpoint-up("md") {
			&.md\:grid-cols-#{$i} {
				grid-template-columns: repeat($i, 1fr);
			}
		}

		@include breakpoint-up("lg") {
			&.lg\:grid-cols-#{$i} {
				grid-template-columns: repeat($i, 1fr);
			}
		}

		@include breakpoint-up("xl") {
			&.xl\:grid-cols-#{$i} {
				grid-template-columns: repeat($i, 1fr);
			}
		}
	}
}
</style>
