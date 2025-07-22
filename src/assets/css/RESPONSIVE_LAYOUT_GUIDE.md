# Responsive Layout System Guide

## Overview

This project uses a mobile-first responsive design system that combines:

- Tailwind CSS utilities (via @tailwindcss/vite)
- Custom SCSS mixins for breakpoints
- Responsive utility classes
- Vue components for layout

## Breakpoints

Aligned with Tailwind v4 defaults:

- `sm`: 640px - Small devices
- `md`: 768px - Medium devices
- `lg`: 1024px - Large devices
- `xl`: 1280px - Extra large devices
- `2xl`: 1536px - 2X large devices

## Using Breakpoint Mixins

```scss
// Mobile-first (min-width)
@include breakpoint-up("md") {
	// Styles for medium screens and up
}

// Max-width
@include breakpoint-down("sm") {
	// Styles for small screens and below
}

// Between breakpoints
@include breakpoint-between("sm", "lg") {
	// Styles for small to large screens
}

// Orientation
@include landscape {
	// Landscape-specific styles
}

@include portrait {
	// Portrait-specific styles
}
```

## Responsive Utilities

### Container Classes

```html
<!-- Responsive container with max-widths -->
<div class="container-responsive">
	<!-- Content -->
</div>

<!-- Fluid container up to 1920px -->
<div class="container-fluid">
	<!-- Content -->
</div>
```

### Grid System

```html
<!-- Using Tailwind classes (recommended) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
	<!-- Grid items -->
</div>

<!-- Using ResponsiveGrid component -->
<ResponsiveGrid :md-cols="2" :lg-cols="3" gap-size="lg">
	<!-- Grid items -->
</ResponsiveGrid>
```

### Text Utilities

```html
<!-- Fluid typography with clamp -->
<h1 class="text-clamp-xl">Responsive Heading</h1>
<p class="text-clamp-base">Responsive paragraph text</p>

<!-- Responsive text sizes -->
<span class="text-responsive">Auto-scaling text</span>
<span class="text-responsive-lg">Larger scaling text</span>
```

### Visibility Utilities

```html
<!-- Hide/show based on screen size -->
<div class="hide-mobile">Desktop only</div>
<div class="show-mobile">Mobile only</div>
<div class="hide-tablet">Not on tablets</div>
<div class="show-desktop">Desktop only</div>
```

### Responsive Spacing

```html
<!-- Responsive padding/margin -->
<div class="p-responsive-md">Responsive padding</div>
<div class="m-responsive-lg">Responsive margin</div>

<!-- Responsive gap -->
<div class="flex gap-responsive">
	<!-- Flex items with responsive gap -->
</div>
```

### Layout Patterns

```html
<!-- Stack to horizontal -->
<div class="stack-to-horizontal">
	<div>Item 1</div>
	<div>Item 2</div>
</div>

<!-- Responsive card -->
<div class="card-responsive">
	<!-- Card content with responsive padding -->
</div>

<!-- Full width on mobile, auto on desktop -->
<button class="btn-responsive btn-responsive-full">Responsive Button</button>
```

## Component Examples

### Responsive Container

```vue
<ResponsiveContainer fluid>
  <!-- Full-width fluid content -->
</ResponsiveContainer>

<ResponsiveContainer safe-area>
  <!-- Content with safe area padding for mobile -->
</ResponsiveContainer>
```

### Match View Pattern

```scss
.viewport {
	// Desktop
	height: 92%;
	width: 96%;
	max-width: 1920px;

	// Mobile
	@include breakpoint-down("sm") {
		height: 100%;
		width: 100%;
		padding: 0;
		border-radius: 0;
	}
}
```

### Game Interface Pattern

```scss
.game-interface {
	width: 100%;
	max-width: 800px;
	margin: 0 auto;
	padding: 1rem;

	@include breakpoint-down("sm") {
		padding: 0.5rem;
	}

	@include breakpoint-up("lg") {
		padding: 1.5rem;
	}
}
```

## Best Practices

1. **Mobile First**: Design for mobile, then enhance for larger screens
2. **Use Tailwind**: Prefer Tailwind utilities when available
3. **Consistent Spacing**: Use the responsive spacing scale
4. **Performance**: Hide non-essential elements on mobile
5. **Touch Targets**: Ensure 44px minimum touch targets on mobile
6. **Viewport Units**: Use `dvh` for better mobile browser support
7. **Safe Areas**: Account for device notches and home indicators

## Testing Checklist

- [ ] 320px - Small mobile (iPhone SE)
- [ ] 375px - Standard mobile
- [ ] 768px - Tablet portrait
- [ ] 1024px - Tablet landscape / small laptop
- [ ] 1280px - Desktop
- [ ] 1920px+ - Large desktop
- [ ] Test with browser dev tools device emulation
- [ ] Test actual mobile devices if possible
- [ ] Check landscape/portrait orientations
- [ ] Verify touch interactions on mobile
