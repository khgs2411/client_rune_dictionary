import { defineStore, acceptHMRUpdate } from "pinia";

export const useAuthStore = defineStore("authStore", () => {

	return {};
}, {
    persist: true,
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
