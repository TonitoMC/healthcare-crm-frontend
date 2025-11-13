<template>
  <Card
    class="flex flex-column h-full overflow-hidden"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
      content: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
    }"
  >
    <template #title>
      <div
        class="flex justify-content-between align-items-center flex-wrap gap-2"
      >
        <span class="font-medium text-lg">Roles</span>

        <div class="flex align-items-center gap-2 flex-wrap">
          <div class="flex align-items-center gap-2">
            <span class="hidden lg:inline text-sm text-color-secondary"
              >Buscar</span
            >
            <InputText
              :modelValue="searchQuery"
              @update:modelValue="$emit('update:searchQuery', $event)"
              placeholder="Filtrar..."
              class="w-12rem md:w-16rem"
            />
          </div>
          <Button
            v-if="canAdmin"
            icon="pi pi-plus"
            label="Nuevo Rol"
            size="small"
            @click="$emit('create-role')"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="flex-1 min-h-0 overflow-hidden">
        <DataTable
          :value="roles"
          dataKey="id"
          scrollable
          scrollHeight="flex"
          :loading="loading"
          paginator
          :rows="10"
          responsiveLayout="scroll"
        >
          <Column field="nombre" header="Nombre"></Column>

          <Column header="Permisos">
            <template #body="{ data }">
              <div
                class="flex flex-wrap gap-2"
                style="max-height: 100px; overflow-y: auto"
              >
                <Tag
                  v-for="perm in getPermissionNames(data.id)"
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
                label="Ver Permisos"
                size="small"
                outlined
                @click="$emit('view-permissions', data)"
              />
              <Button
                v-if="canAdmin"
                icon="pi pi-trash"
                severity="danger"
                size="small"
                class="ml-2"
                outlined
                @click="$emit('delete-role', data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from "vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import InputText from "primevue/inputtext";

const props = defineProps({
  roles: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: "",
  },
  canAdmin: {
    type: Boolean,
    default: false,
  },
  rolePermissionsMap: {
    type: Map,
    required: true,
  },
  permissions: {
    type: Array,
    required: true,
  },
});

defineEmits([
  "update:searchQuery",
  "view-permissions",
  "create-role",
  "delete-role",
]);

function getPermissionNames(roleId) {
  const set = props.rolePermissionsMap.get(roleId) || new Set();
  return props.permissions.filter((p) => set.has(p.id)).map((p) => p.nombre);
}
</script>
