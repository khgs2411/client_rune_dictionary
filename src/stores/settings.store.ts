import { defineStore } from "pinia";
import { ref } from "vue";
import { useColorMode } from "@vueuse/core";
import { useTheme } from "@/composables/useTheme";

export interface I_DebugConsoleSettings {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface I_DebugSettings {
	autoMatch: boolean; // Auto-start PvE match on reload (simulates double-click on TrainingDummy)
	enableConsoleLog: boolean; // Enable/disable console logs
	showStats: boolean; // Show/hide Three.js stats panel
	showWebSocketDebugger: boolean; // Show/hide WebSocket event debugger
	showPhysicsDebug: boolean; // Show/hide physics collider wireframes
	showGrimoire: boolean; // Show/hide Grimoire overlay
}

export const useSettingsStore = defineStore(
	"settings",
	() => {
		// Color mode (dark/light)

		// Theme composable (self-contained, manages its own state + localStorage)
		const theme = useTheme();

		// Debug Console settings
		const debugConsole = ref<I_DebugConsoleSettings>({
			x: window.innerWidth - 400 - 16,
			y: 64,
			width: 400,
			height: Math.min(window.innerHeight * 0.6, 600),
		});

		// Debug settings
		const debug = ref<I_DebugSettings>({
			autoMatch: false, // Default: disabled
			enableConsoleLog: true, // Default: enabled
			showStats: true, // Default: enabled
			showWebSocketDebugger: true, // Default: enabled
			showPhysicsDebug: false, // Default: disabled
			showGrimoire: false, // Default: disabled
		});

		// Toggle dark/light mode
		function toggleColorMode() {
			theme.colorMode.value = theme.colorMode.value === "dark" ? "light" : "dark";
		}

		// Update debug console settings
		function updateDebugConsole(settings: Partial<I_DebugConsoleSettings>) {
			debugConsole.value = { ...debugConsole.value, ...settings };
		}

		// Hydrate theme from localStorage on initialization
		theme.hydrate();

		return {
			// State
			theme,
			debugConsole,
			debug,

			// Actions
			toggleColorMode,
			updateDebugConsole,
		};
	},
	{
		persist: true,
	},
);
export type ApplicationSettings = ReturnType<typeof useSettingsStore>;
