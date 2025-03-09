import { computedEager } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../stores/auth.store";

const useAuth = () => {
	const store = useAuthStore();
	const { loading } = storeToRefs(store);
	const authorized = computedEager(() => store.authorized);

	function logout() {
		const localStorage = window.localStorage;
		localStorage.removeItem("username");
		localStorage.removeItem("authorized");
		localStorage.removeItem("redirect");
		store.setAuthorized(false);
	}

	return {
		authorized,
		loading,
		logout,
	};
};
export default useAuth;
