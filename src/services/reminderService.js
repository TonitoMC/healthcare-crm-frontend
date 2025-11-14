import { api } from "@/services/api";

export const ReminderService = {
  async list() {
    const res = await api.get("/reminders");

    // backend returns an array directly
    const data = res.data;

    // defensive: return empty array if it's not an array
    return Array.isArray(data) ? data : [];
  },

  async create(payload) {
    const res = await api.post("/reminders", payload);
    // backend returns the created record AS-IS
    return res.data;
  },

  async markDone(id) {
    const res = await api.put(`/reminders/${id}/done`);
    return res.data; // contains fecha_completado
  },

  async markUndone(id) {
    const res = await api.put(`/reminders/${id}/undone`);
    return res.data; // fecha_completado = null
  },

  async remove(id) {
    return api.delete(`/reminders/${id}`);
  },
};
