<template>
  <div class="p-3 flex flex-column gap-4 h-full">
    <div class="flex align-items-center justify-content-between">
      <div class="text-2xl font-semibold">Panel de Administración</div>
      <div class="text-color-secondary">Roles y Permisos</div>
    </div>

    <div class="flex-1 min-h-0 flex justify-content-center">
      <div class="admin-content-container w-full">
        <div class="admin-grid">
          <!-- Left column: Roles -->
          <div class="roles-col flex flex-column gap-4">
            <Card class="flex-1 flex flex-column overflow-hidden">
              <template #title>
                <div class="flex align-items-center justify-content-between">
                  <span class="font-medium text-lg">Roles</span>
                  <div class="flex align-items-center gap-2">
                    <span class="hidden md:inline text-sm text-color-secondary"
                      >Buscar</span
                    >
                    <InputText
                      v-model="filters.roles"
                      placeholder="Filtrar..."
                      class="w-12rem md:w-16rem"
                    />
                    <Button
                      v-if="auth.roles.includes('admin')"
                      icon="pi pi-plus"
                      label="Nuevo Rol"
                      size="small"
                      @click="openCreateRoleDialog"
                    />
                  </div>
                </div>
              </template>
              <template #content>
                <DataTable
                  :value="filteredRoles"
                  dataKey="id"
                  class="w-full"
                  scrollable
                  scrollHeight="flex"
                  :loading="loading.roles"
                  paginator
                  :rows="8"
                  responsiveLayout="scroll"
                >
                  <Column field="nombre" header="Nombre"></Column>
                  <Column header="Permisos">
                    <template #body="{ data }">
                      <div class="flex flex-wrap gap-2">
                        <Tag
                          v-for="perm in rolePermissionNames(data.id)"
                          :key="perm"
                          :value="perm"
                          severity="secondary"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    header="Acciones"
                    style="width: 1%; white-space: nowrap"
                  >
                    <template #body="{ data }">
                      <Button
                        icon="pi pi-cog"
                        label="Ver Permisos"
                        size="small"
                        outlined
                        @click="openPermissionsDialog(data)"
                      />
                      <Button
                        v-if="auth.roles.includes('admin')"
                        icon="pi pi-trash"
                        severity="danger"
                        size="small"
                        class="ml-2"
                        outlined
                        @click="askDeleteRole(data)"
                      />
                    </template>
                  </Column>
                </DataTable>
              </template>
            </Card>
          </div>

          <!-- Right column: Permisos (read-only) -->
          <div class="perms-col flex flex-column gap-4">
            <Card class="flex-1 flex flex-column overflow-hidden">
              <template #title>
                <div class="flex align-items-center justify-content-between">
                  <span class="font-medium text-lg"
                    >Permisos (solo lectura)</span
                  >
                  <div class="flex align-items-center gap-2">
                    <span class="hidden md:inline text-sm text-color-secondary"
                      >Buscar</span
                    >
                    <InputText
                      v-model="filters.permissions"
                      placeholder="Filtrar..."
                      class="w-12rem md:w-16rem"
                    />
                  </div>
                </div>
              </template>
              <template #content>
                <DataTable
                  :value="filteredPermissions"
                  dataKey="id"
                  class="w-full"
                  scrollable
                  scrollHeight="flex"
                  :loading="loading.roles"
                  paginator
                  :rows="8"
                  responsiveLayout="scroll"
                >
                  <Column field="nombre" header="Nombre"></Column>
                  <Column field="descripcion" header="Descripción"></Column>
                </DataTable>
              </template>
            </Card>
          </div>

          <!-- Full width row: Usuarios -->
          <div class="users-row flex flex-column gap-4">
            <Card class="flex-1 flex flex-column overflow-hidden">
              <template #title>
                <div class="flex align-items-center justify-content-between">
                  <span class="font-medium text-lg">Usuarios</span>
                </div>
              </template>
              <template #content>
                <DataTable
                  :value="usersView"
                  dataKey="id"
                  class="w-full"
                  scrollable
                  scrollHeight="flex"
                  :loading="loading.users"
                  responsiveLayout="scroll"
                >
                  <Column field="username" header="Usuario"></Column>
                  <Column header="Roles">
                    <template #body="{ data }">
                      <div class="flex flex-wrap gap-2">
                        <Tag
                          v-for="r in data.rolesReadable"
                          :key="r"
                          :value="r"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    header="Acciones"
                    style="width: 1%; white-space: nowrap"
                  >
                    <template #body="{ data }">
                      <Button
                        v-if="auth.roles.includes('admin')"
                        icon="pi pi-user-edit"
                        label="Asignar Roles"
                        size="small"
                        outlined
                        @click="openAssignRolesDialog(data)"
                      />
                    </template>
                  </Column>
                </DataTable>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog: View Role Permissions -->
    <RolePermissionsModal
      :modelValue="dialogs.permissions"
      @update:modelValue="(val) => (dialogs.permissions = val)"
      :currentRole="currentRole"
      :permissions="permissions"
      :selected="selectedPermissionIds"
      readOnly
      @close="closePermissionsDialog"
    />

    <!-- Dialog: Assign Roles to User -->
    <Dialog
      v-model:visible="dialogs.assignRoles"
      modal
      header="Asignar Roles"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-column gap-3">
        <div class="text-sm text-color-secondary">
          Usuario: <span class="font-medium">{{ currentUser?.username }}</span>
        </div>
        <MultiSelect
          v-model="selectedUserRoleIds"
          :options="roles"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Selecciona roles"
          display="chip"
          class="w-full"
        />
        <div class="flex justify-content-end gap-2">
          <Button
            label="Cancelar"
            severity="secondary"
            outlined
            @click="closeAssignRolesDialog"
          />
          <Button label="Guardar" icon="pi pi-save" @click="saveUserRoles" />
        </div>
      </div>
    </Dialog>

    <!-- Dialog: Create Role -->
    <Dialog
      v-model:visible="dialogs.createRole"
      modal
      header="Nuevo Rol"
      :style="{ width: '28rem' }"
    >
      <div class="flex flex-column gap-3">
        <span class="text-sm text-color-secondary"
          >Define el nombre y una descripción</span
        >
        <div class="flex flex-column gap-2">
          <label class="text-sm">Nombre</label>
          <InputText v-model="formRole.nombre" placeholder="p.ej. medico" />
        </div>
        <div class="flex flex-column gap-2">
          <label class="text-sm">Descripción</label>
          <InputText
            v-model="formRole.descripcion"
            placeholder="Descripción breve"
          />
        </div>
        <div class="flex justify-content-end gap-2 mt-2">
          <Button
            label="Cancelar"
            severity="secondary"
            outlined
            @click="closeCreateRoleDialog"
          />
          <Button label="Crear" icon="pi pi-check" @click="createRole" />
        </div>
      </div>
    </Dialog>

    <!-- Dialog: Confirm Delete -->
    <ConfirmDeleteModal
      :modelValue="dialogs.confirm"
      @update:modelValue="(val) => (dialogs.confirm = val)"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      @confirm="confirmDelete"
      @close="closeConfirm"
    />

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import MultiSelect from "primevue/multiselect";
import Tag from "primevue/tag";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import RolePermissionsModal from "@/components/admin/RolePermissionsModal.vue";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal.vue";
import { useAuthStore } from "@/stores/auth";
import { RoleService } from "@/services/roleService";
import { UserService } from "@/services/userService";

const toast = useToast();
const auth = useAuthStore();

const roles = ref([]);
const permissions = ref([]);
const rolePermissionsMap = ref(new Map());
const users = ref([]);

const loading = ref({ roles: false, users: false });

const dialogs = ref({
  permissions: false,
  assignRoles: false,
  createRole: false,
  confirm: false,
});
const currentRole = ref(null);
const selectedPermissionIds = ref([]);
const currentUser = ref(null);
const selectedUserRoleIds = ref([]);

const filters = ref({ roles: "", permissions: "" });

const filteredRoles = computed(() => {
  const q = filters.value.roles.trim().toLowerCase();
  if (!q) return roles.value;
  return roles.value.filter((r) =>
    [r.nombre, r.descripcion].some((v) => (v || "").toLowerCase().includes(q)),
  );
});

const filteredPermissions = computed(() => {
  const q = filters.value.permissions.trim().toLowerCase();
  if (!q) return permissions.value;
  return permissions.value.filter((p) =>
    [p.nombre, p.descripcion].some((v) => (v || "").toLowerCase().includes(q)),
  );
});

const usersView = computed(() => {
  const byId = new Map(roles.value.map((r) => [r.id, r.nombre]));
  return users.value.map((u) => ({
    ...u,
    rolesReadable: (u.roles || []).map((id) => byId.get(id)).filter(Boolean),
  }));
});

function rolePermissionNames(roleId) {
  const set = rolePermissionsMap.value.get(roleId) || new Set();
  return permissions.value.filter((p) => set.has(p.id)).map((p) => p.nombre);
}

async function loadRolesAndPermissions() {
  loading.value.roles = true;
  try {
    const [rs, perms] = await Promise.all([
      RoleService.listRoles(),
      RoleService.listPermissions(),
    ]);

    // ✅ Normalize for backend's capitalized keys
    roles.value = rs.map((r) => ({
      id: r.id ?? r.ID ?? r.role_id,
      nombre: r.nombre ?? r.name ?? r.Name,
      descripcion: r.descripcion ?? r.description ?? r.Description,
    }));

    permissions.value = perms.map((p) => ({
      id: p.id ?? p.ID ?? p.permission_id,
      nombre: p.nombre ?? p.name ?? p.Name,
      descripcion: p.descripcion ?? p.description ?? p.Description,
    }));

    // ✅ Load each role's permissions safely
    const entries = [];
    for (const r of roles.value) {
      try {
        const rp = await RoleService.getRolePermissions(r.id);
        const normalized = (rp || []).map(
          (p) => p.id ?? p.ID ?? p.permission_id,
        );
        entries.push([r.id, new Set(normalized)]);
      } catch (err) {
        console.warn(`Error loading permissions for role ${r.id}`, err);
        entries.push([r.id, new Set()]);
      }
    }
    rolePermissionsMap.value = new Map(entries);
  } catch (err) {
    console.error("Error loading roles or permissions:", err);
    toast.add({
      severity: "error",
      summary: "Error al cargar roles o permisos",
      life: 3000,
    });
  } finally {
    loading.value.roles = false;
  }
}

async function loadUsers() {
  loading.value.users = true;
  try {
    users.value = await UserService.listUsers();
  } catch (err) {
    console.error("Error loading users:", err);
    toast.add({
      severity: "error",
      summary: "Error al cargar usuarios",
      life: 3000,
    });
  } finally {
    loading.value.users = false;
  }
}

function openPermissionsDialog(role) {
  currentRole.value = role;
  selectedPermissionIds.value = Array.from(
    rolePermissionsMap.value.get(role.id) || [],
  );
  dialogs.value.permissions = true;
}

function closePermissionsDialog() {
  dialogs.value.permissions = false;
  currentRole.value = null;
}

function openAssignRolesDialog(user) {
  currentUser.value = user;
  selectedUserRoleIds.value = [...(user.roles || [])];
  dialogs.value.assignRoles = true;
}

function closeAssignRolesDialog() {
  dialogs.value.assignRoles = false;
  currentUser.value = null;
}

async function saveUserRoles() {
  if (!currentUser.value) return;
  const userId = currentUser.value.id;
  const target = new Set(selectedUserRoleIds.value);
  const before = new Set(currentUser.value.roles || []);

  const toAdd = [...target].filter((id) => !before.has(id));
  const toRemove = [...before].filter((id) => !target.has(id));

  try {
    await Promise.allSettled([
      ...toAdd.map((rid) => UserService.assignRole(userId, rid)),
      ...toRemove.map((rid) => UserService.removeRole(userId, rid)),
    ]);
    currentUser.value.roles = Array.from(target);
    toast.add({
      severity: "success",
      summary: "Roles actualizados",
      life: 2000,
    });
    closeAssignRolesDialog();
  } catch (err) {
    console.error("Error saving user roles:", err);
    toast.add({ severity: "error", summary: "Error al guardar", life: 2500 });
  }
}

onMounted(async () => {
  await Promise.all([loadRolesAndPermissions(), loadUsers()]);
});

const formRole = ref({ nombre: "", descripcion: "" });

function openCreateRoleDialog() {
  formRole.value = { nombre: "", descripcion: "" };
  dialogs.value.createRole = true;
}

function closeCreateRoleDialog() {
  dialogs.value.createRole = false;
}

async function createRole() {
  if (!formRole.value.nombre) {
    toast.add({
      severity: "warn",
      summary: "El nombre es obligatorio",
      life: 2500,
    });
    return;
  }

  try {
    const created = await RoleService.createRole({ ...formRole.value });
    roles.value.push({
      id: created.id ?? created.ID,
      nombre: created.nombre ?? created.name ?? created.Name,
      descripcion:
        created.descripcion ?? created.description ?? created.Description,
    });
    rolePermissionsMap.value.set(created.id ?? created.ID, new Set());
    toast.add({ severity: "success", summary: "Rol creado", life: 2000 });
    closeCreateRoleDialog();
  } catch (err) {
    console.error("Error creating role:", err);
    toast.add({ severity: "error", summary: "Error creando rol", life: 2500 });
  }
}

const confirmDialog = ref({ title: "Confirmar", message: "", action: null });

function closeConfirm() {
  dialogs.value.confirm = false;
  confirmDialog.value = { title: "Confirmar", message: "", action: null };
}

function askDeleteRole(role) {
  confirmDialog.value = {
    title: "Eliminar rol",
    message: `¿Eliminar el rol "${role.nombre}"? Esta acción no se puede deshacer.`,
    action: async () => {
      try {
        await RoleService.deleteRole(role.id);
        roles.value = roles.value.filter((r) => r.id !== role.id);
        rolePermissionsMap.value.delete(role.id);
        toast.add({
          severity: "success",
          summary: "Rol eliminado",
          life: 2000,
        });
      } catch (err) {
        console.error("Error deleting role:", err);
        toast.add({
          severity: "error",
          summary: "Error al eliminar rol",
          life: 2500,
        });
      }
    },
  };
  dialogs.value.confirm = true;
}

async function confirmDelete() {
  try {
    if (confirmDialog.value.action) await confirmDialog.value.action();
  } finally {
    closeConfirm();
  }
}
</script>

<style scoped>
.admin-content-container {
  max-width: 100%;
}

.admin-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
  width: 100%;
}

.roles-col {
  grid-column: 1;
  grid-row: 1;
}

.perms-col {
  grid-column: 2;
  grid-row: 1;
}

.users-row {
  grid-column: 1 / -1;
  grid-row: 2;
}

/* Responsive: En pantallas pequeñas, una columna */
@media (max-width: 768px) {
  .admin-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .roles-col {
    grid-column: 1;
    grid-row: 1;
  }
  
  .perms-col {
    grid-column: 1;
    grid-row: 2;
  }
  
  .users-row {
    grid-column: 1;
    grid-row: 3;
  }
}
</style>
