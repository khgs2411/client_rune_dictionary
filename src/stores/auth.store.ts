import { useLocalStorage } from "@vueuse/core";
import { defineStore, acceptHMRUpdate } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore(
	"authStore",
	() => {
		const username = ref("");
		const password = ref("");
		const loading = ref(true);
		// const _currentTheme = useLocalStorage("current-theme", { name: <string | undefined>undefined, variable: <string | undefined>undefined, value: <string | undefined>undefined }) as Ref<ThemeData>;
		const _authorized = useLocalStorage("authorized", false);
		const authorized = computed(() => _authorized.value);
		
		function setAuthorized(value: boolean) {
			_authorized.value = value;
		}

		return {
			username,
			password,
			loading,
			authorized,

			setAuthorized,
		};
	},
	{
		persist: true,
	},
);

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
