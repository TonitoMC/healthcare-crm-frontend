<template>
  <Card class="patient-header">
    <template #content>
      <div
        class="flex flex-column md:flex-row justify-content-between align-items-start gap-4"
      >
        <!-- 🧍 Left: Patient Info -->
        <div class="flex-1 flex flex-column gap-2">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-user text-3xl text-primary"></i>
            <h2 class="m-0 text-2xl font-semibold">
              {{ patient?.nombre || "Cargando..." }}
            </h2>
          </div>

          <div class="flex flex-wrap gap-3 text-color-secondary">
            <span><i class="pi pi-calendar mr-2"></i>{{ edad }} años</span>
            <span
              ><i class="pi pi-venus-mars mr-2"></i>{{ patient?.sexo }}</span
            >
            <span v-if="patient?.telefono"
              ><i class="pi pi-phone mr-2"></i>{{ patient.telefono }}</span
            >
          </div>

          <div class="flex gap-2 mt-2">
            <Button
              icon="pi pi-pencil"
              label="Editar"
              severity="secondary"
              outlined
              size="small"
              @click="$emit('edit')"
            />
            <Button
              icon="pi pi-file-pdf"
              label="Historial"
              severity="info"
              outlined
              size="small"
              @click="$emit('viewHistory')"
            />
          </div>
        </div>

        <!-- 🩺 Right: Antecedentes Summary -->
        <div class="flex-1 min-w-0">
          <MedicalSummaryInline
            :record="medicalRecord"
            :loading="loadingMedical"
            @edit="$emit('editMedical')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import MedicalSummaryInline from "./MedicalSummaryInline.vue";

const props = defineProps({
  patient: { type: Object, default: null },
  edad: { type: Number, default: 0 },
  medicalRecord: { type: Object, default: null },
  loadingMedical: { type: Boolean, default: false },
});

defineEmits(["edit", "viewHistory", "editMedical"]);
</script>

<style scoped>
.patient-header {
  margin-bottom: 1rem;
}
</style>
