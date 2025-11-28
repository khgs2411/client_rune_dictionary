const routes = [
	{
		path: "/",
		redirect: { name: "login" },
		children: [
			{
				path: "login",
				name: "login",
				component: () => import("../views/Login.vue"),
			},
			{
				path: "game",
				name: "game",
				component: () => import("../views/Game.vue"),
				children: [
					{
						path: "scene",
						name: "scene",
						component: () => import("../views/Scene.vue"),
					},
				],
			},
		],
	},
	// Add a catch-all route to handle 404 errors
	{
		path: "/:pathMatch(.*)*",
		redirect: { name: "login" },
	},
];
export default routes;
