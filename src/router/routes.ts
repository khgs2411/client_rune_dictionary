const routes = [
  {
    path: '/',
    redirect: { name: 'playground' },
    children: [
      {
        path: 'game',
        name: 'game',
        component: () => import('../views/Game.vue'),
        redirect: { name: 'playground' },
        children: [
          {
            path: 'playground',
            name: 'playground',
            component: () => import('../scenes/PlaygroundScene.vue'),
          },
          {
            path: 'donut',
            name: 'donut',
            component: () => import('../scenes/DonutScene.vue'),
          },
        ],
      },
    ],
  },
  // Add a catch-all route to handle 404 errors
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'playground' },
  },
];
export default routes;
