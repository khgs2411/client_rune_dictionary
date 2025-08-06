import { computedEager } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRouter } from "vue-router";
import AuthAPI from "../../api/auth.api";
import { useAuthStore } from "../../stores/auth.store";
import useUtils from "./useUtils";

const useAuth = () => {
	const store = useAuthStore();
	const { username, password } = storeToRefs(store);
	const loading = computed(() => store.loading);
	const api_key = computed(() => import.meta.env.VITE_API_KEY);
	const router = useRouter();
	const utils = useUtils();

	const client = computed(() => store.client);
	const authorized = computedEager(() => store.authorized);

	function logout() {
		const localStorage = window.localStorage;
		localStorage.removeItem("username");
		localStorage.removeItem("authorized");
		localStorage.removeItem("redirect");
		store.setAuthorized(false);
		store.setClient(null);
		password.value = ""; // SECURITY: Clear password on logout
		username.value = ""; // Also clear username for full session reset
	}

	async function performLogin(username: string, password: string) {
		const api = new AuthAPI("main");
		const res = await api.login(username, password);
		return res;
	}

	async function performHandshake(username: string, password: string, api_key: string) {
		const api = new AuthAPI("api", import.meta.env.VITE_HOST);
		const handshakeRes = await api.handshake(username, password, api_key);
		return handshakeRes;
	}

	async function login(credentials: { username: string; password: string }) {
		try {
			store.setLoading(true);
			username.value = credentials.username;
			password.value = credentials.password;

			//? Login
			const res = await performLogin(credentials.username, credentials.password);
			if (!res.authorized) throw new Error("Login failed");

			//? Handshake
			const api_key_val = api_key.value;
			if (utils.lib.IsEmpty(username.value) || utils.lib.IsEmpty(password.value) || utils.lib.IsEmpty(api_key_val)) throw new Error("Invalid credentials");
			const handshakeRes = await performHandshake(username.value, password.value, api_key_val);
			if (!handshakeRes.status) throw new Error("Handshake failed");

			//? Set state and navigate
			store.setClient({
				id: handshakeRes.data.id,
				name: handshakeRes.data.name,
			});

			store.setAuthorized(true);

			store.setLoading( false);

			utils.toast.success("Login successful", "top-center");
			router.push("/home");

		} catch (e) {
			store.setLoading(false);
			store.setAuthorized(false);
			store.setClient(null);
			utils.toast.error("Failed to login or connect to chat. Please check your credentials.");
		}
	}

	return {
		authorized,
		username,
		password,
		loading,
		client,
		login,
		logout,
	};
};
export default useAuth;
