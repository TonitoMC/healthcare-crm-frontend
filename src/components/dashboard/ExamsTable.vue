<template>
  <div class="flex-1 min-h-0 overflow-y-auto">
    <DataTable
      :value="exams"
      tableStyle="min-width:100%"
      scrollable
      scrollHeight="flex"
      size="small"
      stripedRows
      responsiveLayout="scroll"
    >
      <Column field="date" header="Fecha" />
      <Column field="patient" header="Paciente" />
      <Column field="examType" header="Tipo de Examen" />

      <Column header="Acciones">
        <template #body="slotProps">
          <Button
            :label="slotProps.data.file ? 'Editar' : 'Subir PDF'"
            icon="pi pi-upload"
            text
            size="small"
            @click="$emit('open-upload', slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";

defineProps({ exams: Array });
defineEmits(["open-upload"]);
</script>

<style scoped>
:deep(.p-datatable) {
  border: none;
}
</style>
