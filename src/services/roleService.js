// src/services/roleService.js
import { api } from "@/services/api";

// Fallback seeds to work without a live backend
const mockRoles = [
  { id: 1, nombre: "medico", descripcion: "desc" },
  { id: 2, nombre: "secretario", descripcion: "desc" },
  { id: 3, nombre: "admin", descripcion: "desc" },
];

const mockPermissions = [
  { id: 1, nombre: "gestion_usuarios", descripcion: "Crear y editar usuarios y roles" },
  { id: 2, nombre: "gestion_pacientes", descripcion: "Administrar registros de pacientes" },
  { id: 3, nombre: "gestion_citas", descripcion: "Administrar citas" },
];

// rolId -> permisoIds
let mockRolePermissions = {
  1: [2, 3],
  2: [2],
  3: [1, 2, 3],
};

export const RoleService = {
  async listRoles() {
    try {
      const { data } = await api.get("/roles");
      return data;
    } catch (e) {
      // fallback
      return mockRoles;
    }
  },

  async listPermissions() {
    try {
      const { data } = await api.get("/permissions");
      return data;
    } catch (e) {
      return mockPermissions;
    }
  },

  async getRolePermissions(roleId) {
    try {
      const { data } = await api.get(`/roles/${roleId}/permissions`);
      return data; // [{id, nombre, descripcion}]
    } catch (e) {
      const ids = mockRolePermissions[roleId] || [];
      return mockPermissions.filter((p) => ids.includes(p.id));
    }
  },

  async addPermissionToRole(roleId, permissionId) {
    try {
      await api.post(`/roles/${roleId}/permissions`, { permissionId });
    } catch (e) {
      // mutate mock
      const set = new Set(mockRolePermissions[roleId] || []);
      set.add(permissionId);
      mockRolePermissions[roleId] = Array.from(set);
    }
  },

  async removePermissionFromRole(roleId, permissionId) {
    try {
      await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    } catch (e) {
      mockRolePermissions[roleId] = (mockRolePermissions[roleId] || []).filter(
        (id) => id !== permissionId,
      );
    }
  },

  async createRole({ nombre, descripcion }) {
    try {
      const { data } = await api.post("/roles", { nombre, descripcion });
      return data;
    } catch (e) {
      const nextId = Math.max(0, ...mockRoles.map((r) => r.id)) + 1;
      const created = { id: nextId, nombre, descripcion };
      mockRoles.push(created);
      return created;
    }
  },

  async deleteRole(roleId) {
    try {
      await api.delete(`/roles/${roleId}`);
    } catch (e) {
      const idx = mockRoles.findIndex((r) => r.id === roleId);
      if (idx >= 0) mockRoles.splice(idx, 1);
      // remove mappings
      delete mockRolePermissions[roleId];
    }
  },

  async createPermission({ nombre, descripcion }) {
    try {
      const { data } = await api.post("/permissions", { nombre, descripcion });
      return data;
    } catch (e) {
      const nextId = Math.max(0, ...mockPermissions.map((p) => p.id)) + 1;
      const created = { id: nextId, nombre, descripcion };
      mockPermissions.push(created);
      return created;
    }
  },

  async deletePermission(permissionId) {
    try {
      await api.delete(`/permissions/${permissionId}`);
    } catch (e) {
      const idx = mockPermissions.findIndex((p) => p.id === permissionId);
      if (idx >= 0) mockPermissions.splice(idx, 1);
      // remove from all role mappings
      for (const rid of Object.keys(mockRolePermissions)) {
        mockRolePermissions[rid] = (mockRolePermissions[rid] || []).filter(
          (id) => id !== permissionId,
        );
      }
    }
  },
};
