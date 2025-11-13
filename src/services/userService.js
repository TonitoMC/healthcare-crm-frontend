import { api } from "@/services/api.js";

/**
 * UserService handles CRUD operations for users and their role assignments.
 * It matches the backend /api/user endpoints.
 */
export const UserService = {
  /**
   * Fetch all users.
   * GET /user
   */
  async listUsers() {
    const { data } = await api.get("/user");
    return data;
  },

  async listUsersEnriched() {
    const { data } = await api.get("/user/enriched");
    return data;
  },

  /**
   * Fetch a single user by ID.
   * GET /user/:id
   * @param {Number} id
   */
  async getUser(id) {
    const { data } = await api.get(`/user/${id}`);
    return data;
  },

  /**
   * Search a user by username or email.
   * GET /user/search?identifier=username_or_email
   * @param {String} identifier
   */
  async searchUser(identifier) {
    const { data } = await api.get("/user/search", {
      params: { identifier },
    });
    return data;
  },

  /**
   * Update a user’s basic information.
   * PUT /user/:id
   * @param {Number} id
   * @param {Object} payload { username, email }
   */
  async updateUser(id, payload) {
    const { data } = await api.put(`/user/${id}`, payload);
    return data;
  },

  /**
   * Delete a user by ID.
   * DELETE /user/:id
   * @param {Number} id
   */
  async deleteUser(id) {
    const { data } = await api.delete(`/user/${id}`);
    return data;
  },

  /**
   * Get all roles for a user.
   * GET /user/:id/roles
   * @param {Number} id
   */
  async getUserRoles(id) {
    const { data } = await api.get(`/user/${id}/roles`);
    return data;
  },

  /**
   * Get all roles and permissions for a user.
   * GET /user/:id/roles-permissions
   * @param {Number} id
   */
  async getUserRolesAndPermissions(id) {
    const { data } = await api.get(`/user/${id}/roles-permissions`);
    return data;
  },

  /**
   * Assign a role to a user.
   * POST /user/:id/roles/:roleID
   * @param {Number} userId
   * @param {Number} roleId
   */
  async assignRole(userId, roleId) {
    const { data } = await api.post(`/user/${userId}/roles/${roleId}`);
    return data;
  },

  /**
   * Remove a specific role from a user.
   * DELETE /user/:id/roles/:roleID
   * @param {Number} userId
   * @param {Number} roleId
   */
  async removeRole(userId, roleId) {
    const { data } = await api.delete(`/user/${userId}/roles/${roleId}`);
    return data;
  },

  /**
   * Remove all roles from a user.
   * DELETE /user/:id/roles
   * @param {Number} userId
   */
  async clearRoles(userId) {
    const { data } = await api.delete(`/user/${userId}/roles`);
    return data;
  },
};
