import { updatePrimaryPalette } from "@primevue/themes";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, Ref, ref, watch } from "vue";
import { COLOR_PRESETS } from "../common/consts/app.consts";
import { useLocalStorage } from "@vueuse/core";
export type Theme = keyof typeof COLOR_PRESETS;
export type ThemeData = { name: string; variable: string; value: any };
export const useSettingsStore = defineStore(
	"settingsStore",
	() => {
		const _visible = ref(false);
		const _darkMode = ref(true);

		const currentTheme = useLocalStorage("current-theme", { name: <string | undefined>undefined, variable: <string | undefined>undefined, value: <string | undefined>undefined }) as Ref<ThemeData>;
		const darkMode = computed(() => _darkMode.value);
		const visible = computed(() => _visible.value);

		function setTheme(themeData: ThemeData) {
			currentTheme.value = themeData;
			const theme = currentTheme.value.name.split("-")[3];
			updatePrimaryPalette({
				50: `{${theme}.50}`,
				100: `{${theme}.100}`,
				200: `{${theme}.200}`,
				300: `{${theme}.300}`,
				400: `{${theme}.400}`,
				500: `{${theme}.500}`,
				600: `{${theme}.600}`,
				700: `{${theme}.700}`,
				800: `{${theme}.800}`,
				900: `{${theme}.900}`,
				950: `{${theme}.950}`,
			});
		}

		function setDarkMode(value: boolean) {
			_darkMode.value = value;
		}

        function setVisible(value: boolean) {
            _visible.value = value;
        }

		if (currentTheme.value.name) setTheme(currentTheme.value);

		watch(
			() => _darkMode.value,
			(value) => {
				document.documentElement.classList.toggle("dark", value);
			},
			{
				immediate: true,
			},
		);

		return {
			darkMode,
			visible,

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
