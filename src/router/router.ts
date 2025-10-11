import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Global navigation guard for auth protection
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // Public routes that don't require authentication
  const publicRoutes = ['login'];
  const isPublicRoute = publicRoutes.includes(to.name as string);

  // If going to a public route, allow it
  if (isPublicRoute) {
    next();
    return;
  }

  // For protected routes, check authentication
  if (authStore.isAuthenticated) {
    // Refresh TTL on every route navigation
    authStore.refreshTTL();
    console.log('✅ Auth valid, TTL refreshed');
    next();
  } else {
    // Not authenticated or expired, redirect to login
    console.log('❌ Auth expired or missing, redirecting to login');
    authStore.logout(); // Clear any stale data
    next({ name: 'login' });
  }
});

export default router;
