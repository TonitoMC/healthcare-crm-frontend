// src/services/UserService.js

// Local mock users
const mockUsers = [
  { id: 1, username: "pcastejon", roles: [1] },
  { id: 2, username: "jmerida", roles: [3] },
  { id: 3, username: "jlopez", roles: [2] },
  { id: 4, username: "admin", roles: [3] },
];

export const UserService = {
  /**
   * Return mock users without hitting any backend
   */
  async listUsers() {
    return mockUsers;
  },

  /**
   * Add a role to a mock user (in-memory only)
   */
  async assignRole(userId, roleId) {
    const user = mockUsers.find((u) => u.id === userId);
    if (user && !user.roles.includes(roleId)) {
      user.roles.push(roleId);
    }
    return user;
  },

  /**
   * Remove a role from a mock user (in-memory only)
   */
  async removeRole(userId, roleId) {
    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      user.roles = user.roles.filter((r) => r !== roleId);
    }
    return user;
  },
};
