import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useTheme, type ColorTheme } from '@/composables/useTheme'

export const useSettingsStore = defineStore(
	'settings',
	() => {
		// Color mode (dark/light)
		const colorMode = useColorMode()

		// Current theme selection
		const currentTheme = ref<ColorTheme>('neutral')

		// Theme colors (reactive, converted for Three.js)
		// Pass currentTheme as trigger so colors update when theme changes
		const theme = useTheme(currentTheme)

		// Set theme
		function setTheme(newTheme: ColorTheme) {
			currentTheme.value = newTheme
			document.documentElement.setAttribute('data-theme', newTheme)
		}

		// Toggle dark/light mode
		function toggleColorMode() {
			colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
		}

		// Initialize theme from localStorage or default
		const savedTheme = localStorage.getItem('color-theme') as ColorTheme
		if (savedTheme) {
			setTheme(savedTheme)
		}

		// Persist theme changes
		function persistTheme(newTheme: ColorTheme) {
			localStorage.setItem('color-theme', newTheme)
			setTheme(newTheme)
		}

		return {
			// State
			colorMode,
			currentTheme,
			theme,

			// Actions
			setTheme: persistTheme,
			toggleColorMode,
		}
	},
	{
		persist: true,
	}
)
