import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, Ref, ref, watch } from "vue";
import { COLOR_PRESETS } from "../common/consts/app.consts";
import { useLocalStorage } from "@vueuse/core";
import { enableThemeTransition } from "../utils/theme-utils";
import { colorSystem, type ThemeName } from "../utils/color-system";
export type Theme = keyof typeof COLOR_PRESETS;
export type ThemeData = { name: string; variable: string; value: any };
export type CurrentThemeData = ThemeData & { group: string | undefined };
export const useSettingsStore = defineStore(
	"settingsStore",
	() => {
		const _visible = ref(false);
		const _darkMode = useLocalStorage("darkMode", true);

		const _currentTheme = useLocalStorage("current-theme", {
			group: <string | undefined>undefined,
			name: <string | undefined>undefined,
			variable: <string | undefined>undefined,
			value: <string | undefined>undefined,
		}) as Ref<CurrentThemeData>;

		const darkMode = computed(() => _darkMode.value);
		const visible = computed(() => _visible.value);
		const currentTheme = computed(() => _currentTheme.value);

		function setTheme(themeData: ThemeData) {
			const theme = themeData.name.split("-")[3];
			_currentTheme.value = { name: themeData.name, value: themeData.value, variable: themeData.variable, group: theme };

			// Enable smooth transition
			enableThemeTransition();

			// Use centralized color system - SINGLE SOURCE OF TRUTH
			// This now handles PrimeVue palette updates internally
			colorSystem.applyTheme(theme as ThemeName, _darkMode.value ? 'dark' : 'light');
		}

		function setDarkMode(value: boolean) {
			_darkMode.value = value;
		}

		function setVisible(value: boolean) {
			_visible.value = value;
		}

		if (_currentTheme.value.name) setTheme(_currentTheme.value);

		watch(
			() => _darkMode.value,
			(value) => {
				document.documentElement.classList.toggle("dark", value);
				// Use centralized color system when dark mode changes
				if (_currentTheme.value.group) {
					colorSystem.applyTheme(_currentTheme.value.group as ThemeName, value ? 'dark' : 'light');
				}
			},
			{
				immediate: true,
			},
		);

		return {
			darkMode,
			visible,
			currentTheme,

			setVisible,
			setTheme,
			setDarkMode,
		};
	},
	{ persist: true },
);

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
