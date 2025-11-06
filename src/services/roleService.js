import { api } from "@/services/api.js";

/**
 * RoleService handles CRUD operations for roles
 * and their assigned permissions.
 * Matches backend /api/role endpoints.
 */
export const RoleService = {
  // ---------------------------------------------------------------------------
  // 📘 Roles
  // ---------------------------------------------------------------------------

  /**
   * Fetch all roles.
   * GET /role
   * @returns {Promise<Array>} List of roles.
   */
  async listRoles() {
    const { data } = await api.get("/role");
    return data;
  },

  /**
   * Fetch a single role and its permissions.
   * GET /role/:id
   * @param {Number} id - Role ID
   * @returns {Promise<Object>} { role, permissions }
   */
  async getRole(id) {
    if (!id) throw new Error("Role ID is required");
    const { data } = await api.get(`/role/${id}`);
    return data;
  },

  /**
   * Create a new role.
   * POST /role
   * @param {Object} payload - { nombre, descripcion }
   * @returns {Promise<Object>} Creation response.
   */
  async createRole({ nombre, descripcion }) {
    const { data } = await api.post("/role", { nombre, descripcion });
    return data;
  },

  /**
   * Update an existing role.
   * PUT /role/:id
   * @param {Number} id - Role ID
   * @param {Object} payload - { nombre, descripcion }
   * @returns {Promise<Object>} Update response.
   */
  async updateRole(id, { nombre, descripcion }) {
    if (!id) throw new Error("Role ID is required");
    const { data } = await api.put(`/role/${id}`, { nombre, descripcion });
    return data;
  },

  /**
   * Delete a role by ID.
   * DELETE /role/:id
   * @param {Number} id - Role ID
   * @returns {Promise<Object>} Deletion response.
   */
  async deleteRole(id) {
    if (!id) throw new Error("Role ID is required");
    const { data } = await api.delete(`/role/${id}`);
    return data;
  },

  // ---------------------------------------------------------------------------
  // 🔐 Permissions
  // ---------------------------------------------------------------------------

  /**
   * Get all permissions in the system.
   * GET /role/permissions
   * @returns {Promise<Array>} List of all permissions.
   */
  async listPermissions() {
    const { data } = await api.get("/role/all/permissions");
    return data;
  },

  /**
   * Get all permissions assigned to a role.
   * GET /role/:id/permissions
   * @param {Number} id - Role ID
   * @returns {Promise<Array>} List of permissions for that role.
   */
  async getRolePermissions(id) {
    if (!id) throw new Error("Role ID is required");
    const { data } = await api.get(`/role/${id}/permissions`);
    return data;
  },

  /**
   * Add a permission to a role.
   * POST /role/:id/permissions
   * @param {Number} roleId - Role ID
   * @param {Number} permissionId - Permission ID
   * @returns {Promise<Object>} Add response.
   */
  async addPermission(roleId, permissionId) {
    if (!roleId || !permissionId)
      throw new Error("Role and permission IDs required");
    const { data } = await api.post(`/role/${roleId}/permissions`, {
      permission_id: permissionId,
    });
    return data;
  },

  /**
   * Remove a specific permission from a role.
   * DELETE /role/:id/permissions/:permissionID
   * @param {Number} roleId - Role ID
   * @param {Number} permissionId - Permission ID
   * @returns {Promise<Object>} Removal response.
   */
  async removePermission(roleId, permissionId) {
    if (!roleId || !permissionId)
      throw new Error("Role and permission IDs required");
    const { data } = await api.delete(
      `/role/${roleId}/permissions/${permissionId}`,
    );
    return data;
  },

  /**
   * Replace all permissions for a given role.
   * PUT /role/:id/permissions
   * @param {Number} roleId - Role ID
   * @param {Array<Number>} permissionIds - List of permission IDs
   * @returns {Promise<Object>} Update response.
   */
  async updateRolePermissions(roleId, permissionIds) {
    if (!roleId) throw new Error("Role ID is required");
    const { data } = await api.put(`/role/${roleId}/permissions`, {
      permission_ids: permissionIds,
    });
    return data;
  },
};
