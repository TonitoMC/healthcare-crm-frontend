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
        <i class="pi pi-calendar-edit text-primary text-3xl"></i>
        <div class="flex flex-column">
          <h2 class="m-0 text-xl font-semibold text-color">Editar Cita</h2>
          <span class="text-sm text-color-secondary">
            Actualice la información de la cita seleccionada
          </span>
        </div>
      </div>
    </template>

    <!-- Patient Summary Card -->
    <div
      v-if="appointment"
      class="surface-card border-round-lg shadow-1 border-1 surface-border p-4 mt-4 mx-2 flex flex-column md:flex-row align-items-center gap-3"
    >
      <!-- Avatar -->
      <div
        class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle flex-shrink-0"
        style="width: 3rem; height: 3rem"
      >
        <i class="pi pi-user text-xl"></i>
      </div>

      <!-- Info -->
      <div class="flex flex-column flex-1 min-w-0">
        <div
          class="font-semibold text-lg text-color mb-1 md:overflow-hidden md:text-overflow-ellipsis md:whitespace-nowrap"
        >
          {{ appointment.patient || "Paciente desconocido" }}
        </div>
        <div class="flex align-items-center gap-2 text-color-secondary">
          <i class="pi pi-phone text-sm"></i>
          <span class="text-sm">
            {{ appointment.telefono || "Sin teléfono" }}
          </span>
        </div>
        <div
          v-if="appointment.doctor"
          class="flex align-items-center gap-2 text-color-secondary mt-1"
        >
          <i class="pi pi-briefcase text-sm"></i>
          <span class="text-sm">{{ appointment.doctor }}</span>
        </div>
      </div>

      <div
        class="hidden md:flex align-items-center justify-content-center bg-surface-100 border-round-lg p-2 px-3"
      >
        <i class="pi pi-hashtag mr-1 text-color-secondary text-sm"></i>
        <span class="text-sm text-color-secondary">
          ID {{ appointment.id }}
        </span>
      </div>
    </div>

    <!-- Form Content -->
    <div class="py-5">
      <div class="grid" style="row-gap: 1.25rem">
        <!-- Fecha -->
        <div class="col-12 md:col-6 p-0">
          <div class="px-2">
            <label class="block mb-2 font-medium text-color">
              <i class="pi pi-calendar mr-2 text-primary"></i>
              Fecha
            </label>
            <DatePicker
              v-model="editDate"
              showIcon
              dateFormat="dd/mm/yy"
              class="w-full"
              placeholder="Seleccione la fecha"
              :pt="{ input: { class: 'w-full p-3' } }"
            />
          </div>
        </div>

        <!-- Hora -->
        <div class="col-12 md:col-6 p-0">
          <div class="px-2">
            <label class="block mb-2 font-medium text-color">
              <i class="pi pi-clock mr-2 text-primary"></i>
              Hora
            </label>
            <input
              type="time"
              v-model="editTime"
              class="p-inputtext w-full p-3 border-round-md"
              placeholder="Seleccione hora"
            />
          </div>
        </div>

        <!-- Duración -->
        <div class="col-12 md:col-6 p-0">
          <div class="px-2">
            <label class="block mb-2 font-medium text-color">
              <i class="pi pi-hourglass mr-2 text-primary"></i>
              Duración (minutos)
            </label>
            <InputNumber
              v-model="editDuration"
              :min="5"
              :max="180"
              :step="5"
              showButtons
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              class="w-full"
              suffix=" min"
              placeholder="30"
              :pt="{ input: { class: 'w-full p-3' } }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div
        class="flex justify-content-between align-items-center w-full gap-3 px-3 py-2 border-top-1 surface-border"
      >
        <Button
          label="Cerrar"
          icon="pi pi-times"
          text
          severity="secondary"
          class="px-3 py-2 text-sm"
          @click="handleClose"
        />
        <div class="flex gap-2">
          <Button
            label="Guardar Cambios"
            icon="pi pi-check"
            :loading="savingEdit"
            @click="saveEdit"
            severity="success"
            class="px-4 py-2 text-sm font-medium"
          />
          <Button
            label="Cancelar Cita"
            icon="pi pi-trash"
            severity="danger"
            outlined
            :loading="savingCancel"
            @click="cancelAppt"
            class="px-4 py-2 text-sm font-medium"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import { useToast } from "primevue/usetoast";
import { AppointmentService } from "@/services/appointmentService";
import { getErrorMessage } from "@/utils/errorMessages";
import { buildClinicDateTime } from "@/utils/time";

const props = defineProps({
  visible: Boolean,
  appointment: Object,
});
const emit = defineEmits(["update:visible", "updated", "cancelled"]);
const toast = useToast();

const show = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const editDate = ref(new Date());
const editTime = ref("08:00");
const editDuration = ref(30);
const savingEdit = ref(false);
const savingCancel = ref(false);

watch(
  () => props.appointment,
  (appt) => {
    if (appt) {
      const d = appt.rfc3339 ? new Date(appt.rfc3339) : new Date();
      editDate.value = d;
      editTime.value = appt.start || d.toTimeString().slice(0, 5);
      editDuration.value =
        Math.floor(appt.duracion / 60) ||
        Math.floor(appt.endMinutes - appt.startMinutes || 30);
    }
  },
  { immediate: true },
);

const saveEdit = async () => {
  savingEdit.value = true;
  try {
    const datePart = `${editDate.value.getFullYear()}-${String(
      editDate.value.getMonth() + 1,
    ).padStart(2, "0")}-${String(editDate.value.getDate()).padStart(2, "0")}`;
    const timePart = editTime.value;
    const apptDateStr = buildClinicDateTime(datePart, timePart);

    await AppointmentService.update(props.appointment.id, {
      fecha: apptDateStr,
      duracion: editDuration.value * 60,
    });

    toast.add({
      severity: "success",
      summary: "¡Éxito!",
      detail: "La cita ha sido actualizada correctamente",
      life: 3000,
    });

    emit("updated");
    show.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(err),
      life: 5000,
    });
  } finally {
    savingEdit.value = false;
  }
};

const cancelAppt = async () => {
  savingCancel.value = true;
  try {
    await AppointmentService.delete(props.appointment.id);
    toast.add({
      severity: "warn",
      summary: "Cita cancelada",
      detail: "La cita fue eliminada correctamente",
      life: 3000,
    });
    emit("cancelled");
    show.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(err),
      life: 5000,
    });
  } finally {
    savingCancel.value = false;
  }
};

const handleClose = () => {
  show.value = false;
};
</script>
