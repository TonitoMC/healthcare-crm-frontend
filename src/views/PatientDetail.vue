<template>
  <div
    v-if="loading"
    class="flex justify-content-center align-items-center"
    style="min-height: 400px"
  >
    <ProgressSpinner />
  </div>

  <div v-else-if="error" class="p-4">
    <Message severity="error" :closable="false">{{ error }}</Message>
  </div>

  <div v-else class="patient-detail-view p-4 flex flex-column gap-3">
    <!-- 🧩 Header -->
    <PatientHeader
      :patient="patient"
      @edit="handleEdit"
      @viewHistory="handleViewHistory"
    />

    <div class="flex flex-column md:flex-row gap-3 mt-2 flex-1 min-h-0">
      <!-- Consultas (2/3) -->
      <div class="flex flex-column flex-1 md:w-8 lg:w-8 h-full">
        <ConsultationManager
          :patient-id="patientId"
          :consultations="consultations"
          class="flex flex-column flex-1 h-full"
        />
      </div>

      <!-- Exámenes (1/3) -->
      <div class="flex flex-column flex-1 md:w-4 lg:w-4 h-full">
        <ExamsSection
          :patient-id="patientId"
          :exams="exams"
          class="flex flex-column flex-1 h-full"
        />
      </div>
    </div>
  </div>

  <!-- 🧾 Edit Patient Dialog -->
  <Dialog
    v-model:visible="showEditDialog"
    header="Editar Paciente"
    :modal="true"
    style="width: 500px"
  >
    <div class="flex flex-column gap-3">
      <div>
        <label class="block mb-2 text-sm">Nombre</label>
        <InputText v-model="editForm.nombre" class="w-full text-sm" />
      </div>
      <div>
        <label class="block mb-2 text-sm">Teléfono</label>
        <InputText v-model="editForm.telefono" class="w-full text-sm" />
      </div>
      <div>
        <label class="block mb-2 text-sm">Fecha de Nacimiento</label>
        <Calendar
          v-model="editForm.fecha_nacimiento"
          dateFormat="yy-mm-dd"
          class="w-full text-sm"
        />
      </div>
      <div>
        <label class="block mb-2 text-sm">Sexo</label>
        <Dropdown
          v-model="editForm.sexo"
          :options="['M', 'F']"
          placeholder="Seleccionar"
          class="w-full text-sm"
        />
      </div>
      <div class="flex gap-2 justify-content-end">
        <Button
          label="Cancelar"
          severity="secondary"
          @click="showEditDialog = false"
          class="text-sm"
        />
        <Button label="Guardar" @click="savePatient" class="text-sm" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Tag from "primevue/tag";
import PatientHeader from "../components/patient/PatientHeader.vue";
import ConsultationManager from "../components/patient/ConsultationManager.vue";
import ExamsSection from "../components/patient/ExamsSection.vue";
import { usePatientData } from "../composables/usePatientData";

const route = useRoute();
const patientId = ref(parseInt(route.params.id));

const {
  patient,
  exams,
  consultations,
  medicalRecord,
  loading,
  error,
  loadPatient,
  updatePatient,
} = usePatientData();

const showEditDialog = ref(false);
const editForm = ref({
  nombre: "",
  telefono: "",
  fecha_nacimiento: null,
  sexo: "",
});

function handleEdit() {
  editForm.value = {
    nombre: patient.value.nombre,
    telefono: patient.value.telefono,
    fecha_nacimiento: patient.value.fecha_nacimiento
      ? new Date(patient.value.fecha_nacimiento)
      : null,
    sexo: patient.value.sexo,
  };
  showEditDialog.value = true;
}

function handleViewHistory() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function savePatient() {
  const updateData = {
    ...editForm.value,
    fecha_nacimiento: editForm.value.fecha_nacimiento
      ?.toISOString()
      .split("T")[0],
  };
  await updatePatient(patientId.value, updateData);
  showEditDialog.value = false;
}

onMounted(async () => {
  await loadPatient(patientId.value);
});
</script>

<style scoped>
.patient-detail-view {
  width: 100%;
  max-width: 100%;
}

:deep(.p-datatable) {
  font-size: 0.875rem; /* text-sm */
}

:deep(.p-datatable .p-column-header-content) {
  font-weight: 600;
  font-size: 0.85rem;
}

:deep(.p-dialog-content) {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}
</style>
