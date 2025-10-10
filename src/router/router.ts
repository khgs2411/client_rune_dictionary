
import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalizedGeneric } from "vue-router";
import routes from "./routes";
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;

