// src/stores/auth.js
import { defineStore } from "pinia";
import { AuthService } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    username: (state) => state.user?.username || "Invitado",
    roles: (state) => state.user?.roles || [],
    permissions: (state) => state.user?.permissions || [],
  },

  actions: {
    setSession(token, user) {
      this.token = token;
      this.user = user;
      // Persist for session restore
      try {
        localStorage.setItem("jwt", JSON.stringify({ token, user }));
      } catch {}
    },

    async register(username, email, password) {
      this.loading = true;
      try {
        await AuthService.register(username, email, password);
      } finally {
        this.loading = false;
      }
    },

    async login(identifier, password) {
      this.loading = true;
      try {
        const { token, user } = await AuthService.login(identifier, password);
        this.token = token;
        this.user = user;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      AuthService.logout();
    },

    restoreSession() {
      const saved = localStorage.getItem("jwt");
      if (!saved) return;
      try {
        const { token, user } = JSON.parse(saved);
        this.token = token;
        this.user = user;
      } catch {
        console.warn("[AuthStore.restoreSession] invalid token");
        localStorage.removeItem("jwt");
      }
    },

    // Dev-only helper to ensure an admin session when running locally.
    // If there is already a saved user named 'admin' with missing roles,
    // elevate that user to admin for development convenience.
    ensureDevSession() {
      const env = import.meta.env?.VITE_ENV || import.meta.env?.MODE;
      if (String(env).toLowerCase() !== "development") return;

      // If no user, create a dev-admin session
      if (!this.user) {
        const devUser = {
          username: "dev-admin",
          roles: ["admin"],
          permissions: [
            "gestion_usuarios",
            "gestion_pacientes",
            "gestion_citas",
          ],
        };
        this.setSession("dev-token", devUser);
        console.info("[AuthStore] Dev session established (dev-admin)");
        return;
      }

      // If there's an existing saved user 'admin' without admin role, elevate them
      try {
        const uname = this.user?.username || "";
        const roles = Array.isArray(this.user?.roles) ? [...this.user.roles] : [];
        const perms = Array.isArray(this.user?.permissions) ? [...this.user.permissions] : [];
        if (uname.toLowerCase() === "admin" && !roles.includes("admin")) {
          roles.push("admin");
          // add default admin permissions if missing
          ["gestion_usuarios", "gestion_pacientes", "gestion_citas"].forEach((p) => {
            if (!perms.includes(p)) perms.push(p);
          });
          const upgraded = { ...this.user, roles, permissions: perms };
          this.setSession(this.token || "dev-token", upgraded);
          console.info("[AuthStore] Elevated saved 'admin' user to admin in dev");
        }
      } catch (e) {
        // ignore
      }
    },
  },
});
