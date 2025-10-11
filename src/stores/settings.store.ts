import { defineStore } from 'pinia';
import { useColorMode } from '@vueuse/core';
import { useTheme } from '@/composables/useTheme';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    // Color mode (dark/light)
    const colorMode = useColorMode();

    // Theme composable (self-contained, manages its own state + localStorage)
    const theme = useTheme();

    // Toggle dark/light mode
    function toggleColorMode() {
      colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
    }

    // Hydrate theme from localStorage on initialization
    theme.hydrate();

    return {
      // State
      colorMode,
      theme,

      // Actions
      toggleColorMode,
    };
  },
  {
    persist: true,
  },
);
export type SettingsStore = ReturnType<typeof useSettingsStore>;
