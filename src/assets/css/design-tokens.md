# Design Token System Documentation

## Overview

This design token system provides a comprehensive set of design variables that complement PrimeVue's Aura theme while adding RPG-specific styling capabilities.

## Token Categories

### 1. Colors

- **Primary**: Uses PrimeVue's primary color system
- **RPG Palettes**:
    - `mystic`: Purple shades for magical/special elements
    - `parchment`: Beige/brown shades for RPG UI backgrounds
    - `blood`: Red shades for danger/health indicators
- **Semantic**: Success, warning, danger, info (from PrimeVue)
- **Surface**: Background and surface colors (from PrimeVue)

### 2. Typography

- **Font Sizes**: xs (12px) to 5xl (48px)
- **Font Weights**: normal (400) to bold (700)
- **Line Heights**: tight (1.25) to relaxed (1.75)
- **Letter Spacing**: tight to wide

### 3. Spacing

- Based on 8px grid system
- Scale from 0 to 24 (0px to 96px)
- Component-specific: inline, stack, section

### 4. Borders & Radius

- **Border Widths**: thin (1px), medium (2px), thick (4px)
- **Border Radius**: sm (4px) to full (9999px)
- **Component Radius**: card, button, input

### 5. Shadows

- **Elevation**: xs to 2xl
- **RPG Glow**: sm, md, lg (mystic purple glow)
- **Inset**: For pressed states

### 6. Animation

- **Duration**: instant (0ms) to slower (700ms)
- **Performance Budget**:
    - Critical: 100ms
    - Transitions: 300ms
    - Decorative: 500ms
- **Easing**: linear, in, out, in-out, bounce

### 7. Z-Index

- Layering system from deep (-999) to notification (1080)

### 8. Breakpoints

- Mobile first: xs (320px) to 2xl (1536px)

## Usage Examples

### In SCSS:

```scss
.rpg-card {
	background: var(--color-surface);
	padding: var(--spacing-6);
	border-radius: var(--radius-card);
	box-shadow: var(--shadow-md);

	&:hover {
		box-shadow: var(--shadow-glow-md);
	}
}
```

### In Vue Components:

```vue
<script setup>
import { useDesignTokens } from "@/composables/useDesignTokens";

const { spacing, shadow, cardStyle } = useDesignTokens();
</script>

<template>
	<div :style="cardStyle">
		<!-- Card content -->
	</div>
</template>
```

### In TypeScript:

```typescript
import { getSpacingToken, getColorToken } from "@/utils/design-tokens";

const primaryColor = getColorToken("primary");
const largeSpacing = getSpacingToken("8");
```

## Dark Mode

The system automatically adjusts certain tokens for dark mode:

- Parchment colors become darker
- Glow effects are enhanced
- All tokens respect PrimeVue's dark mode implementation

## Performance Considerations

- Use CSS custom properties for runtime theming
- Animation durations follow performance budget
- Respects `prefers-reduced-motion` automatically

## Best Practices

1. Always use design tokens instead of hard-coded values
2. Use semantic color tokens (primary, success) over specific colors
3. Follow the 8px spacing grid
4. Use appropriate animation durations based on importance
5. Test in both light and dark modes
