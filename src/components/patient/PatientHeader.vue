<template>
  <Card class="patient-header">
    <template #content>
      <div class="flex flex-column md:flex-row align-items-stretch w-full">
        <!-- 🧍 Left: Patient Info (≈35%) -->
        <div
          class="flex flex-column gap-2 flex-shrink-0 basis-[35%] min-w-[18rem] pr-4"
        >
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

          <!-- 🧾 Patient Basic Info -->
          <div
            class="flex flex-wrap gap-3 text-color-secondary text-sm md:text-base"
          >
            <!-- 📅 Date of Birth -->
            <span v-if="patient?.fecha_nacimiento">
              <i class="pi pi-calendar mr-2"></i>
              {{ formatDate(patient.fecha_nacimiento) }}
            </span>

            <!-- ☎️ Phone -->
            <span v-if="patient?.telefono">
              <i class="pi pi-phone mr-2"></i>
              {{ patient.telefono }}
            </span>

            <!-- ⚧️ Gender -->
            <span v-if="patient?.sexo">
              <i
                :class="[
                  'pi mr-2',
                  patient.sexo === 'Femenino'
                    ? 'pi-venus'
                    : patient.sexo === 'Masculino'
                      ? 'pi-mars'
                      : 'pi-genderless',
                ]"
              ></i>
              {{ patient.sexo }}
            </span>
          </div>
        </div>

        <!-- 🧱 Divider -->
        <div
          class="hidden md:block align-self-stretch w-0 border-right-1 surface-border"
        ></div>

        <!-- 🩺 Right: Medical Summary -->
        <div class="flex flex-column justify-content-center flex-grow-1 pl-4">
          <MedicalSummaryInline
            class="w-full"
            :record="medicalRecord"
            :loading="loadingMedical"
            :patient-id="patient?.id"
            @edit="$emit('editMedical')"
            @saved="$emit('saved')"
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
  medicalRecord: { type: Object, default: null },
  loadingMedical: { type: Boolean, default: false },
});

defineEmits(["edit", "editMedical", "saved"]);

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<style scoped>
.patient-header {
  margin-bottom: 1rem;
}
</style>
