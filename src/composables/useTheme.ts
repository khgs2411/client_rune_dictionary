import { computed, type ComputedRef, toValue, type MaybeRefOrGetter } from 'vue'
import { convert, OKLCH, sRGB } from '@texel/color'

export type ColorTheme = 'neutral' | 'rose' | 'blue' | 'purple' | 'green' | 'yellow'

export interface ThemeOption {
	label: string
	value: ColorTheme
	color: string
}

/**
 * Three.js compatible RGB color as tuple [r, g, b]
 */
export type ThreeJSColor = [number, number, number]

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
]

export interface ThemeColors {
	primary: ComputedRef<ThreeJSColor>
	primaryForeground: ComputedRef<ThreeJSColor>
	accent: ComputedRef<ThreeJSColor>
	accentForeground: ComputedRef<ThreeJSColor>
	background: ComputedRef<ThreeJSColor>
	foreground: ComputedRef<ThreeJSColor>
	muted: ComputedRef<ThreeJSColor>
	card: ComputedRef<ThreeJSColor>
	border: ComputedRef<ThreeJSColor>
}

/**
 * Converts OKLCH CSS variable to Three.js RGB color array
 */
function parseOklchColor(varName: string): ThreeJSColor {
	const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()

	if (!value) return [0.5, 0.5, 0.5]

	// Strip oklch() wrapper if present
	const colorValue = value.match(/oklch\((.*?)\)/)?.[1] || value

	// Parse L C H values
	const [l, c, h] = colorValue.split(/\s+/).map(Number)

	if (isNaN(l) || isNaN(c) || isNaN(h)) {
		console.warn(`Invalid OKLCH values for ${varName}: ${value}`)
		return [0.5, 0.5, 0.5]
	}

	// Convert to sRGB and return as tuple
	return convert([l, c, h], OKLCH, sRGB) as ThreeJSColor
}

/**
 * Composable that provides reactive theme colors converted for Three.js
 * @param themeTrigger - Reactive value that triggers color recalculation when changed
 */
export function useTheme(themeTrigger: MaybeRefOrGetter<ColorTheme | string>): ThemeColors {
	const createReactiveColor = (varName: string) =>
		computed(() => {
			toValue(themeTrigger) // Track theme changes
			return parseOklchColor(varName)
		})

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
	}
}
