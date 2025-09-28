import Aura from "@primevue/themes/aura";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import "primeicons/primeicons.css";
import { Tooltip } from "primevue";
import PrimeVue from "primevue/config";
import Ripple from "primevue/ripple";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/style.scss";
import DebugDirective from "./directives/debug.directive.ts";
import router from "./router/router.ts";
import "./style.css";

// @version: 0.4.7 - This comment is auto-updated by deploy script

// Force refresh when app version changes
(function () {
	const APP_VERSION = "0.2.36"; // This should match the version above
	const LAST_VERSION_KEY = "app_version";
	const lastVersion = localStorage.getItem(LAST_VERSION_KEY);

	// If version has changed and not first visit
	if (lastVersion && lastVersion !== APP_VERSION) {
		// Clear cache and reload
		console.log(`App updated from ${lastVersion} to ${APP_VERSION}. Refreshing...`);
		localStorage.setItem(LAST_VERSION_KEY, APP_VERSION);

		// Clear caches if available
		if ("caches" in window) {
			caches.keys().then((cacheNames) => {
				cacheNames.forEach((cacheName) => {
					caches.delete(cacheName);
				});
			});
		}

		// Force reload bypassing cache
		window.location.reload();
	} else {
		// Update stored version
		localStorage.setItem(LAST_VERSION_KEY, APP_VERSION);
	}
})();

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App)
	.use(router)
	.use(pinia)
	.use(PrimeVue, {
		ripple: true,
		theme: {
			preset: Aura,
			options: {
				prefix: "p",
				darkModeSelector: ".dark",
				cssLayer: false,
			},
		},
	})
	.use(ToastService)
	.directive("tooltip", Tooltip)
	.directive("ripple", Ripple)
	.directive("debug", DebugDirective)
	.mount("#app");


// Make router available globally for CSS optimization
window.router = router;
