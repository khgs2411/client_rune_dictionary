import { convert, OKLCH, sRGB } from '@texel/color';
import { computed, ref } from 'vue';

export type ColorTheme = 'neutral' | 'rose' | 'blue' | 'purple' | 'green' | 'yellow';

/**
 * Available theme options with preview colors
 */
export const THEME_OPTIONS = [
  { label: 'Neutral', value: 'neutral' as const, color: '#e5e5e5' },
  { label: 'Rose', value: 'rose' as const, color: '#fda4af' },
  { label: 'Blue', value: 'blue' as const, color: '#93c5fd' },
  { label: 'Purple', value: 'purple' as const, color: '#d8b4fe' },
  { label: 'Green', value: 'green' as const, color: '#86efac' },
  { label: 'Yellow', value: 'yellow' as const, color: '#fde047' },
] as const;

/**
 * Converts OKLCH CSS variable to Three.js RGB color array
 */
function parseOklchColor(varName: string): [number, number, number] {
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
    const rgb = convert([l, c, h], OKLCH, sRGB) as [number, number, number];

    // Clamp RGB values to 0-1 range (in case conversion produces out-of-gamut colors)
    return [
      Math.max(0, Math.min(1, rgb[0])),
      Math.max(0, Math.min(1, rgb[1])),
      Math.max(0, Math.min(1, rgb[2])),
    ];
  } catch (error) {
    console.error(`Error parsing OKLCH color for ${varName}:`, error);
    return [0.5, 0.5, 0.5];
  }
}

/**
 * Converts RGB color tuple (0-1 range) to Three.js hex color
 * @param rgb - RGB color as [r, g, b] where each value is 0-1
 * @returns Hex color number for Three.js
 */
function rgbToHex(rgb: [number, number, number]): number {
  const r = Math.round(rgb[0] * 255);
  const g = Math.round(rgb[1] * 255);
  const b = Math.round(rgb[2] * 255);
  return (r << 16) | (g << 8) | b;
}

const THEME_STORAGE_KEY = 'color-theme';

/**
 * Self-contained theme composable
 * Manages current theme, localStorage persistence, and provides reactive hex colors for Three.js
 */
export function useTheme() {
  const currentTheme = ref<ColorTheme>('neutral');

  // Reactive hex colors (re-compute when currentTheme changes)
  const primary = computed(() => {
    currentTheme.value; // Track dependency
    return rgbToHex(parseOklchColor('--primary'));
  });

  const primaryForeground = computed(() => {
    currentTheme.value;
    return rgbToHex(parseOklchColor('--primary-foreground'));
  });

  const accent = computed(() => {
    currentTheme.value;
    return rgbToHex(parseOklchColor('--accent'));
  });

  const accentForeground = computed(() => {
    currentTheme.value;
    return rgbToHex(parseOklchColor('--accent-foreground'));
  });

  const background = computed(() => {
    currentTheme.value;
    return rgbToHex(parseOklchColor('--background'));
  });

  const foreground = computed(() => {
    currentTheme.value;
    return rgbToHex(parseOklchColor('--foreground'));
  });

  const muted = computed(() => {
    currentTheme.value;
    return rgbToHex(parseOklchColor('--muted'));
  });

  const card = computed(() => {
    currentTheme.value;
    return rgbToHex(parseOklchColor('--card'));
  });

  const border = computed(() => {
    currentTheme.value;
    return rgbToHex(parseOklchColor('--border'));
  });

  function setTheme(theme: ColorTheme) {
    currentTheme.value = theme;
    document.documentElement.setAttribute('data-theme', theme);

    // Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  /**
   * Hydrate theme from localStorage
   * Call this on app initialization
   */
  function hydrate() {
    if (typeof localStorage === 'undefined') return;

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ColorTheme | null;
    if (savedTheme && THEME_OPTIONS.some(opt => opt.value === savedTheme)) {
      setTheme(savedTheme);
    }
  }

  // Palette: all available theme preview colors as a record for easy lookup
  const palette = computed(() => {
    const record: Record<ColorTheme, { label: string; color: string; hex: number }> = {} as any;

    THEME_OPTIONS.forEach(option => {
      record[option.value] = {
        label: option.label,
        color: option.color,
        hex: parseInt(option.color.replace('#', ''), 16), // Convert to Three.js hex number
      };
    });

    return record;
  });

  return {
    currentTheme,
    primary,
    primaryForeground,
    accent,
    accentForeground,
    background,
    foreground,
    muted,
    card,
    border,
    palette,
    setTheme,
    hydrate,
  };
}
