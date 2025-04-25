import { computedEager } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import AuthAPI from "../../api/auth.api";
import { useAuthStore } from "../../stores/auth.store";
import useUtils from "./useUtils";

const useAuth = () => {
	const store = useAuthStore();
	const { loading, username, password } = storeToRefs(store);
	const api_key = computed(() => import.meta.env.VITE_API_KEY);
	const router = useRouter();
	const utils = useUtils();
	const tryWebsocketConnection = ref(!utils.lib.IsEmpty(username.value));

	const client = computed(() => store.client);
	const authorized = computedEager(() => store.authorized);

	function logout() {
		const localStorage = window.localStorage;
		localStorage.removeItem("username");
		localStorage.removeItem("authorized");
		localStorage.removeItem("redirect");
		store.setAuthorized(false);
		store.setClient(null);
	}

	async function login(credentials: { username: string; password: string }) {
		try {
			const api = new AuthAPI("main");
			loading.value = true;
			username.value = credentials.username;
			password.value = credentials.password;

			const res = await api.login(credentials.username, credentials.password);
			if (!res.authorized) throw new Error("Login failed");

			// After successful login, perform handshake
			const handshakeApi = new AuthAPI("api", import.meta.env.VITE_HOST);
			const api_key_val = api_key.value;
			if (utils.lib.IsEmpty(username.value) || utils.lib.IsEmpty(password.value) || utils.lib.IsEmpty(api_key_val)) throw new Error("Invalid credentials");
			const handshakeRes = await handshakeApi.handshake(username.value, password.value, api_key_val);
			if (!handshakeRes.status) throw new Error("Handshake failed");

			store.setClient({
				id: handshakeRes.data.id,
				name: handshakeRes.data.name,
			});
			store.setAuthorized(true);

			utils.toast.success("Login successful", "center");
			router.push("/app");
			setTimeout(() => {
				loading.value = false;
			}, 1001);
		} catch (e) {
			loading.value = false;
			store.setAuthorized(false);
			store.setClient(null);
			utils.toast.error("Failed to login or connect to chat. Please check your credentials.");
		}
	}

	function websocketLogout() {
		store.setClient(null);
		username.value = "";
		tryWebsocketConnection.value = false;
		store.setAuthorized(false);
		utils.lib.Log("User logged out, returning to login screen");
	}

	async function websocketHandshake() {
		try {
			const api = new AuthAPI("api", import.meta.env.VITE_HOST);
			tryWebsocketConnection.value = true;
			loading.value = true;
			if (utils.lib.IsEmpty(username.value) || utils.lib.IsEmpty(password.value) || utils.lib.IsEmpty(api_key.value)) throw new Error("Invalid credentials");
			const response = await api.handshake(username.value, password.value, api_key.value);
			if (!response.status) throw new Error("Invalid handshake response");

			store.setClient({
				id: response.data.id,
				name: response.data.name,
			});

			utils.lib.Log("Handshake successful - client data:", client.value);
			loading.value = false;
		} catch (error) {
			tryWebsocketConnection.value = false;
			utils.toast.error("Handshake failed:");
			utils.lib.Warn("Handshake failed:", error);
		}
	}

	return {
		authorized,
		username,
		password,
		loading,
		client,
		tryWebsocketConnection,
		login,
		logout,
		websocketLogout,
		websocketHandshake,
	};
};
export default useAuth;
