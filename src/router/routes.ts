const routes = [
  {
    path: '/',
    redirect: { name: 'game' }, // Redirect to game using named route
    children: [{ path: 'game', name: 'game', component: () => import('../views/Game.vue') }],
  },
  // Add a catch-all route to handle 404 errors
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'game' },
  },
];
export default routes;
