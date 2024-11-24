const routes = [
	{
		path: "/",
		redirect: "/login", // Redirect to /login
		children: [
			{ path: "login", component: () => import("../views/Login.vue") },
			{ path: "app", component: () => import("../views/Dictionary.vue") },
			{ path: "match", component: () => import("../views/Match.vue") },
		],
	},
	// Add a catch-all route to handle 404 errors
	{
		path: "/:pathMatch(.*)*",
		redirect: "/login",
	},
];
export default routes;
