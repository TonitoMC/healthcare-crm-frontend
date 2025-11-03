<template>
  <div class="p-3 flex flex-column gap-4 h-full overflow-hidden">
    <div class="flex align-items-center justify-content-between">
      <div class="text-2xl font-semibold">Panel de Administración</div>
      <div class="text-color-secondary">Roles y Permisos</div>
    </div>

    <!-- Centered main area with max-width container -->
    <div class="flex-1 min-h-0 flex justify-content-center overflow-auto">
      <div class="admin-content-container w-full">
        <div class="admin-grid">

          <!-- Left column: Roles -->
          <div class="roles-col flex flex-column gap-4">
          <Card class="flex-1 flex flex-column overflow-hidden">
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <span class="font-medium text-lg">Roles</span>
                <div class="flex align-items-center gap-2">
                  <span class="hidden md:inline text-sm text-color-secondary">Buscar</span>
                  <InputText v-model="filters.roles" placeholder="Filtrar..." class="w-12rem md:w-16rem" />
                  <Button v-if="auth.roles.includes('admin')" icon="pi pi-plus" label="Nuevo Rol" size="small" @click="openCreateRoleDialog" />
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
                <Column header="Acciones" style="width: 1%; white-space: nowrap">
                  <template #body="{ data }">
                    <Button
                      icon="pi pi-cog"
                      label="Editar"
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

          <!-- Right column: Permisos -->
          <div class="perms-col flex flex-column gap-4">
            <Card class="flex-1 flex flex-column overflow-hidden">
              <template #title>
                <div class="flex align-items-center justify-content-between">
                  <span class="font-medium text-lg">Permisos</span>
                  <div class="flex align-items-center gap-2">
                    <span class="hidden md:inline text-sm text-color-secondary">Buscar</span>
                    <InputText v-model="filters.permissions" placeholder="Filtrar..." class="w-12rem md:w-16rem" />
                    <Button v-if="auth.roles.includes('admin')" icon="pi pi-plus" label="Nuevo Permiso" size="small" @click="openCreatePermissionDialog" />
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
                  <Column header="Acciones" style="width: 1%; white-space: nowrap">
                    <template #body="{ data }">
                      <Button
                        v-if="auth.roles.includes('admin')"
                        icon="pi pi-trash"
                        severity="danger"
                        size="small"
                        outlined
                        @click="askDeletePermission(data)"
                      />
                    </template>
                  </Column>
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
                  <Column header="Acciones" style="width: 1%; white-space: nowrap">
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

    <!-- Dialog: Edit Role Permissions (separated component) -->
    <RolePermissionsModal
      :modelValue="dialogs.permissions"
      @update:modelValue="val => (dialogs.permissions = val)"
      :currentRole="currentRole"
      :permissions="permissions"
      :selected="selectedPermissionIds"
      @save="payload => { selectedPermissionIds.value = payload; saveRolePermissions(); }"
      @close="closePermissionsDialog"
    />

    <!-- Dialog: Assign Roles to User -->
    <Dialog v-model:visible="dialogs.assignRoles" modal header="Asignar Roles" :style="{ width: '32rem' }">
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
          <Button label="Cancelar" severity="secondary" outlined @click="closeAssignRolesDialog" />
          <Button label="Guardar" icon="pi pi-save" @click="saveUserRoles" />
        </div>
      </div>
    </Dialog>

    <!-- Dialog: Create Role -->
    <Dialog v-model:visible="dialogs.createRole" modal header="Nuevo Rol" :style="{ width: '28rem' }">
      <div class="flex flex-column gap-3">
        <span class="text-sm text-color-secondary">Define el nombre y una descripción</span>
        <div class="flex flex-column gap-2">
          <label class="text-sm">Nombre</label>
          <InputText v-model="formRole.nombre" placeholder="p.ej. medico" />
        </div>
        <div class="flex flex-column gap-2">
          <label class="text-sm">Descripción</label>
          <InputText v-model="formRole.descripcion" placeholder="Descripción breve" />
        </div>
        <div class="flex justify-content-end gap-2 mt-2">
          <Button label="Cancelar" severity="secondary" outlined @click="closeCreateRoleDialog" />
          <Button label="Crear" icon="pi pi-check" @click="createRole" />
        </div>
      </div>
    </Dialog>

    <!-- Dialog: Create Permission -->
    <Dialog v-model:visible="dialogs.createPermission" modal header="Nuevo Permiso" :style="{ width: '28rem' }">
      <div class="flex flex-column gap-3">
        <span class="text-sm text-color-secondary">Define el nombre y una descripción</span>
        <div class="flex flex-column gap-2">
          <label class="text-sm">Nombre</label>
          <InputText v-model="formPermission.nombre" placeholder="p.ej. gestion_pacientes" />
        </div>
        <div class="flex flex-column gap-2">
          <label class="text-sm">Descripción</label>
          <InputText v-model="formPermission.descripcion" placeholder="Descripción breve" />
        </div>
        <div class="flex justify-content-end gap-2 mt-2">
          <Button label="Cancelar" severity="secondary" outlined @click="closeCreatePermissionDialog" />
          <Button label="Crear" icon="pi pi-check" @click="createPermission" />
        </div>
      </div>
    </Dialog>

    <!-- Dialog: Confirm Delete (separated component) -->
    <ConfirmDeleteModal
      :modelValue="dialogs.confirm"
      @update:modelValue="val => (dialogs.confirm = val)"
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
import RolePermissionsModal from '@/components/admin/RolePermissionsModal.vue';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal.vue';
import { useAuthStore } from '@/stores/auth';

import { RoleService } from "@/services/roleService";
import { UserService } from "@/services/userService";

const toast = useToast();

const auth = useAuthStore();

const roles = ref([]);
const permissions = ref([]);
const rolePermissionsMap = ref(new Map()); // roleId -> Set(permissionId)
const users = ref([]); // [{id, username, roles:[roleId,...]}]

const loading = ref({ roles: false, users: false });

const dialogs = ref({
  permissions: false,
  assignRoles: false,
  createRole: false,
  createPermission: false,
  confirm: false,
});
const currentRole = ref(null);
const selectedPermissionIds = ref([]);

const currentUser = ref(null);
const selectedUserRoleIds = ref([]);

// Filters
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
  // map role ids to readable names
  const byId = new Map(roles.value.map((r) => [r.id, r.nombre]));
  return users.value.map((u) => ({
    ...u,
    rolesReadable: (u.roles || []).map((id) => byId.get(id)).filter(Boolean),
  }));
});

function rolePermissionNames(roleId) {
  const set = rolePermissionsMap.value.get(roleId) || new Set();
  return permissions.value
    .filter((p) => set.has(p.id))
    .map((p) => p.nombre);
}

async function loadRolesAndPermissions() {
  loading.value.roles = true;
  try {
    const [rs, perms] = await Promise.all([
      RoleService.listRoles(),
      RoleService.listPermissions(),
    ]);
    roles.value = rs;
    permissions.value = perms;

    // Fetch each role's permissions
    const entries = await Promise.all(
      rs.map(async (r) => {
        const rp = await RoleService.getRolePermissions(r.id);
        return [r.id, new Set(rp.map((p) => p.id))];
      }),
    );
    rolePermissionsMap.value = new Map(entries);
  } finally {
    loading.value.roles = false;
  }
}

async function loadUsers() {
  loading.value.users = true;
  try {
    users.value = await UserService.listUsers();
  } finally {
    loading.value.users = false;
  }
}

function openPermissionsDialog(role) {
  currentRole.value = role;
  const set = rolePermissionsMap.value.get(role.id) || new Set();
  selectedPermissionIds.value = Array.from(set);
  dialogs.value.permissions = true;
}
function closePermissionsDialog() {
  dialogs.value.permissions = false;
  currentRole.value = null;
}
async function saveRolePermissions() {
  if (!currentRole.value) return;
  const roleId = currentRole.value.id;
  const target = new Set(selectedPermissionIds.value);
  const before = rolePermissionsMap.value.get(roleId) || new Set();

  // additions
  const toAdd = [...target].filter((id) => !before.has(id));
  // removals
  const toRemove = [...before].filter((id) => !target.has(id));

  try {
    await Promise.all([
      ...toAdd.map((pid) => RoleService.addPermissionToRole(roleId, pid)),
      ...toRemove.map((pid) => RoleService.removePermissionFromRole(roleId, pid)),
    ]);
    rolePermissionsMap.value.set(roleId, target);
    toast.add({ severity: "success", summary: "Permisos actualizados", life: 2000 });
    closePermissionsDialog();
  } catch (e) {
    toast.add({ severity: "error", summary: "Error al guardar", life: 2500 });
  }
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
    await Promise.all([
      ...toAdd.map((rid) => UserService.assignRole(userId, rid)),
      ...toRemove.map((rid) => UserService.removeRole(userId, rid)),
    ]);
    currentUser.value.roles = Array.from(target);
    toast.add({ severity: "success", summary: "Roles actualizados", life: 2000 });
    closeAssignRolesDialog();
  } catch (e) {
    toast.add({ severity: "error", summary: "Error al guardar", life: 2500 });
  }
}

onMounted(async () => {
  await Promise.all([loadRolesAndPermissions(), loadUsers()]);
});

// Create Role/Permission dialogs and actions
const formRole = ref({ nombre: "", descripcion: "" });
function openCreateRoleDialog() {
  formRole.value = { nombre: "", descripcion: "" };
  dialogs.value.createRole = true;
}
function closeCreateRoleDialog() {
  dialogs.value.createRole = false;
}
async function createRole() {
  if (!formRole.value.nombre) return;
  const created = await RoleService.createRole({ ...formRole.value });
  roles.value = [...roles.value, created];
  rolePermissionsMap.value.set(created.id, new Set());
  toast.add({ severity: "success", summary: "Rol creado", life: 2000 });
  closeCreateRoleDialog();
}

const formPermission = ref({ nombre: "", descripcion: "" });
function openCreatePermissionDialog() {
  formPermission.value = { nombre: "", descripcion: "" };
  dialogs.value.createPermission = true;
}
function closeCreatePermissionDialog() {
  dialogs.value.createPermission = false;
}
async function createPermission() {
  if (!formPermission.value.nombre) return;
  const created = await RoleService.createPermission({ ...formPermission.value });
  permissions.value = [...permissions.value, created];
  toast.add({ severity: "success", summary: "Permiso creado", life: 2000 });
  closeCreatePermissionDialog();
}

// Confirm deletion
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
      await RoleService.deleteRole(role.id);
      roles.value = roles.value.filter((r) => r.id !== role.id);
      rolePermissionsMap.value.delete(role.id);
      toast.add({ severity: "success", summary: "Rol eliminado", life: 2000 });
    },
  };
  dialogs.value.confirm = true;
}
function askDeletePermission(perm) {
  confirmDialog.value = {
    title: "Eliminar permiso",
    message: `¿Eliminar el permiso "${perm.nombre}"? Se quitará de todos los roles.`,
    action: async () => {
      await RoleService.deletePermission(perm.id);
      permissions.value = permissions.value.filter((p) => p.id !== perm.id);
      // remove from local mappings
      for (const [rid, set] of rolePermissionsMap.value.entries()) {
        if (set.has(perm.id)) {
          set.delete(perm.id);
          rolePermissionsMap.value.set(rid, new Set(set));
        }
      }
      toast.add({ severity: "success", summary: "Permiso eliminado", life: 2000 });
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
/* Centered container with max-width for better aesthetics */
.admin-content-container {
  /* Use most of available horizontal space so Roles/Permisos can be wide */
  /* keep a reasonable max width to avoid accidental huge overflow */
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Keep the page scroll inside cards */
:deep(.p-datatable-wrapper) {
  height: 100%;
}

/* Strong two-column layout: Roles | Permisos, Usuarios full-width below */
.admin-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .admin-grid {
    /* Equal width columns that fit the container */
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
  /* ensure role/perms columns don't carry PrimeFlex widths */
  .admin-grid > .roles-col,
  .admin-grid > .perms-col {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  /* ensure the Users row spans both columns */
  .admin-grid > .users-row {
    grid-column: 1 / -1;
  }
}

/* Make cards fill their grid cell height-wise for visual balance */
.admin-grid .p-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Ensure datatables stretch inside cards */
.admin-grid .p-card .p-datatable {
  flex: 1 1 auto;
}
</style>
