import { computedEager } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../stores/auth.store";

const useAuth = () => {
	const store = useAuthStore();
	const { loading } = storeToRefs(store);
	const authorized = computedEager(() => store.authorized);

	
	return {
		authorized,
		loading,
	};
};
export default useAuth;
