# Centralized Color System Documentation

## ⚠️ IMPORTANT: SINGLE SOURCE OF TRUTH

The color system defined in `src/utils/color-system.ts` is the **ONLY** source of truth for ALL colors in this application, regardless of which UI library is being used.

## Architecture

### Core System (`src/utils/color-system.ts`)

The `ColorSystem` class is a singleton that manages all color variables for:
- **shadcn-vue components**
- **PrimeVue components**  
- **Custom components**
- **Any future UI libraries**

### How It Works

1. **Theme Selection** → User picks a color in Settings.vue
2. **Settings Store** → Calls `colorSystem.applyTheme(theme, mode)`
3. **Color System** → Updates ALL CSS variables for ALL libraries
4. **Components** → Automatically reflect new colors

## Color Variables

### Core Variables (Used by shadcn and custom components)
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--accent` / `--accent-foreground`
- `--muted` / `--muted-foreground`
- `--destructive` / `--destructive-foreground`
- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`
- `--border`, `--input`, `--ring`

### PrimeVue Variables (Automatically mapped)
- `--p-primary-color` → maps from `--primary`
- `--p-content-background` → maps from `--background`
- `--p-text-color` → maps from `--foreground`
- `--p-surface-*` → maps from various theme colors

## Available Themes

23 themes with light/dark modes each:
- `emerald`, `green`, `lime`
- `red`, `orange`, `amber`, `yellow`
- `teal`, `cyan`, `sky`, `blue`, `indigo`
- `violet`, `purple`, `fuchsia`, `pink`, `rose`
- `slate`, `gray`, `zinc`, `neutral`, `stone`

## Usage Guidelines

### ✅ DO
- Use CSS variables for ALL colors: `color: var(--primary)`
- Use the color system API: `colorSystem.getColor('primary')`
- Let the system handle library mappings

### ❌ DON'T
- Hard-code color values in components
- Access PrimeVue's `$dt()` directly for colors
- Create separate theme systems
- Use library-specific color functions

## Adding a New UI Library

1. Add mappings in `ColorSystem.mapToOtherLibraries()`
2. Map our core colors to the library's expected variables
3. Test with theme switching

## API Reference

```typescript
// Apply a theme
colorSystem.applyTheme('blue', 'dark');

// Get current theme
const { theme, mode } = colorSystem.getCurrentTheme();

// Get specific color value
const primaryColor = colorSystem.getColor('primary');
```

## Component Examples

### shadcn Component
```vue
<Button variant="primary">
  <!-- Uses var(--primary) automatically -->
</Button>
```

### PrimeVue Component
```vue
<Button severity="primary">
  <!-- Uses mapped --p-primary-color automatically -->
</Button>
```

### Custom Component
```vue
<style>
.my-component {
  background: var(--background);
  color: var(--foreground);
  border-color: var(--border);
}
</style>
```

## Maintenance

When updating colors:
1. **ONLY** modify `COLOR_THEMES` in `color-system.ts`
2. Test both light and dark modes
3. Verify all UI libraries reflect changes
4. Never bypass the color system

---

**Remember**: This color system is the single authority for ALL colors in the application. Every color, in every component, from every library, must trace back to this system.