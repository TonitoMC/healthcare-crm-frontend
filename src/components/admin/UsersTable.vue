<template>
  <Card
    class="flex flex-column h-full overflow-hidden"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
      content: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
    }"
  >
    <template #title>
      <span class="font-medium text-lg">Usuarios</span>
    </template>

    <template #content>
      <div class="flex-1 min-h-0 overflow-hidden">
        <DataTable
          :value="users"
          dataKey="id"
          scrollable
          scrollHeight="flex"
          :loading="loading"
          responsiveLayout="scroll"
        >
          <Column field="username" header="Usuario"></Column>

          <Column header="Roles">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-2">
                <Tag v-for="r in data.rolesReadable" :key="r" :value="r" />
              </div>
            </template>
          </Column>

          <Column header="Acciones" style="width: 1%; white-space: nowrap">
            <template #body="{ data }">
              <Button
                v-if="canAdmin"
                icon="pi pi-user-edit"
                label="Asignar Roles"
                size="small"
                outlined
                @click="$emit('assign-roles', data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";

defineProps({
  users: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canAdmin: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["assign-roles"]);
</script>
