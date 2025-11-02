// src/services/userService.js
import { api } from "@/services/api";

// Fallback seeds to work without a live backend
const mockUsers = [
  { id: 1, username: "pcastejon", roles: [1] },
  { id: 2, username: "jmerida", roles: [3] },
  { id: 3, username: "jlopez", roles: [2] },
  { id: 4, username: "admin", roles: [3] },
];

export const UserService = {
  async listUsers() {
    try {
      const { data } = await api.get("/users");
      return data; // [{id, username, roles:[{id, nombre}]}]
    } catch (e) {
      return mockUsers;
    }
  },

  async assignRole(userId, roleId) {
    try {
      await api.post(`/users/${userId}/roles`, { roleId });
    } catch (e) {
      const u = mockUsers.find((u) => u.id === userId);
      if (u && !u.roles.includes(roleId)) u.roles.push(roleId);
    }
  },

  async removeRole(userId, roleId) {
    try {
      await api.delete(`/users/${userId}/roles/${roleId}`);
    } catch (e) {
      const u = mockUsers.find((u) => u.id === userId);
      if (u) u.roles = u.roles.filter((r) => r !== roleId);
    }
  },
};
