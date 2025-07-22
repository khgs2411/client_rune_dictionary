# SCSS Architecture Documentation

## Overview

This project uses a mobile-first, responsive SCSS architecture that works alongside Tailwind CSS v4 and PrimeVue's Aura theme.

## Directory Structure

```
src/assets/css/
├── design-tokens.scss      # CSS custom properties for design system
├── rpg-theme.scss         # RPG-specific theme enhancements
├── style.scss             # Main entry point
├── styles/
│   ├── _index.scss        # Central import file
│   ├── base/              # Reset and base styles
│   │   ├── _reset.scss    # Minimal reset (Tailwind handles most)
│   │   └── _typography.scss # Fluid typography
│   ├── mixins/            # Reusable SCSS mixins
│   │   ├── _breakpoints.scss # Responsive design mixins
│   │   ├── _typography.scss  # Typography mixins
│   │   ├── _utilities.scss   # Utility mixins
│   │   └── _index.scss      # Mixins barrel export
│   └── utilities/         # Utility classes
│       ├── _layout.scss    # Grid and flexbox utilities
│       └── _rpg-utilities.scss # RPG-specific utilities
```

## Integration with Tailwind CSS v4

Since Tailwind CSS v4 is installed, our SCSS architecture complements rather than replaces it:

1. **Tailwind handles**: Basic utilities, responsive modifiers, most component styles
2. **Our SCSS adds**: RPG-specific styles, complex mixins, fluid typography, custom animations

### Using Both Together

```html
<!-- Tailwind for basic layout, our utilities for RPG styling -->
<div class="flex items-center p-4 rpg-card rpg-glow-md">
	<h2 class="text-2xl font-bold text-rpg-heading">Quest Title</h2>
</div>
```

## Mobile-First Approach

All styles are written mobile-first using min-width media queries:

```scss
// Mobile styles (default)
.element {
	padding: var(--spacing-4);
}

// Tablet and up
@include breakpoint-up("md") {
	.element {
		padding: var(--spacing-6);
	}
}

// Desktop and up
@include breakpoint-up("lg") {
	.element {
		padding: var(--spacing-8);
	}
}
```

## Breakpoints (Aligned with Tailwind)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Key Features

### 1. Fluid Typography

Typography scales smoothly between breakpoints:

```scss
h1 {
	@include fluid-type(28px, 48px); // Scales from 28px to 48px
}
```

### 2. RPG-Specific Utilities

Custom utilities for game UI:

- `.rpg-card` - Styled card with shadows
- `.rpg-glow-*` - Mystic glow effects
- `.rpg-bg-parchment` - Parchment background
- `.text-rpg-heading` - Heading with RPG shadow

### 3. Responsive Grid System

Complements Tailwind's grid with RPG patterns:

```scss
.rpg-grid-dashboard // Sidebar + main layout
.rpg-grid-cards     // Auto-fit card grid
```

### 4. Design Token Integration

All utilities use CSS custom properties:

```scss
.rpg-card {
	padding: var(--spacing-6);
	border-radius: var(--radius-card);
	box-shadow: var(--shadow-md);
}
```

## Usage Guidelines

### When to use Tailwind

- Basic spacing, colors, and typography
- Standard responsive layouts
- Simple component styling
- Hover/focus states

### When to use our SCSS utilities

- RPG-specific visual effects
- Complex animations
- Fluid typography
- Custom grid patterns
- Component compositions

### Example Component

```vue
<template>
	<!-- Combine Tailwind and custom utilities -->
	<div class="rpg-container">
		<div class="rpg-grid-cards">
			<article class="rpg-card-interactive group">
				<h3 class="text-xl font-semibold mb-2 text-rpg-heading">Item Name</h3>
				<p class="text-gray-600 dark:text-gray-400">Item description</p>
				<div class="mt-4 rpg-inline-stack">
					<span class="text-sm text-mystic-500">Rare</span>
					<span class="text-sm">Level 10</span>
				</div>
			</article>
		</div>
	</div>
</template>
```

## Performance Considerations

1. **CSS is modular** - Only import what you need
2. **Mixins don't add weight** - They only generate CSS when used
3. **Utility classes are purgeable** - Unused utilities can be removed in production
4. **Respects prefers-reduced-motion** - Animations are disabled for accessibility

## Adding New Styles

1. **Component styles**: Create in `styles/components/`
2. **New utilities**: Add to appropriate file in `styles/utilities/`
3. **New mixins**: Add to `styles/mixins/` with descriptive names
4. **Theme variations**: Create in `styles/themes/`

Always consider if Tailwind can handle it first before adding custom SCSS.
