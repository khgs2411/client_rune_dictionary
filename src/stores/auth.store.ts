import { useLocalStorage, useNow } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, Ref } from "vue";

const TTL_MINUTES = 10;
const TTL_MS = TTL_MINUTES * 60 * 1000;

export const useAuthStore = defineStore("auth", () => {
	const username = useLocalStorage("auth_username", "admin");
	const password = useLocalStorage("auth_password", "r_d_25c9dd62-ba12-44de-b303-67ef659ba7bd");
	// Store auth token and expiration timestamp
	const authToken: Ref<string | null> = useLocalStorage("auth_token", null);
	const expiresAt: Ref<number | null> = useLocalStorage("auth_expires_at", null);

	// Get current time reactively
	const now = useNow();

	// Check if auth is valid and not expired
	const isAuthenticated = computed(() => {
		if (!authToken.value || !expiresAt.value) {
			return false;
		}
		return now.value.getTime() < expiresAt.value;
	});

	// Set auth cookie and TTL
	function setAuth(token: string) {
		authToken.value = token;
		expiresAt.value = Date.now() + TTL_MS;
	}

	// Refresh TTL if still valid
	function refreshTTL() {
		if (isAuthenticated.value) {
			expiresAt.value = Date.now() + TTL_MS;
			return true;
		}
		return false;
	}

	// Clear auth
	function logout() {
		authToken.value = null;
		expiresAt.value = null;
	}

	return {
		// State
		username,
		password,
		authToken,
		expiresAt,
		isAuthenticated,

		// Actions
		setAuth,
		refreshTTL,
		logout,
	};
});
