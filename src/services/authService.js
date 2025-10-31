// src/services/authService.js
import { api } from "@/services/api";
import { jwtDecode } from "jwt-decode";

export const AuthService = {
  async register(username, email, password) {
    const res = await api.post("/auth/register", { username, email, password });
    return res.data;
  },

  async login(identifier, password) {
    const res = await api.post("/auth/login", { identifier, password });
    const token = res.data.token;

    // Decode JWT payload
    const user = jwtDecode(token);

    // Persist for session restore
    localStorage.setItem("jwt", JSON.stringify({ token, user }));

    // Inject into API headers
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return { token, user };
  },

  logout() {
    localStorage.removeItem("jwt");
    delete api.defaults.headers.common["Authorization"];
  },
};
