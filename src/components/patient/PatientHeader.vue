<template>
  <Card class="patient-header">
    <template #content>
      <div
        class="flex flex-column md:flex-row align-items-stretch gap-4 md:gap-6"
      >
        <!-- 🧍 Left: Patient Info (exact 50%) -->
        <div class="flex flex-column gap-2 flex-1 min-w-0">
          <div class="flex justify-content-between align-items-start">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-user text-3xl text-primary"></i>
              <h2 class="m-0 text-2xl font-semibold">
                {{ patient?.nombre || "Cargando..." }}
              </h2>
            </div>

            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              @click="$emit('edit')"
            />
          </div>

          <div
            class="flex flex-wrap gap-3 text-color-secondary text-sm md:text-base"
          >
            <span><i class="pi pi-calendar mr-2"></i>{{ edad }} años</span>
            <span
              ><i class="pi pi-venus-mars mr-2"></i>{{ patient?.sexo }}</span
            >
            <span v-if="patient?.telefono">
              <i class="pi pi-phone mr-2"></i>{{ patient.telefono }}
            </span>
          </div>
        </div>

        <!-- 🧱 Divider (no width, just a border) -->
        <div
          class="hidden md:block align-self-stretch w-0 border-right-1 surface-border"
        ></div>

        <!-- 🩺 Right: Antecedentes (exact 50%) -->
        <div class="flex flex-column flex-1 min-w-0">
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

defineEmits(["edit", "editMedical"]);
</script>

<style scoped>
.patient-header {
  margin-bottom: 1rem;
}
</style>
