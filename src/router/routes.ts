const routes = [
    {
        path: "/",
        redirect: { name: "home" }, // Redirect to home using named route
        children: [
            { path: "home", name: "home", component: () => import("../views/Home.vue") },
        ],
    },
    // Add a catch-all route to handle 404 errors
    {
        path: '/:pathMatch(.*)*',
        redirect: { name: "home" },
    },
];
export default routes;
