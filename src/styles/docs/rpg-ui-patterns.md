# RPG UI Design Patterns for Rune RPG

## Research Summary

Based on analysis of modern RPG games (Final Fantasy XIV, World of Warcraft, Guild Wars 2, Path of Exile, and Diablo IV), here are the key design patterns to implement:

## Color Schemes

### Primary Palette

- **Dark Fantasy Base**: #0a0a0a to #1a1a1a (background)
- **Mystic Purple**: #6B46C1 to #9333EA (primary actions, magic)
- **Golden Accent**: #F59E0B to #FCD34D (highlights, rewards)
- **Blood Red**: #DC2626 to #EF4444 (danger, combat)
- **Parchment**: #FEF3C7 to #FDE68A (text backgrounds)

### Surface Colors (using PrimeVue tokens)

- Background: `var(--p-content-background)`
- Cards: `var(--p-surface-100)` with subtle gradients
- Borders: `var(--p-surface-300)` with glow effects

## Typography

### Font Hierarchy

- **Headers**: Bold, fantasy-inspired (Cinzel, MedievalSharp, or system fallback)
- **Body**: Clean, readable (Inter, Roboto)
- **Numbers**: Monospace for stats (JetBrains Mono, Fira Code)

### Sizes (Mobile-First)

```scss
// Base: 16px
--font-size-xs: 0.75rem; // 12px
--font-size-sm: 0.875rem; // 14px
--font-size-base: 1rem; // 16px
--font-size-lg: 1.125rem; // 18px
--font-size-xl: 1.5rem; // 24px
--font-size-2xl: 2rem; // 32px
--font-size-3xl: 2.5rem; // 40px
```

## Layout Patterns

### Hero Section

- **Full viewport height** on desktop, 60vh on mobile
- **Parallax background** with multiple layers
- **Animated particles** (subtle glow orbs)
- **Central logo/title** with glow effect
- **Call-to-action** buttons with hover animations

### Navigation Cards

- **Grid layout**: 1 column mobile, 2 columns tablet, 3-4 columns desktop
- **Card dimensions**: Min 280px width, 16:9 aspect ratio for images
- **Hover effects**: Scale (1.05), shadow elevation, border glow
- **Click feedback**: Ripple effect + brief scale down (0.98)

### Responsive Breakpoints

```scss
$breakpoints: (
	"xs": 320px,
	// Small phones
	"sm": 640px,
	// Large phones
	"md": 768px,
	// Tablets
	"lg": 1024px,
	// Small laptops
	"xl": 1280px,
	// Desktops
	"2xl": 1536px, // Large screens
);
```

## Animation Patterns

### Entrance Animations

1. **Fade-in with slide-up**: 400ms ease-out
2. **Stagger delay**: 100ms between items
3. **Scale entrance**: from 0.9 to 1 with opacity

### Hover States

```css
/* Card hover */
transform: translateY(-4px) scale(1.02);
box-shadow: 0 12px 24px rgba(147, 51, 234, 0.3);
transition: all 200ms ease-out;
```

### Background Animations

- **Floating particles**: 20-30s loops
- **Gradient shifts**: 10s smooth transitions
- **Parallax on scroll**: 0.5-0.8 speed ratios

## Component Specifications

### Hero Section Component

```
- Height: 100vh desktop, 60vh mobile
- Background: 3-layer parallax
  - Layer 1: Stars/particles (slow)
  - Layer 2: Clouds/mist (medium)
  - Layer 3: Main scene (fast)
- Logo: Centered, with glow animation
- Tagline: Fade in after logo
- CTA buttons: Staggered entrance
```

### Navigation Card Component

```
- Min width: 280px
- Max width: 400px
- Image ratio: 16:9
- Padding: 1.5rem (24px)
- Border: 1px with gradient
- Shadow: Multi-layer for depth
- Hover: Scale + glow + shadow
```

### Performance Guidelines

#### Animation Performance

- **Target**: 60fps consistently
- **Transform-only** animations (no layout shifts)
- **Will-change** on animated elements
- **GPU acceleration** via transform3d
- **Reduced motion** media query support

#### Loading Strategy

- **Lazy load** images below fold
- **Blur-up** technique for hero images
- **Progressive enhancement** for animations
- **Critical CSS** inline for above-fold

## Accessibility Requirements

- **Touch targets**: Minimum 44x44px
- **Color contrast**: WCAG AA minimum (4.5:1)
- **Focus indicators**: Visible custom focus rings
- **Screen reader**: Proper ARIA labels
- **Keyboard navigation**: Full support
- **Reduced motion**: Respect user preference

## Implementation with Tech Stack

### Tailwind Utilities

```html
<!-- Hero section -->
<div class="min-h-screen md:h-screen bg-gradient-to-b from-gray-900 to-purple-900">
	<!-- Parallax layers -->
	<div class="absolute inset-0 opacity-30 animate-float-slow">
		<!-- Particles -->
	</div>
</div>

<!-- Navigation cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
	<div
		class="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl 
              transform transition-all duration-200 hover:-translate-y-1 hover:scale-105">
		<!-- Card content -->
	</div>
</div>
```

### v-motion Integration

```vue
<div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" :delay="100">
  <!-- Animated content -->
</div>
```

### PrimeVue Components

- Use `Card` with custom styling classes
- Leverage `Button` with severity variants
- Apply `Ripple` directive for touch feedback
- Utilize theme CSS variables for consistency

Batman
