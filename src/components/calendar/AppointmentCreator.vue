<template>
  <Dialog
    v-model:visible="show"
    modal
    :style="{ width: '50rem', maxWidth: '95vw' }"
    @hide="handleClose"
    :pt="{
      root: { class: 'border-round-xl overflow-hidden' },
      header: {
        class: 'bg-primary px-6 py-4',
      },
      content: { class: 'px-6 py-4' },
    }"
  >
    <template #header>
      <div class="flex align-items-center gap-3">
        <div class="bg-primary-reverse surface-overlay border-circle p-3">
          <i class="pi pi-calendar-plus text-primary text-2xl"></i>
        </div>
        <div>
          <h2 class="m-0 text-2xl font-bold text-primary-contrast">Nueva Cita Médica</h2>
          <p class="m-0 mt-1 text-sm text-primary-contrast" style="opacity: 0.9">
            Seleccione un paciente existente o cree uno nuevo
          </p>
        </div>
      </div>
    </template>

    <Tabs v-model:value="activeTab">
      <TabList class="mb-4">
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

    <template #footer>
      <div
        class="flex justify-content-between align-items-center w-full gap-3 px-2 py-3"
      >
        <Button
          label="Cancelar"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="handleClose"
          class="px-4 py-3"
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
          class="px-5 py-3 font-semibold"
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
  if (activeTab.value === "existing") {
    return selectedPatient.value !== null;
  }
  const f = newPatientForm.value;
  return f.nombre && f.telefono && f.fecha_nacimiento && f.sexo;
});

// Watch para actualizar la fecha cuando cambian selectedDate o selectedTime
watch(
  () => [props.selectedDate, props.selectedTime, props.visible],
  ([date, time, visible]) => {
    if (visible && date) {
      // Asegurarse de que la fecha se interpreta correctamente como local
      let d;
      if (date instanceof Date) {
        // Si ya es un Date, crear una nueva fecha con los componentes locales
        d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      } else {
        // Si es un string, parsearlo como local
        const [year, month, day] = date.split("-").map(Number);
        d = new Date(year, month - 1, day);
      }

      if (time) {
        const [h, m] = time.split(":");
        d.setHours(parseInt(h), parseInt(m), 0, 0);
      } else {
        d.setHours(8, 0, 0, 0); // Hora por defecto
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
    // Formatear usando util central (offset fijo clínica)
  // Construir fecha clínica a partir de componentes (evita desplazamientos TZ del navegador)
  const datePart = `${form.value.fecha.getFullYear()}-${String(form.value.fecha.getMonth()+1).padStart(2,'0')}-${String(form.value.fecha.getDate()).padStart(2,'0')}`;
  const timePart = `${String(form.value.fecha.getHours()).padStart(2,'0')}:${String(form.value.fecha.getMinutes()).padStart(2,'0')}`;
  const apptDateStr = buildClinicDateTime(datePart, timePart);

    if (activeTab.value === "existing") {
      // Crear cita para paciente existente usando el backend
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
      // Crear paciente y cita en una transacción
      // Construir fecha de nacimiento en formato local YYYY-MM-DD
      const birthDate = newPatientForm.value.fecha_nacimiento;
      const birthYear = birthDate.getFullYear();
      const birthMonth = String(birthDate.getMonth() + 1).padStart(2, "0");
      const birthDay = String(birthDate.getDate()).padStart(2, "0");
      const birthDateStr = `${birthYear}-${birthMonth}-${birthDay}`;

      await AppointmentService.createWithNewPatient({
        patient_data: {
          nombre: newPatientForm.value.nombre,
          telefono: newPatientForm.value.telefono,
          fecha_nacimiento: birthDateStr,
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
    const message = getErrorMessage(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  // No resetear form.value.fecha aquí, el watch lo manejará cuando se abra el modal
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
