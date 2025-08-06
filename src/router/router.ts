import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalizedGeneric } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import routes from "./routes.ts";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

function checkIsAuthorized(to: RouteLocationNormalizedGeneric, next: NavigationGuardNext) {
	const authStore = useAuthStore();
	const isAuthorized = authStore.authorized;
	const publicRoutes = ["home", "login", "animations"];

	if (to.name === "login" && isAuthorized) {
		//? If the user is authorized and tries to access the login page, redirect to the Dictionary component
		next({ name: "app" });
	} else if (!publicRoutes.includes(to.name as string) && !isAuthorized) {
		//? If the user is not authorized and tries to access any protected page, redirect to the login page
		next({ name: "login" });
	} else {
		//? Otherwise, allow the navigation
		next();
	}
}

// Navigation guard
router.beforeEach((to, _from, next) => checkIsAuthorized(to, next));

export default router;
