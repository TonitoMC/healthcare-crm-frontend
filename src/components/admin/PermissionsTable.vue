<template>
  <Card
    class="flex flex-column h-full"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0' },
      content: { class: 'flex flex-column flex-1 min-h-0' },
    }"
  >
    <template #title>
      <div
        class="flex justify-content-between align-items-center flex-wrap gap-2"
      >
        <span class="font-medium text-lg">Permisos</span>

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
      </div>
    </template>

    <template #content>
      <!-- THIS WRAPPER MUST HAVE flex-1 + min-h-0 -->
      <div class="flex flex-column flex-1 min-h-0">
        <!-- DataTable must be flex-1 and min-h-0 -->
        <DataTable
          :value="permissions"
          dataKey="id"
          scrollable
          scrollHeight="flex"
          :loading="loading"
          responsiveLayout="scroll"
          class="flex-1 min-h-0"
        >
          <Column field="nombre" header="Nombre"></Column>
          <Column field="descripcion" header="Descripción"></Column>
        </DataTable>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";

defineProps({
  permissions: Array,
  loading: Boolean,
  searchQuery: String,
});

defineEmits(["update:searchQuery"]);
</script>
