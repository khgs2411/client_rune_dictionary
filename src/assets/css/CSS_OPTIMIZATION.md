# CSS Optimization Documentation

## Overview

This document outlines the CSS performance optimizations implemented in the Rune RPG project.

## Optimization Strategies

### 1. Build-Time Optimizations

#### Vite Configuration

- **CSS Extraction**: Enabled for better caching (`extract: true`)
- **CSS Modules**: Configured with camelCase convention
- **SCSS Modern Compiler**: Using modern API for faster builds
- **Asset Hashing**: CSS files are hashed for cache busting

#### PostCSS Configuration

- **Autoprefixer**: Adds vendor prefixes for browser compatibility
- **cssnano** (Production only):
    - Removes comments and whitespace
    - Optimizes colors and gradients
    - Merges duplicate rules
    - Minifies selectors and values
    - Preserves CSS custom properties

### 2. Runtime Optimizations

#### CSS Optimization Utilities (`css-optimization.ts`)

- **Font Preloading**: Critical fonts loaded with `preload`
- **Unused Variable Cleanup**: Removes unused CSS custom properties
- **Lazy CSS Loading**: Non-critical styles loaded asynchronously
- **Animation Optimization**: Respects `prefers-reduced-motion`
- **CSS Containment**: Applied to scrollable containers and cards

### 3. Performance Classes

#### GPU Acceleration

```scss
.rpg-gpu-accelerated {
	will-change: transform;
	transform: translateZ(0);
}
```

#### Scroll Optimization

```scss
.rpg-scroll-optimized {
	contain: layout style paint;
	-webkit-overflow-scrolling: touch;
}
```

#### Low Performance Mode

- Disables shadows and filters
- Removes hover transforms
- Simplifies gradients

### 4. Critical CSS Strategy

#### Above-the-fold Content

- Login page styles
- Menu and layout structure
- Primary buttons and forms
- Core typography

#### Deferred Loading

- Animation libraries
- Complex component styles
- Theme variations
- Utility classes

### 5. Theme Switching Performance

#### Smooth Transitions

```scss
.theme-transition * {
	transition:
		background-color 300ms,
		color 300ms;
}
```

#### Dark Mode Optimization

- Uses CSS custom properties for instant switching
- No JavaScript recalculation needed
- Cached in localStorage

## Usage Guidelines

### When to Apply Performance Classes

1. **Scrollable Containers**

    ```html
    <div class="chat-window rpg-scroll-optimized"></div>
    ```

2. **Animated Elements**

    ```html
    <div class="match-card rpg-gpu-accelerated"></div>
    ```

3. **Large Lists**
    ```html
    <div class="dictionary-list rpg-content-auto"></div>
    ```

### Best Practices

1. **Use Tailwind First**: For basic utilities
2. **Apply Containment**: To isolated components
3. **Lazy Load Images**: Use `loading="lazy"`
4. **Minimize Custom Properties**: Use design tokens

## Performance Metrics

### Target Metrics

- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 300ms
- Cumulative Layout Shift: < 0.1

### Monitoring

- Use Chrome DevTools Performance tab
- Check CSS coverage in Coverage tab
- Monitor bundle sizes with `npm run build`

## Future Optimizations

1. **Critical CSS Extraction**: Inline above-the-fold styles
2. **CSS-in-JS Optimization**: For dynamic styles
3. **Component-Level Code Splitting**: Load CSS with components
4. **Service Worker Caching**: Cache CSS assets

## Development Tips

1. **Test Performance**: Use throttling in DevTools
2. **Check Accessibility**: Ensure reduced motion works
3. **Monitor Bundle Size**: Keep CSS < 50KB gzipped
4. **Use CSS Containment**: For complex components

## Troubleshooting

### Common Issues

1. **Flashing of Unstyled Content (FOUC)**

    - Ensure critical CSS is loaded synchronously
    - Preload fonts properly

2. **Janky Animations**

    - Apply GPU acceleration classes
    - Use `transform` instead of `position`

3. **Large CSS Bundle**

    - Check for unused styles with Coverage tab
    - Use PurgeCSS in production build

4. **Theme Switch Lag**
    - Ensure theme transition class is applied
    - Check for heavy recalculations
