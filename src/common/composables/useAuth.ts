import { computedEager } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../stores/auth.store";
import { WebsocketEntityData } from "topsyde-utils";
import { computed, ref } from "vue";
import AuthAPI from "../../api/auth.api";
import useUtils from "./useUtils";
import { useRouter } from "vue-router";

const useAuth = () => {
	const store = useAuthStore();
	const { loading, username, password } = storeToRefs(store);
	const api_key = computed(() => import.meta.env.VITE_API_KEY);
	const router = useRouter();
	const utils = useUtils();
	const client = ref<WebsocketEntityData | null>(null);
	const tryWebsocketConnection = ref(!utils.lib.IsEmpty(username.value));

	const authorized = computedEager(() => store.authorized);

	function logout() {
		const localStorage = window.localStorage;
		localStorage.removeItem("username");
		localStorage.removeItem("authorized");
		localStorage.removeItem("redirect");
		store.setAuthorized(false);
	}

	async function login(credentials: { username: string; password: string }) {
		try {
			const api = new AuthAPI("main");
			loading.value = true;

			// Update store values
			username.value = credentials.username;
			password.value = credentials.password;

			const res = await api.login(credentials.username, credentials.password);
			console.log(res);
			store.setAuthorized(res.authorized);

			utils.toast.success("Login successful", "center");

			router.push("/app");
			setTimeout(() => {
				loading.value = false;
			}, 1001);
		} catch (e) {
			loading.value = false;
			utils.toast.error("Failed to login. Please check your credentials.");
		}
	}

	function websocketLogout() {
		// Reset client data
		client.value = null;
		username.value = "";

		// Reset connection state
		tryWebsocketConnection.value = false;

		// Log the logout action
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

			client.value = {
				id: response.data.id,
				name: response.data.name,
			};

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
