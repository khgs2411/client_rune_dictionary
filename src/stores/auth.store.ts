import { useLocalStorage } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { WebsocketEntityData } from "topsyde-utils";
import { computed, ref } from "vue";

export const useAuthStore = defineStore(
	"authStore",
	() => {
		const username = useLocalStorage("username", "");
		const password = ref(import.meta.env.VITE_API_KEY);
		const _loading = ref(false);
		const _authorized = useLocalStorage("authorized", false);
		const _client = ref<WebsocketEntityData | null>(null);

		const authorized = computed(() => _authorized.value);
		const client = computed(() => _client.value);

		function setAuthorized(value: boolean) {
			_authorized.value = value;
		}

		function setClient(value: WebsocketEntityData | null) {
			_client.value = value;
		}

		function setLoading(value: boolean) {
			_loading.value = value;
		}

		const loading = computed(() => _loading.value);

		return {
			username,
			password,
			loading,
			authorized,
			client,
			setAuthorized,
			setClient,
			setLoading,
		};
	},
	/* {
		persist: true,
	}, */
);

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
