import { useAuthStore } from "@/stores/auth";

/**
 * Sets up global route guards for authentication, roles, and permissions.
 */
export function setupAuthGuard(router) {
  router.beforeEach((to) => {
    const auth = useAuthStore();

    // Restore session if it hasn't been done yet
    if (!auth.token) {
      auth.restoreSession();
    }

    // Redirect root to login or dashboard depending on auth state
    if (to.path === "/") {
      return auth.isAuthenticated ? "/app/dashboard" : "/login";
    }

    // Require authentication for protected routes
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return "/login";
    }

    // Role-based access control
    if (to.meta.roles?.length) {
      const hasRole = to.meta.roles.some((r) => auth.roles.includes(r));
      if (!hasRole) return "/app/dashboard";
    }

    // Permission-based access control
    if (to.meta.permissions?.length) {
      const hasPermission = to.meta.permissions.some((p) =>
        auth.permissions.includes(p),
      );
      if (!hasPermission) return "/app/dashboard";
    }

    return true;
  });
}
