import { createWebHistory, createRouter } from "vue-router";
import routes from "./routes.ts";
import { useAuthStore } from "../stores/auth.store";

const router = createRouter({
	history: createWebHistory(),
	routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
	const authStore = useAuthStore();
	const isAuthorized = authStore.authorized;

	if (to.path === "/login" && isAuthorized) {
		// If the user is authorized and tries to access the login page, redirect to the Dictionary component
		next("/app");
	} else if (to.path !== "/login" && !isAuthorized) {
		// If the user is not authorized and tries to access any page other than login, redirect to the login page
		authStore.loading = true;
		next("/login");
		setTimeout(() => {
			authStore.loading = false;
		}, 1000);
	} else {
		// Otherwise, allow the navigation
		next();
	}
});

export default router;
