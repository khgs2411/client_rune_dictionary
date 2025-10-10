import { convert, OKLCH, sRGB } from '@texel/color';
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';

export type ColorTheme = 'neutral' | 'rose' | 'blue' | 'purple' | 'green' | 'yellow';

export interface ThemeOption {
  label: string;
  value: ColorTheme;
  color: string;
}

/**
 * Three.js compatible RGB color as tuple [r, g, b]
 */
export type RGBColor = [number, number, number];

/**
 * Available theme options with preview colors
 */
export const THEME_OPTIONS: ThemeOption[] = [
  { label: 'Neutral', value: 'neutral', color: '#e5e5e5' },
  { label: 'Rose', value: 'rose', color: '#fda4af' },
  { label: 'Blue', value: 'blue', color: '#93c5fd' },
  { label: 'Purple', value: 'purple', color: '#d8b4fe' },
  { label: 'Green', value: 'green', color: '#86efac' },
  { label: 'Yellow', value: 'yellow', color: '#fde047' },
];

export interface ThemeColors {
  primary: ComputedRef<RGBColor>;
  primaryForeground: ComputedRef<RGBColor>;
  accent: ComputedRef<RGBColor>;
  accentForeground: ComputedRef<RGBColor>;
  background: ComputedRef<RGBColor>;
  foreground: ComputedRef<RGBColor>;
  muted: ComputedRef<RGBColor>;
  card: ComputedRef<RGBColor>;
  border: ComputedRef<RGBColor>;
}

/**
 * Converts OKLCH CSS variable to Three.js RGB color array
 */
function parseOklchColor(varName: string): RGBColor {
  // Check if we're in a browser environment
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    console.warn(`parseOklchColor called in non-browser environment for ${varName}`);
    return [0.5, 0.5, 0.5];
  }

  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

    if (!value) {
      console.warn(`CSS variable ${varName} not found, using default gray`);
      return [0.5, 0.5, 0.5];
    }

    // Strip oklch() wrapper if present
    const colorValue = value.match(/oklch\((.*?)\)/)?.[1] || value;

    // Parse L C H values
    const [l, c, h] = colorValue.split(/\s+/).map(Number);

    if (isNaN(l) || isNaN(c) || isNaN(h)) {
      console.warn(`Invalid OKLCH values for ${varName}: ${value}, using default gray`);
      return [0.5, 0.5, 0.5];
    }

    // Validate OKLCH ranges (L: 0-1, C: 0-0.4, H: 0-360)
    if (l < 0 || l > 1 || c < 0 || c > 0.4 || h < 0 || h > 360) {
      console.warn(`OKLCH values out of range for ${varName}: L=${l}, C=${c}, H=${h}`);
    }

    // Convert to sRGB and return as tuple
    const rgb = convert([l, c, h], OKLCH, sRGB) as RGBColor;

    // Clamp RGB values to 0-1 range (in case conversion produces out-of-gamut colors)
    return [
      Math.max(0, Math.min(1, rgb[0])),
      Math.max(0, Math.min(1, rgb[1])),
      Math.max(0, Math.min(1, rgb[2])),
    ] as RGBColor;
  } catch (error) {
    console.error(`Error parsing OKLCH color for ${varName}:`, error);
    return [0.5, 0.5, 0.5];
  }
}

/**
 * Composable that provides reactive theme colors converted for Three.js
 * @param themeTrigger - Reactive value that triggers color recalculation when changed
 */
export function useTheme(themeTrigger: MaybeRefOrGetter<ColorTheme | string>): ThemeColors {
  const createReactiveColor = (varName: string) =>
    computed(() => {
      toValue(themeTrigger); // Track theme changes
      return parseOklchColor(varName);
    });

  return {
    primary: createReactiveColor('--primary'),
    primaryForeground: createReactiveColor('--primary-foreground'),
    accent: createReactiveColor('--accent'),
    accentForeground: createReactiveColor('--accent-foreground'),
    background: createReactiveColor('--background'),
    foreground: createReactiveColor('--foreground'),
    muted: createReactiveColor('--muted'),
    card: createReactiveColor('--card'),
    border: createReactiveColor('--border'),
  };
}
