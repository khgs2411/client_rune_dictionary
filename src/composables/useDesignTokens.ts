import { computed, CSSProperties } from "vue";
import {
	getToken,
	getColorToken,
	getSpacingToken,
	getShadowToken,
	getRadiusToken,
	getDurationToken,
	tokenPresets,
	mediaQuery,
	type DesignTokens,
	type SpacingTokens,
	type ShadowTokens,
	type BorderTokens,
	type AnimationTokens,
} from "../utils/design-tokens";

/**
 * Composable for accessing design tokens in Vue components
 */
export function useDesignTokens() {
	// Color helpers
	const colors = {
		primary: () => getColorToken("primary"),
		primaryHover: () => getColorToken("primary-hover"),
		primaryActive: () => getColorToken("primary-active"),

		mystic: (shade: number) => getColorToken(`mystic-${shade}`),
		parchment: (shade: number) => getColorToken(`parchment-${shade}`),
		blood: (shade: number) => getColorToken(`blood-${shade}`),

		text: () => getColorToken("text"),
		textMuted: () => getColorToken("text-muted"),
		background: () => getColorToken("background"),
		surface: () => getColorToken("surface"),

		success: () => getColorToken("success"),
		warning: () => getColorToken("warning"),
		danger: () => getColorToken("danger"),
		info: () => getColorToken("info"),
	};

	// Spacing helpers
	const spacing = (size: keyof SpacingTokens | number): string => {
		if (typeof size === "number") {
			return getSpacingToken(size as keyof SpacingTokens);
		}
		return getSpacingToken(size);
	};

	// Shadow helpers
	const shadow = (type: keyof ShadowTokens): string => {
		return getShadowToken(type);
	};

	// Border radius helpers
	const radius = (size: keyof BorderTokens["radius"]): string => {
		return getRadiusToken(size);
	};

	// Animation helpers
	const duration = (speed: keyof AnimationTokens["duration"]): string => {
		return getDurationToken(speed);
	};

	// Preset style helpers
	const cardStyle = computed<CSSProperties>(() => ({
		background: tokenPresets.card.background,
		borderRadius: tokenPresets.card.borderRadius,
		boxShadow: tokenPresets.card.boxShadow,
		padding: tokenPresets.card.padding,
	}));

	const buttonStyle = computed<CSSProperties>(() => ({
		borderRadius: tokenPresets.button.borderRadius,
		paddingLeft: tokenPresets.button.paddingX,
		paddingRight: tokenPresets.button.paddingX,
		paddingTop: tokenPresets.button.paddingY,
		paddingBottom: tokenPresets.button.paddingY,
		fontSize: tokenPresets.button.fontSize,
		fontWeight: tokenPresets.button.fontWeight as any,
		transition: tokenPresets.button.transition,
	}));

	const inputStyle = computed<CSSProperties>(() => ({
		borderRadius: tokenPresets.input.borderRadius,
		padding: tokenPresets.input.padding,
		fontSize: tokenPresets.input.fontSize,
		borderWidth: tokenPresets.input.borderWidth,
	}));

	const rpgGlowStyle = computed<CSSProperties>(() => ({
		boxShadow: tokenPresets.rpgGlow.boxShadow,
		transition: tokenPresets.rpgGlow.transition,
	}));

	// Utility functions
	const applyRPGGlow = (element: HTMLElement, size: "sm" | "md" | "lg" = "md") => {
		element.style.boxShadow = shadow(`glow${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof ShadowTokens);
	};

	const removeRPGGlow = (element: HTMLElement) => {
		element.style.boxShadow = "";
	};

	// Responsive helpers
	const isBreakpoint = (breakpoint: keyof DesignTokens["breakpoint"]): boolean => {
		if (typeof window === "undefined") return false;

		const breakpoints = {
			xs: 320,
			sm: 640,
			md: 768,
			lg: 1024,
			xl: 1280,
			"2xl": 1536,
		};

		return window.innerWidth >= breakpoints[breakpoint];
	};

	return {
		// Token accessors
		colors,
		spacing,
		shadow,
		radius,
		duration,

		// Preset styles
		cardStyle,
		buttonStyle,
		inputStyle,
		rpgGlowStyle,

		// Utility functions
		applyRPGGlow,
		removeRPGGlow,
		isBreakpoint,

		// Direct access to functions
		getToken,
		getColorToken,
		getSpacingToken,
		getShadowToken,
		getRadiusToken,
		getDurationToken,

		// Media query helper
		mediaQuery,
	};
}
