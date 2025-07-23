const routes = [
	{
		path: "/",
		redirect: { name: "home" }, // Redirect to home using named route
		children: [
			{ path: "home", name: "home", component: () => import("../views/Home.vue") },
			{ path: "login", name: "login", component: () => import("../views/Login.vue") },
			{ path: "app", name: "app", component: () => import("../views/Dictionary.vue") },
			{ path: "dictionary", name: "dictionary", component: () => import("../views/Dictionary.vue") },
			{ path: "match", name: "match", component: () => import("../views/Match.vue") },
			{ path: "animations", name: "animations", component: () => import("../components/demo/AnimationShowcase.vue") },
		],
	},
	// Add a catch-all route to handle 404 errors
	{
		path: '/:pathMatch(.*)*',
		redirect: { name: "home" },
	},
];
export default routes;
