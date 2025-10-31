// src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Auto-attach token from storage
const saved = localStorage.getItem("jwt");
if (saved) {
  try {
    const { token } = JSON.parse(saved);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch {
    console.warn("[api.js] invalid saved token");
  }
}
