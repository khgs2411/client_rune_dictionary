/**
 * CENTRALIZED COLOR SYSTEM
 * This is the SINGLE SOURCE OF TRUTH for all colors in the application.
 * All UI libraries (PrimeVue, shadcn, custom components) must reference this system.
 */

import { setCSSVariable } from './theme-utils';

/**
 * Core color definitions for all themes
 * Using oklch for perceptually uniform colors
 */
export const COLOR_THEMES = {
	emerald: {
		light: {
			// Primary colors
			primary: "oklch(0.568 0.197 158.76)",
			primaryForeground: "oklch(0.985 0 0)",

			// Secondary colors
			secondary: "oklch(0.869 0.058 158.76)",
			secondaryForeground: "oklch(0.205 0 0)",

			// Accent colors
			accent: "oklch(0.869 0.058 158.76)",
			accentForeground: "oklch(0.205 0 0)",

			// Muted colors
			muted: "oklch(0.97 0 0)",
			mutedForeground: "oklch(0.556 0 0)",

			// Destructive colors
			destructive: "oklch(0.577 0.245 27.325)",
			destructiveForeground: "oklch(0.985 0 0)",

			// Base colors
			background: "oklch(1 0 0)",
			foreground: "oklch(0.145 0 0)",

			// Card colors
			card: "oklch(1 0 0)",
			cardForeground: "oklch(0.145 0 0)",

			// Popover colors
			popover: "oklch(1 0 0)",
			popoverForeground: "oklch(0.145 0 0)",

			// Border and input
			border: "oklch(0.922 0 0)",
			input: "oklch(0.922 0 0)",
			ring: "oklch(0.568 0.197 158.76)",
			
			// Chart colors for data visualization
			chart1: "oklch(0.646 0.222 41.116)",
			chart2: "oklch(0.6 0.118 184.704)",
			chart3: "oklch(0.398 0.07 227.392)",
			chart4: "oklch(0.828 0.189 84.429)",
			chart5: "oklch(0.769 0.188 70.08)",
			
			// Sidebar colors
			sidebarBackground: "oklch(0.985 0 0)",
			sidebarForeground: "oklch(0.145 0 0)",
			sidebarPrimary: "oklch(0.568 0.197 158.76)",
			sidebarPrimaryForeground: "oklch(0.985 0 0)",
			sidebarAccent: "oklch(0.97 0 0)",
			sidebarAccentForeground: "oklch(0.205 0 0)",
			sidebarBorder: "oklch(0.922 0 0)",
			sidebarRing: "oklch(0.568 0.197 158.76)",
		},
		dark: {
			primary: "oklch(0.721 0.184 158.76)",
			primaryForeground: "oklch(0.145 0 0)",
			secondary: "oklch(0.269 0.058 158.76)",
			secondaryForeground: "oklch(0.985 0 0)",
			accent: "oklch(0.269 0.058 158.76)",
			accentForeground: "oklch(0.985 0 0)",
			muted: "oklch(0.269 0 0)",
			mutedForeground: "oklch(0.708 0 0)",
			destructive: "oklch(0.704 0.191 22.216)",
			destructiveForeground: "oklch(0.985 0 0)",
			background: "oklch(0.145 0 0)",
			foreground: "oklch(0.985 0 0)",
			card: "oklch(0.205 0 0)",
			cardForeground: "oklch(0.985 0 0)",
			popover: "oklch(0.205 0 0)",
			popoverForeground: "oklch(0.985 0 0)",
			border: "oklch(0.269 0 0)",
			input: "oklch(0.269 0 0)",
			ring: "oklch(0.721 0.184 158.76)",
			
			// Chart colors for data visualization
			chart1: "oklch(0.488 0.243 264.376)",
			chart2: "oklch(0.696 0.17 162.48)",
			chart3: "oklch(0.769 0.188 70.08)",
			chart4: "oklch(0.627 0.265 303.9)",
			chart5: "oklch(0.645 0.246 16.439)",
			
			// Sidebar colors
			sidebarBackground: "oklch(0.205 0 0)",
			sidebarForeground: "oklch(0.985 0 0)",
			sidebarPrimary: "oklch(0.721 0.184 158.76)",
			sidebarPrimaryForeground: "oklch(0.985 0 0)",
			sidebarAccent: "oklch(0.269 0 0)",
			sidebarAccentForeground: "oklch(0.985 0 0)",
			sidebarBorder: "oklch(0.269 0 0)",
			sidebarRing: "oklch(0.721 0.184 158.76)",
		},
	},
	blue: {
		light: {
			primary: "oklch(0.519 0.243 264.05)",
			primaryForeground: "oklch(0.985 0 0)",
			secondary: "oklch(0.869 0.058 264.05)",
			secondaryForeground: "oklch(0.205 0 0)",
			accent: "oklch(0.869 0.058 264.05)",
			accentForeground: "oklch(0.205 0 0)",
			muted: "oklch(0.97 0 0)",
			mutedForeground: "oklch(0.556 0 0)",
			destructive: "oklch(0.577 0.245 27.325)",
			destructiveForeground: "oklch(0.985 0 0)",
			background: "oklch(1 0 0)",
			foreground: "oklch(0.145 0 0)",
			card: "oklch(1 0 0)",
			cardForeground: "oklch(0.145 0 0)",
			popover: "oklch(1 0 0)",
			popoverForeground: "oklch(0.145 0 0)",
			border: "oklch(0.922 0 0)",
			input: "oklch(0.922 0 0)",
			ring: "oklch(0.519 0.243 264.05)",
		},
		dark: {
			primary: "oklch(0.632 0.216 264.05)",
			primaryForeground: "oklch(0.145 0 0)",
			secondary: "oklch(0.269 0.058 264.05)",
			secondaryForeground: "oklch(0.985 0 0)",
			accent: "oklch(0.269 0.058 264.05)",
			accentForeground: "oklch(0.985 0 0)",
			muted: "oklch(0.269 0 0)",
			mutedForeground: "oklch(0.708 0 0)",
			destructive: "oklch(0.704 0.191 22.216)",
			destructiveForeground: "oklch(0.985 0 0)",
			background: "oklch(0.145 0 0)",
			foreground: "oklch(0.985 0 0)",
			card: "oklch(0.205 0 0)",
			cardForeground: "oklch(0.985 0 0)",
			popover: "oklch(0.205 0 0)",
			popoverForeground: "oklch(0.985 0 0)",
			border: "oklch(0.269 0 0)",
			input: "oklch(0.269 0 0)",
			ring: "oklch(0.632 0.216 264.05)",
		},
	},
	violet: { light: { primary: "oklch(0.527 0.267 301.36)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 301.36)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 301.36)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.527 0.267 301.36)" }, dark: { primary: "oklch(0.679 0.236 301.36)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 301.36)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 301.36)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.679 0.236 301.36)" } },
	purple: { light: { primary: "oklch(0.558 0.253 283.74)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 283.74)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 283.74)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.558 0.253 283.74)" }, dark: { primary: "oklch(0.702 0.218 283.74)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 283.74)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 283.74)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.702 0.218 283.74)" } },
	pink: { light: { primary: "oklch(0.647 0.247 16.44)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 16.44)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 16.44)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.647 0.247 16.44)" }, dark: { primary: "oklch(0.745 0.213 16.44)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 16.44)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 16.44)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.745 0.213 16.44)" } },
	red: { light: { primary: "oklch(0.577 0.245 27.33)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 27.33)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 27.33)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.577 0.245 27.33)" }, dark: { primary: "oklch(0.704 0.191 22.22)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 22.22)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 22.22)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.704 0.191 22.22)" } },
	orange: { light: { primary: "oklch(0.646 0.222 41.12)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 41.12)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 41.12)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.646 0.222 41.12)" }, dark: { primary: "oklch(0.741 0.183 45.07)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 45.07)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 45.07)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.741 0.183 45.07)" } },
	yellow: { light: { primary: "oklch(0.829 0.189 84.43)", primaryForeground: "oklch(0.205 0 0)", secondary: "oklch(0.869 0.058 84.43)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 84.43)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.829 0.189 84.43)" }, dark: { primary: "oklch(0.871 0.152 91.67)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 91.67)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 91.67)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.871 0.152 91.67)" } },
	green: { light: { primary: "oklch(0.592 0.181 142.49)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 142.49)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 142.49)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.592 0.181 142.49)" }, dark: { primary: "oklch(0.738 0.154 142.49)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 142.49)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 142.49)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.738 0.154 142.49)" } },
	lime: { light: { primary: "oklch(0.716 0.238 127.72)", primaryForeground: "oklch(0.205 0 0)", secondary: "oklch(0.869 0.058 127.72)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 127.72)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.716 0.238 127.72)" }, dark: { primary: "oklch(0.832 0.195 127.72)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 127.72)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 127.72)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.832 0.195 127.72)" } },
	amber: { light: { primary: "oklch(0.7695 0.188 70.08)", primaryForeground: "oklch(0.205 0 0)", secondary: "oklch(0.869 0.058 70.08)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 70.08)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.7695 0.188 70.08)" }, dark: { primary: "oklch(0.847 0.159 70.08)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 70.08)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 70.08)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.847 0.159 70.08)" } },
	teal: { light: { primary: "oklch(0.556 0.144 180.72)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 180.72)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 180.72)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.556 0.144 180.72)" }, dark: { primary: "oklch(0.703 0.13 183.85)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 183.85)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 183.85)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.703 0.13 183.85)" } },
	cyan: { light: { primary: "oklch(0.601 0.169 200.87)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 200.87)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 200.87)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.601 0.169 200.87)" }, dark: { primary: "oklch(0.719 0.141 208.85)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 208.85)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 208.85)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.719 0.141 208.85)" } },
	sky: { light: { primary: "oklch(0.583 0.202 237.07)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 237.07)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 237.07)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.583 0.202 237.07)" }, dark: { primary: "oklch(0.687 0.169 237.07)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 237.07)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 237.07)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.687 0.169 237.07)" } },
	indigo: { light: { primary: "oklch(0.511 0.262 274.03)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 274.03)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 274.03)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.511 0.262 274.03)" }, dark: { primary: "oklch(0.649 0.243 274.03)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 274.03)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 274.03)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.649 0.243 274.03)" } },
	fuchsia: { light: { primary: "oklch(0.635 0.266 328.36)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 328.36)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 328.36)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.635 0.266 328.36)" }, dark: { primary: "oklch(0.747 0.223 328.36)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 328.36)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 328.36)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.747 0.223 328.36)" } },
	rose: { light: { primary: "oklch(0.636 0.237 11.35)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.058 11.35)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.058 11.35)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.636 0.237 11.35)" }, dark: { primary: "oklch(0.759 0.19 11.35)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.058 11.35)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.058 11.35)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.759 0.19 11.35)" } },
	slate: { light: { primary: "oklch(0.391 0.022 252.89)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.01 252.89)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.01 252.89)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.391 0.022 252.89)" }, dark: { primary: "oklch(0.831 0.006 252.89)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.006 252.89)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.006 252.89)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.831 0.006 252.89)" } },
	gray: { light: { primary: "oklch(0.398 0 0)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0 0)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0 0)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.398 0 0)" }, dark: { primary: "oklch(0.831 0 0)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0 0)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0 0)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.831 0 0)" } },
	zinc: { light: { primary: "oklch(0.392 0.015 265.75)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.006 265.75)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.006 265.75)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.392 0.015 265.75)" }, dark: { primary: "oklch(0.823 0.004 265.75)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.004 265.75)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.004 265.75)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.823 0.004 265.75)" } },
	stone: { light: { primary: "oklch(0.398 0.007 227.39)", primaryForeground: "oklch(0.985 0 0)", secondary: "oklch(0.869 0.003 227.39)", secondaryForeground: "oklch(0.205 0 0)", accent: "oklch(0.869 0.003 227.39)", accentForeground: "oklch(0.205 0 0)", muted: "oklch(0.97 0 0)", mutedForeground: "oklch(0.556 0 0)", destructive: "oklch(0.577 0.245 27.325)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(1 0 0)", foreground: "oklch(0.145 0 0)", card: "oklch(1 0 0)", cardForeground: "oklch(0.145 0 0)", popover: "oklch(1 0 0)", popoverForeground: "oklch(0.145 0 0)", border: "oklch(0.922 0 0)", input: "oklch(0.922 0 0)", ring: "oklch(0.398 0.007 227.39)" }, dark: { primary: "oklch(0.819 0.002 227.39)", primaryForeground: "oklch(0.145 0 0)", secondary: "oklch(0.269 0.002 227.39)", secondaryForeground: "oklch(0.985 0 0)", accent: "oklch(0.269 0.002 227.39)", accentForeground: "oklch(0.985 0 0)", muted: "oklch(0.269 0 0)", mutedForeground: "oklch(0.708 0 0)", destructive: "oklch(0.704 0.191 22.216)", destructiveForeground: "oklch(0.985 0 0)", background: "oklch(0.145 0 0)", foreground: "oklch(0.985 0 0)", card: "oklch(0.205 0 0)", cardForeground: "oklch(0.985 0 0)", popover: "oklch(0.205 0 0)", popoverForeground: "oklch(0.985 0 0)", border: "oklch(1 0 0 / 10%)", input: "oklch(1 0 0 / 15%)", ring: "oklch(0.819 0.002 227.39)" } },
	neutral: {
		light: {
			primary: "oklch(0.205 0 0)",
			primaryForeground: "oklch(0.985 0 0)",
			secondary: "oklch(0.97 0 0)",
			secondaryForeground: "oklch(0.205 0 0)",
			accent: "oklch(0.97 0 0)",
			accentForeground: "oklch(0.205 0 0)",
			muted: "oklch(0.97 0 0)",
			mutedForeground: "oklch(0.556 0 0)",
			destructive: "oklch(0.577 0.245 27.325)",
			destructiveForeground: "oklch(0.985 0 0)",
			background: "oklch(1 0 0)",
			foreground: "oklch(0.145 0 0)",
			card: "oklch(1 0 0)",
			cardForeground: "oklch(0.145 0 0)",
			popover: "oklch(1 0 0)",
			popoverForeground: "oklch(0.145 0 0)",
			border: "oklch(0.922 0 0)",
			input: "oklch(0.922 0 0)",
			ring: "oklch(0.708 0 0)",
		},
		dark: {
			primary: "oklch(0.922 0 0)",
			primaryForeground: "oklch(0.205 0 0)",
			secondary: "oklch(0.269 0 0)",
			secondaryForeground: "oklch(0.985 0 0)",
			accent: "oklch(0.269 0 0)",
			accentForeground: "oklch(0.985 0 0)",
			muted: "oklch(0.269 0 0)",
			mutedForeground: "oklch(0.708 0 0)",
			destructive: "oklch(0.704 0.191 22.216)",
			destructiveForeground: "oklch(0.985 0 0)",
			background: "oklch(0.145 0 0)",
			foreground: "oklch(0.985 0 0)",
			card: "oklch(0.205 0 0)",
			cardForeground: "oklch(0.985 0 0)",
			popover: "oklch(0.205 0 0)",
			popoverForeground: "oklch(0.985 0 0)",
			border: "oklch(0.269 0 0)",
			input: "oklch(0.269 0 0)",
			ring: "oklch(0.556 0 0)",
		},
	},
} as const;

// Add all other theme colors here (I'll keep it short for now, but you should add all 23)
export type ThemeName = keyof typeof COLOR_THEMES;
export type ColorMode = 'light' | 'dark';

/**
 * CSS Variable mappings
 * These map our color system to CSS variables used by different libraries
 */
const CSS_VARIABLE_MAP = {
	// Core system variables (our standard)
	primary: '--primary',
	primaryForeground: '--primary-foreground',
	secondary: '--secondary',
	secondaryForeground: '--secondary-foreground',
	accent: '--accent',
	accentForeground: '--accent-foreground',
	muted: '--muted',
	mutedForeground: '--muted-foreground',
	destructive: '--destructive',
	destructiveForeground: '--destructive-foreground',
	background: '--background',
	foreground: '--foreground',
	card: '--card',
	cardForeground: '--card-foreground',
	popover: '--popover',
	popoverForeground: '--popover-foreground',
	border: '--border',
	input: '--input',
	ring: '--ring',
	
	// Chart colors
	chart1: '--chart-1',
	chart2: '--chart-2',
	chart3: '--chart-3',
	chart4: '--chart-4',
	chart5: '--chart-5',
	
	// Sidebar colors (matching CSS expectations)
	sidebarBackground: '--sidebar', // Main sidebar background
	sidebarForeground: '--sidebar-foreground',
	sidebarPrimary: '--sidebar-primary',
	sidebarPrimaryForeground: '--sidebar-primary-foreground',
	sidebarAccent: '--sidebar-accent',
	sidebarAccentForeground: '--sidebar-accent-foreground',
	sidebarBorder: '--sidebar-border',
	sidebarRing: '--sidebar-ring',

	// PrimeVue specific mappings
	'p-primary': '--p-primary-color',
	'p-primary-contrast': '--p-primary-contrast-color',
	'p-surface': '--p-surface-0',
	'p-surface-card': '--p-surface-card',
	'p-content-background': '--p-content-background',
	'p-content-border-color': '--p-content-border-color',
	'p-text-color': '--p-text-color',

	// Any future library mappings go here
} as const;

/**
 * Color System Manager
 * The single point of control for all colors in the application
 */
export class ColorSystem {
	private static instance: ColorSystem;
	private currentTheme: ThemeName = 'neutral';
	private currentMode: ColorMode = 'light';

	private constructor() { }

	static getInstance(): ColorSystem {
		if (!ColorSystem.instance) {
			ColorSystem.instance = new ColorSystem();
		}
		return ColorSystem.instance;
	}

	/**
	 * Apply a theme to the application
	 * This is the ONLY method that should be used to change colors
	 */
	applyTheme(themeName: ThemeName, mode: ColorMode): void {
		this.currentTheme = themeName;
		this.currentMode = mode;

		const theme = COLOR_THEMES[themeName] || COLOR_THEMES.neutral;
		const colors = theme[mode];

		// Apply core system variables
		Object.entries(colors).forEach(([key, value]) => {
			const cssVar = CSS_VARIABLE_MAP[key as keyof typeof colors];
			if (cssVar) {
				setCSSVariable(cssVar, value);
			}
		});

		// Update PrimeVue primary palette for compatibility
		this.updatePrimeVuePalette(themeName);

		// Map to PrimeVue variables
		this.mapToPrimeVue(colors);

		// Map to any other UI library variables
		this.mapToOtherLibraries(colors);
	}

	/**
	 * Convert oklch color to RGB values for PrimeVue compatibility
	 * Uses CSS's native color conversion via computed styles
	 */
	private oklchToRgb(oklchString: string): string {
		// Create a temporary element to compute the color
		const temp = document.createElement('div');
		temp.style.color = oklchString;
		document.body.appendChild(temp);
		
		// Get computed RGB value
		const rgb = window.getComputedStyle(temp).color;
		document.body.removeChild(temp);
		
		// Extract RGB values from "rgb(r, g, b)" or "rgba(r, g, b, a)"
		const match = rgb.match(/\d+/g);
		if (match && match.length >= 3) {
			return `${match[0]}, ${match[1]}, ${match[2]}`;
		}
		
		// Fallback
		return "128, 128, 128";
	}

	/**
	 * Map our colors to PrimeVue's expected variables
	 */
	private mapToPrimeVue(colors: Record<string, string>): void {
		// PrimeVue primary colors
		setCSSVariable('--p-primary-color', colors.primary);
		setCSSVariable('--p-primary-contrast-color', colors.primaryForeground);
		
		// PrimeVue RGB variables for components that need them
		setCSSVariable('--p-primary-500-rgb', this.oklchToRgb(colors.primary));

		// PrimeVue surface colors - surface-0 is always the lightest, surface-900 is always the darkest
		if (this.currentMode === 'dark') {
			// In dark mode, lightest to darkest progression
			setCSSVariable('--p-surface-0', colors.foreground); // Lightest (white text)
			setCSSVariable('--p-surface-50', colors.mutedForeground);
			setCSSVariable('--p-surface-100', colors.muted);
			setCSSVariable('--p-surface-200', colors.accent);
			setCSSVariable('--p-surface-300', colors.secondary);
			setCSSVariable('--p-surface-400', colors.border);
			setCSSVariable('--p-surface-500', colors.input);
			setCSSVariable('--p-surface-600', colors.card);
			setCSSVariable('--p-surface-700', colors.popover);
			setCSSVariable('--p-surface-800', colors.popover);
			setCSSVariable('--p-surface-900', colors.background); // Darkest (black background)
		} else {
			// In light mode, lightest to darkest progression
			setCSSVariable('--p-surface-0', colors.background); // Lightest (white background)
			setCSSVariable('--p-surface-50', colors.card);
			setCSSVariable('--p-surface-100', colors.popover);
			setCSSVariable('--p-surface-200', colors.muted);
			setCSSVariable('--p-surface-300', colors.accent);
			setCSSVariable('--p-surface-400', colors.secondary);
			setCSSVariable('--p-surface-500', colors.border);
			setCSSVariable('--p-surface-600', colors.input);
			setCSSVariable('--p-surface-700', colors.mutedForeground);
			setCSSVariable('--p-surface-800', colors.mutedForeground);
			setCSSVariable('--p-surface-900', colors.foreground); // Darkest (black text)
		}

		// PrimeVue content colors
		setCSSVariable('--p-content-background', colors.background);
		setCSSVariable('--p-content-border-color', colors.border);
		setCSSVariable('--p-text-color', colors.foreground);
		setCSSVariable('--p-text-muted-color', colors.mutedForeground);

		// PrimeVue component-specific
		setCSSVariable('--p-surface-card', colors.card);
		
		// Dialog/Popover specific mappings for proper text color
		setCSSVariable('--p-dialog-background', colors.popover);
		setCSSVariable('--p-dialog-color', colors.popoverForeground);
		setCSSVariable('--p-overlay-modal-background', colors.popover);
		setCSSVariable('--p-overlay-modal-color', colors.popoverForeground);
		setCSSVariable('--p-overlay-popover-background', colors.popover);
		setCSSVariable('--p-overlay-popover-color', colors.popoverForeground);
		setCSSVariable('--p-overlay-select-background', colors.popover);
		setCSSVariable('--p-overlay-select-color', colors.popoverForeground);
	}

	/**
	 * Update PrimeVue's primary palette
	 * This will be removed once we fully migrate away from PrimeVue themes
	 */
	private updatePrimeVuePalette(themeName: string): void {
		// Dynamic import to avoid circular dependency
		import('@primevue/themes').then(({ updatePrimaryPalette }) => {
			updatePrimaryPalette({
				50: `{${themeName}.50}`,
				100: `{${themeName}.100}`,
				200: `{${themeName}.200}`,
				300: `{${themeName}.300}`,
				400: `{${themeName}.400}`,
				500: `{${themeName}.500}`,
				600: `{${themeName}.600}`,
				700: `{${themeName}.700}`,
				800: `{${themeName}.800}`,
				900: `{${themeName}.900}`,
				950: `{${themeName}.950}`,
			});
		}).catch(err => {
			console.warn('Failed to update PrimeVue palette:', err);
		});
	}

	/**
	 * Map to other UI libraries as needed
	 */
	private mapToOtherLibraries(colors: Record<string, string>) {
		const _colors = colors;
		return _colors;
		// Future library mappings go here
		// For example, if we add Material UI, Ant Design, etc.
	}

	/**
	 * Get the current theme configuration
	 */
	getCurrentTheme(): { theme: ThemeName; mode: ColorMode } {
		return {
			theme: this.currentTheme,
			mode: this.currentMode,
		};
	}

	/**
	 * Get a specific color value from the current theme
	 */
	getColor(colorKey: keyof typeof COLOR_THEMES.neutral.light): string {
		const theme = COLOR_THEMES[this.currentTheme] || COLOR_THEMES.neutral;
		return theme[this.currentMode][colorKey];
	}
}

// Export singleton instance
export const colorSystem = ColorSystem.getInstance();