import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useColorMode } from '@vueuse/core';
import { useTheme } from '@/composables/useTheme';

export interface I_DebugConsoleSettings {
	x: number;
	y: number;
	width: number;
	height: number;
}

export const useSettingsStore = defineStore(
	'settings',
	() => {
		// Color mode (dark/light)
		const colorMode = useColorMode();

		// Theme composable (self-contained, manages its own state + localStorage)
		const theme = useTheme();

		// Debug Console settings
		const debugConsole = ref<I_DebugConsoleSettings>({
			x: window.innerWidth - 400 - 16,
			y: 64,
			width: 400,
			height: Math.min(window.innerHeight * 0.6, 600),
		});

		// Toggle dark/light mode
		function toggleColorMode() {
			colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
		}

		// Update debug console settings
		function updateDebugConsole(settings: Partial<I_DebugConsoleSettings>) {
			debugConsole.value = { ...debugConsole.value, ...settings };
		}

		// Hydrate theme from localStorage on initialization
		theme.hydrate();

		return {
			// State
			colorMode,
			theme,
			debugConsole,

			// Actions
			toggleColorMode,
			updateDebugConsole,
		};
	},
	{
		persist: true,
	}
);
export type SettingsStore = ReturnType<typeof useSettingsStore>;
