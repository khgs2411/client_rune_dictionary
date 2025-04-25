import { useLocalStorage } from "@vueuse/core";
import { defineStore, acceptHMRUpdate } from "pinia";
import { WebsocketEntityData } from "topsyde-utils";
import { computed, ref } from "vue";

export const useAuthStore = defineStore(
	"authStore",
	() => {
		const username = useLocalStorage("username", "");
		const password = ref(import.meta.env.VITE_API_KEY);
		const loading = ref(true);
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

		return {
			username,
			password,
			loading,
			authorized,
			client,
			setAuthorized,
			setClient,
		};
	},
	/* {
		persist: true,
	}, */
);

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
