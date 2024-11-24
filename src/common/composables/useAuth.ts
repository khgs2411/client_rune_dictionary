import { storeToRefs } from "pinia";
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth.store";
import { computedEager } from "@vueuse/core";

const useAuth = () => {
	const router = useRouter();
	const route = useRoute();
	const store = useAuthStore();
	const { loading } = storeToRefs(store);
	const authorized = computedEager(() => store.authorized);

	
	return {
		authorized,
		loading,
	};
};
export default useAuth;
