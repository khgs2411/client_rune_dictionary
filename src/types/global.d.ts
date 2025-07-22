import type { Router } from "vue-router";

declare global {
	interface Window {
		router: Router;
		requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
	}
}

export {};
