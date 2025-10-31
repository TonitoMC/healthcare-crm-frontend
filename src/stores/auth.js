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
  },
});
