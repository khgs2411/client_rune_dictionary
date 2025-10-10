const routes = [
  {
    path: '/',
    redirect: { name: 'login' },
    children: [
      {
        path: 'game',
        name: 'game',
        component: () => import('../views/Game.vue'),
        redirect: { name: 'login' },
        children: [
          {
            path: 'login',
            name: 'login',
            component: () => import('../scenes/LoginScene.vue'),
            meta: {
              hasCharacter: false, // No character needed for login
            },
          },
          {
            path: 'playground',
            name: 'playground',
            component: () => import('../scenes/PlaygroundScene.vue'),
            meta: {
              hasCharacter: true,
            },
          },
          {
            path: 'donut',
            name: 'donut',
            component: () => import('../scenes/DonutScene.vue'),
            meta: {
              hasCharacter: true,
            },
          },
        ],
      },
    ],
  },
  // Add a catch-all route to handle 404 errors
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'login' },
  },
];
export default routes;
