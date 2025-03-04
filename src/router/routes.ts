const routes = [
	{
		path: "/",
		redirect: { name: "login" }, // Redirect to login using named route
		children: [
			{ path: "login", name: "login", component: () => import("../views/Login.vue") },
			{ path: "app", name: "app", component: () => import("../views/Dictionary.vue") },
			{ path: "match", name: "match", component: () => import("../views/Match.vue") },
		],
	},
	// Add a catch-all route to handle 404 errors
	{
		path: "/:pathMatch(.*)*",
		redirect: { name: "login" },
	},
];
export default routes;
