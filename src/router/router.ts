﻿import { createWebHistory, createRouter, RouteLocationNormalizedGeneric, NavigationGuardNext } from "vue-router";
import routes from "./routes.ts";
import { useAuthStore } from "../stores/auth.store";

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
		authStore.loading = true;
		next({ name: "login" });
		setTimeout(() => {
			authStore.loading = false;
		}, 1000);
	} else {
		//? Otherwise, allow the navigation
		authStore.loading = false;
		next();
	}
}

// Navigation guard
router.beforeEach((to, _from, next) => checkIsAuthorized(to, next));

export default router;
