<template>
  <Dialog
    v-model:visible="show"
    modal
    :style="{ width: '46rem', maxWidth: '95vw' }"
    @hide="handleClose"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      content: { class: 'px-6 py-0' },
    }"
  >
    <!-- Header -->
    <template #header>
      <div class="flex align-items-center gap-3 w-full px-2 py-1 surface-card">
        <i class="pi pi-calendar-plus text-primary text-3xl"></i>
        <div class="flex flex-column">
          <h2 class="m-0 text-xl font-semibold text-color">
            Nueva Cita Médica
          </h2>
          <span class="text-sm text-color-secondary">
            Seleccione un paciente existente o cree uno nuevo
          </span>
        </div>
      </div>
    </template>

    <!-- Tabs -->
    <Tabs v-model:value="activeTab" class="w-full">
      <TabList class="mb-0">
        <Tab value="existing" class="px-4 py-3">
          <i class="pi pi-search mr-2"></i>
          <span class="font-semibold">Paciente Existente</span>
        </Tab>
        <Tab value="new" class="px-4 py-3">
          <i class="pi pi-user-plus mr-2"></i>
          <span class="font-semibold">Paciente Nuevo</span>
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="existing" class="py-4">
          <ExistingPatientForm
            v-model:patient="selectedPatient"
            v-model:date="form.fecha"
            v-model:duration="durationMinutes"
          />
        </TabPanel>

        <TabPanel value="new" class="py-4">
          <NewPatientForm
            v-model:form="newPatientForm"
            v-model:date="form.fecha"
            v-model:duration="durationMinutes"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>

    <!-- Footer -->

    <template #footer>
      <div
        class="flex justify-content-between align-items-center w-full gap-3 px-3 py-2 border-top-1 surface-border"
      >
        <Button
          label="Cancelar"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="handleClose"
          class="px-3 py-2 text-sm"
        />
        <Button
          :label="
            activeTab === 'existing' ? 'Crear Cita' : 'Crear Paciente y Cita'
          "
          :icon="activeTab === 'existing' ? 'pi pi-check' : 'pi pi-user-plus'"
          @click="save"
          :loading="loading"
          :disabled="!canSave"
          severity="success"
          class="px-4 py-2 text-sm font-medium"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import { useToast } from "primevue/usetoast";
import { AppointmentService } from "@/services/appointmentService";
import ExistingPatientForm from "./ExistingPatientForm.vue";
import NewPatientForm from "./NewPatientForm.vue";
import { getErrorMessage } from "@/utils/errorMessages";
import { buildClinicDateTime } from "@/utils/time";

const props = defineProps({
  visible: Boolean,
  selectedDate: Date,
  selectedTime: String,
});
const emit = defineEmits(["update:visible", "created"]);
const toast = useToast();

const show = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const activeTab = ref("existing");
const form = ref({ fecha: new Date() });
const durationMinutes = ref(30);
const selectedPatient = ref(null);
const loading = ref(false);

const newPatientForm = ref({
  nombre: "",
  telefono: "",
  fecha_nacimiento: null,
  sexo: null,
});

const canSave = computed(() => {
  if (activeTab.value === "existing") return selectedPatient.value !== null;
  const f = newPatientForm.value;
  return f.nombre && f.telefono && f.fecha_nacimiento && f.sexo;
});

watch(
  () => [props.selectedDate, props.selectedTime, props.visible],
  ([date, time, visible]) => {
    if (visible && date) {
      let d;
      if (date instanceof Date) {
        d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      } else {
        const [year, month, day] = date.split("-").map(Number);
        d = new Date(year, month - 1, day);
      }
      if (time) {
        const [h, m] = time.split(":");
        d.setHours(parseInt(h), parseInt(m), 0, 0);
      } else {
        d.setHours(8, 0, 0, 0);
      }
      form.value.fecha = d;
    }
  },
  { immediate: true },
);

const save = async () => {
  if (!canSave.value) return;
  loading.value = true;
  try {
    const datePart = `${form.value.fecha.getFullYear()}-${String(
      form.value.fecha.getMonth() + 1,
    ).padStart(2, "0")}-${String(form.value.fecha.getDate()).padStart(2, "0")}`;
    const timePart = `${String(form.value.fecha.getHours()).padStart(
      2,
      "0",
    )}:${String(form.value.fecha.getMinutes()).padStart(2, "0")}`;
    const apptDateStr = buildClinicDateTime(datePart, timePart);

    if (activeTab.value === "existing") {
      await AppointmentService.create({
        paciente_id: selectedPatient.value.id,
        fecha: apptDateStr,
        duracion: durationMinutes.value * 60,
      });
      toast.add({
        severity: "success",
        summary: "¡Éxito!",
        detail: "La cita ha sido creada correctamente",
        life: 3000,
      });
    } else {
      const birth = newPatientForm.value.fecha_nacimiento;
      const birthStr = `${birth.getFullYear()}-${String(
        birth.getMonth() + 1,
      ).padStart(2, "0")}-${String(birth.getDate()).padStart(2, "0")}`;
      await AppointmentService.createWithNewPatient({
        patient_data: {
          nombre: newPatientForm.value.nombre,
          telefono: newPatientForm.value.telefono,
          fecha_nacimiento: birthStr,
          sexo: newPatientForm.value.sexo,
        },
        appointment_data: {
          fecha: apptDateStr,
          duracion: durationMinutes.value * 60,
        },
      });
      toast.add({
        severity: "success",
        summary: "¡Éxito!",
        detail: "El paciente y la cita han sido creados correctamente",
        life: 3000,
      });
    }
    emit("created");
    resetForm();
    show.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(err),
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  selectedPatient.value = null;
  durationMinutes.value = 30;
  newPatientForm.value = {
    nombre: "",
    telefono: "",
    fecha_nacimiento: null,
    sexo: null,
  };
  activeTab.value = "existing";
};

const handleClose = () => {
  resetForm();
  emit("update:visible", false);
};
</script>
