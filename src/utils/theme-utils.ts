/**
 * Minimal theme utilities that enhance PrimeVue without breaking it
 */

/**
 * Enable smooth theme transitions
 */
export function enableThemeTransition(): void {
	document.documentElement.classList.add("theme-transition");
	setTimeout(() => {
		document.documentElement.classList.remove("theme-transition");
	}, 300);
}

/**
 * Get CSS variable value
 */
export function getCSSVariable(variable: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Set CSS variable
 */
export function setCSSVariable(variable: string, value: string): void {
	document.documentElement.style.setProperty(variable, value);
}

/**
 * Design tokens that complement PrimeVue
 */
export const rpgTokens = {
	spacing: {
		xs: "0.25rem",
		sm: "0.5rem",
		md: "1rem",
		lg: "1.5rem",
		xl: "2rem",
		"2xl": "3rem",
		"3xl": "4rem",
	},

	borderRadius: {
		sm: "0.25rem",
		DEFAULT: "0.375rem",
		md: "0.5rem",
		lg: "0.75rem",
		xl: "1rem",
		"2xl": "1.5rem",
		full: "9999px",
	},

	animation: {
		critical: "100ms",
		transition: "300ms",
		decorative: "500ms",
	},
};
