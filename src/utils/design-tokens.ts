/**
 * Design Token System - TypeScript Interface
 * Provides type-safe access to design tokens defined in CSS
 */

// Color token types
export interface ColorTokens {
	// Primary colors
	primary: string;
	primaryHover: string;
	primaryActive: string;
	primarySubtle: string;
	primaryMuted: string;

	// RPG-specific colors
	mystic: {
		50: string;
		100: string;
		200: string;
		300: string;
		400: string;
		500: string;
		600: string;
		700: string;
		800: string;
		900: string;
	};

	parchment: {
		50: string;
		100: string;
		200: string;
		300: string;
		400: string;
		500: string;
	};

	blood: {
		300: string;
		400: string;
		500: string;
		600: string;
		700: string;
	};

	// Semantic colors
	success: string;
	warning: string;
	danger: string;
	info: string;

	// Surface colors
	background: string;
	surface: string;
	surfaceHover: string;
	surfaceActive: string;

	// Text colors
	text: string;
	textMuted: string;
	textInverse: string;
}

// Typography token types
export interface TypographyTokens {
	fontFamily: {
		base: string;
		heading: string;
		mono: string;
	};

	fontSize: {
		xs: string;
		sm: string;
		base: string;
		lg: string;
		xl: string;
		"2xl": string;
		"3xl": string;
		"4xl": string;
		"5xl": string;
	};

	fontWeight: {
		normal: number;
		medium: number;
		semibold: number;
		bold: number;
	};

	lineHeight: {
		tight: number;
		normal: number;
		relaxed: number;
	};

	letterSpacing: {
		tight: string;
		normal: string;
		wide: string;
	};
}

// Spacing token types
export interface SpacingTokens {
	0: string;
	1: string;
	2: string;
	3: string;
	4: string;
	5: string;
	6: string;
	8: string;
	10: string;
	12: string;
	16: string;
	20: string;
	24: string;
	inline: string;
	stack: string;
	section: string;
}

// Border & Radius token types
export interface BorderTokens {
	width: {
		thin: string;
		medium: string;
		thick: string;
	};

	radius: {
		none: string;
		sm: string;
		md: string;
		lg: string;
		xl: string;
		"2xl": string;
		"3xl": string;
		full: string;
		card: string;
		button: string;
		input: string;
	};
}

// Shadow token types
export interface ShadowTokens {
	xs: string;
	sm: string;
	md: string;
	lg: string;
	xl: string;
	"2xl": string;
	glowSm: string;
	glowMd: string;
	glowLg: string;
	inner: string;
}

// Animation token types
export interface AnimationTokens {
	duration: {
		instant: string;
		fast: string;
		normal: string;
		slow: string;
		slower: string;
	};

	ease: {
		linear: string;
		in: string;
		out: string;
		inOut: string;
		bounce: string;
	};

	transition: {
		colors: string;
		transform: string;
		shadow: string;
		all: string;
	};
}

// Z-index token types
export interface ZIndexTokens {
	deep: number;
	base: number;
	raised: number;
	dropdown: number;
	sticky: number;
	fixed: number;
	modalBackdrop: number;
	modal: number;
	popover: number;
	tooltip: number;
	notification: number;
}

// Breakpoint token types
export interface BreakpointTokens {
	xs: string;
	sm: string;
	md: string;
	lg: string;
	xl: string;
	"2xl": string;
}

// Main design tokens interface
export interface DesignTokens {
	color: ColorTokens;
	typography: TypographyTokens;
	spacing: SpacingTokens;
	border: BorderTokens;
	shadow: ShadowTokens;
	animation: AnimationTokens;
	zIndex: ZIndexTokens;
	breakpoint: BreakpointTokens;
}

/**
 * Get a CSS custom property value
 */
export function getToken(token: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

/**
 * Get a color token value
 */
export function getColorToken(path: string): string {
	return getToken(`--color-${path}`);
}

/**
 * Get a spacing token value
 */
export function getSpacingToken(size: keyof SpacingTokens): string {
	return getToken(`--spacing-${size}`);
}

/**
 * Get a shadow token value
 */
export function getShadowToken(type: keyof ShadowTokens): string {
	const tokenName = type.replace(/([A-Z])/g, "-$1").toLowerCase();
	return getToken(`--shadow-${tokenName}`);
}

/**
 * Get a radius token value
 */
export function getRadiusToken(size: keyof BorderTokens["radius"]): string {
	return getToken(`--radius-${size}`);
}

/**
 * Get an animation duration token value
 */
export function getDurationToken(speed: keyof AnimationTokens["duration"]): string {
	return getToken(`--duration-${speed}`);
}

/**
 * Media query helpers using breakpoints
 */
export const breakpoints = {
	xs: "320px",
	sm: "640px",
	md: "768px",
	lg: "1024px",
	xl: "1280px",
	"2xl": "1536px",
} as const;

export const mediaQuery = {
	up: (breakpoint: keyof BreakpointTokens) => `@media (min-width: ${breakpoints[breakpoint]})`,
	down: (breakpoint: keyof BreakpointTokens) => `@media (max-width: ${breakpoints[breakpoint]})`,
	between: (min: keyof BreakpointTokens, max: keyof BreakpointTokens) => `@media (min-width: ${breakpoints[min]}) and (max-width: ${breakpoints[max]})`,
};

/**
 * Design token presets for common patterns
 */
export const tokenPresets = {
	// Card styles
	card: {
		background: "var(--color-surface)",
		borderRadius: "var(--radius-card)",
		boxShadow: "var(--shadow-md)",
		padding: "var(--spacing-6)",
	},

	// Button styles
	button: {
		borderRadius: "var(--radius-button)",
		paddingX: "var(--spacing-4)",
		paddingY: "var(--spacing-2)",
		fontSize: "var(--font-size-base)",
		fontWeight: "var(--font-weight-medium)",
		transition: "var(--transition-colors)",
	},

	// Input styles
	input: {
		borderRadius: "var(--radius-input)",
		padding: "var(--spacing-3)",
		fontSize: "var(--font-size-base)",
		borderWidth: "var(--border-width-thin)",
	},

	// RPG glow effect
	rpgGlow: {
		boxShadow: "var(--shadow-glow-md)",
		transition: "var(--transition-shadow)",
	},
};
