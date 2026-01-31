import { RGBColor } from "@/common/types";
import { convert, OKLCH, sRGB } from "@texel/color";
import { useColorMode } from "@vueuse/core";
import { computed } from "vue";

/**
 * Theme colors interface
 * Represents the computed hex color values from the theme system
 */
export interface I_ThemeColors {
	primary: number;
	primaryForeground: number;
	accent: number;
	accentForeground: number;
	background: number;
	foreground: number;
	muted: number;
	card: number;
	border: number;
}

/**
 * Converts OKLCH CSS variable to Three.js RGB color array
 */
function parseOklchColor(varName: string): RGBColor {
	// Check if we're in a browser environment
	if (typeof document === "undefined" || typeof window === "undefined") {
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

		// Parse L C H values (handle percentages)
		const parts = colorValue.split(/\s+/);
		const l = parts[0]?.endsWith("%") ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
		const c = parts[1]?.endsWith("%") ? parseFloat(parts[1]) / 100 : parseFloat(parts[1]);
		const h = parts[2]?.endsWith("%") ? parseFloat(parts[2]) / 100 : parseFloat(parts[2]);

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
		return [Math.max(0, Math.min(1, rgb[0])), Math.max(0, Math.min(1, rgb[1])), Math.max(0, Math.min(1, rgb[2]))];
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
function rgbToHex(rgb: RGBColor): number {
	const r = Math.round(rgb[0] * 255);
	const g = Math.round(rgb[1] * 255);
	const b = Math.round(rgb[2] * 255);
	return (r << 16) | (g << 8) | b;
}

/**
 * ============================================================================
 * Color Conversion Utilities
 * ============================================================================
 */

/**
 * Converts a hex string (e.g., "#654321" or "654321") to Three.js hex number
 * @param hexString - Hex color string with or without #
 * @returns Three.js hex color number (e.g., 0x654321 = 6636321)
 * @example
 * hexStringToNumber("#654321") // 6636321
 * hexStringToNumber("654321")  // 6636321
 */
export function hexStringToNumber(hexString: string): number {
	const cleaned = hexString.replace("#", "");
	return parseInt(cleaned, 16);
}

/**
 * Converts Three.js hex number to hex string
 * @param hexNumber - Three.js hex color number (e.g., 0x654321 or 6636321)
 * @returns Hex string with # prefix (e.g., "#654321")
 * @example
 * hexNumberToString(0x654321) // "#654321"
 * hexNumberToString(6636321)  // "#654321"
 */
export function hexNumberToString(hexNumber: number): string {
	return "#" + hexNumber.toString(16).padStart(6, "0");
}

/**
 * Converts RGB tuple (0-1 range) to hex string
 * @param rgb - RGB color as [r, g, b] where each value is 0-1
 * @returns Hex string with # prefix (e.g., "#654321")
 * @example
 * rgbToHexString([0.396, 0.263, 0.129]) // "#654321"
 */
export function rgbToHexString(rgb: RGBColor): string {
	const r = Math.round(rgb[0] * 255);
	const g = Math.round(rgb[1] * 255);
	const b = Math.round(rgb[2] * 255);
	return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/**
 * Converts hex string to RGB tuple (0-1 range)
 * @param hexString - Hex color string with or without #
 * @returns RGB color as [r, g, b] where each value is 0-1
 * @example
 * hexStringToRgb("#654321") // [0.396, 0.263, 0.129]
 */
export function hexStringToRgb(hexString: string): RGBColor {
	const hex = hexStringToNumber(hexString);
	const r = ((hex >> 16) & 255) / 255;
	const g = ((hex >> 8) & 255) / 255;
	const b = (hex & 255) / 255;
	return [r, g, b];
}

/**
 * Converts Three.js hex number to RGB tuple (0-1 range)
 * @param hexNumber - Three.js hex color number (e.g., 0x654321 or 6636321)
 * @returns RGB color as [r, g, b] where each value is 0-1
 * @example
 * hexNumberToRgb(0x654321) // [0.396, 0.263, 0.129]
 */
export function hexNumberToRgb(hexNumber: number): RGBColor {
	const r = ((hexNumber >> 16) & 255) / 255;
	const g = ((hexNumber >> 8) & 255) / 255;
	const b = (hexNumber & 255) / 255;
	return [r, g, b];
}

/**
 * Converts RGB values (0-255 range) to Three.js hex number
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Three.js hex color number
 * @example
 * rgb255ToHex(101, 67, 33) // 6636321 (0x654321)
 */
export function rgb255ToHex(r: number, g: number, b: number): number {
	return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}

/**
 * Converts RGB tuple (0-255 range) to hex string
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Hex string with # prefix
 * @example
 * rgb255ToHexString(101, 67, 33) // "#654321"
 */
export function rgb255ToHexString(r: number, g: number, b: number): string {
	return hexNumberToString(rgb255ToHex(r, g, b));
}

/**
 * Self-contained theme composable
 * Manages dark/light mode and provides reactive hex colors for Three.js
 */
export function useTheme() {
	const colorMode = useColorMode();

	// Reactive hex colors (re-compute when colorMode changes)
	const primary = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--primary"));
	});

	const primaryForeground = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--primary-foreground"));
	});

	const accent = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--accent"));
	});

	const accentForeground = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--accent-foreground"));
	});

	const background = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--background"));
	});

	const foreground = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--foreground"));
	});

	const muted = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--muted"));
	});

	const card = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--card"));
	});

	const border = computed(() => {
		colorMode.value;
		return rgbToHex(parseOklchColor("--border"));
	});

	/**
	 * Hydrate theme on app initialization
	 * Clears legacy color theme data from localStorage
	 */
	function hydrate() {
		// Clear legacy theme selection from localStorage
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem("color-theme");
		}
		// Remove legacy data-theme attribute
		if (typeof document !== "undefined") {
			document.documentElement.removeAttribute("data-theme");
		}
	}

	return {
		colorMode,
		primary,
		primaryForeground,
		accent,
		accentForeground,
		background,
		foreground,
		muted,
		card,
		border,
		hydrate,
	};
}
