<template>
  <Dialog
    v-model:visible="show"
    modal
    :style="{ width: '32rem', maxWidth: '90vw' }"
    @hide="handleClose"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      content: { class: 'px-5 py-0' },
    }"
  >
    <template #header>
      <div
        class="flex align-items-center gap-2 w-full px-3 py-2 surface-card border-bottom-1 surface-border"
      >
        <div class="flex flex-column">
          <h2 class="m-0 text-lg font-semibold text-color">Cancelar Cita</h2>
          <span class="text-sm text-color-secondary mt-1">
            Confirme la cancelación de la cita seleccionada
          </span>
        </div>
      </div>
    </template>

    <!-- Content -->
    <div class="pt-0 pb-4 flex flex-column gap-4">
      <!-- Appointment Summary -->
      <div
        class="surface-card border-round-lg shadow-1 border-1 surface-border p-4 flex flex-column gap-2"
      >
        <div class="flex align-items-center gap-2">
          <i class="pi pi-user text-primary"></i>
          <span class="font-medium text-color">
            {{ patientName || "Paciente desconocido" }}
          </span>
        </div>

        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
          <i class="pi pi-calendar"></i>
          <span>{{ formattedDate }}</span>
        </div>

        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
          <i class="pi pi-hourglass"></i>
          <span>{{ durationText }}</span>
        </div>
      </div>

      <Message severity="warn" icon="pi pi-exclamation-triangle" class="w-full">
        Esta acción no se puede deshacer.
      </Message>
    </div>

    <template #footer>
      <div
        class="flex justify-content-end align-items-center w-full gap-2 px-3 py-2 border-top-1 surface-border"
      >
        <Button
          label="Cerrar"
          icon="pi pi-times"
          text
          severity="secondary"
          class="px-3 py-2 text-sm"
          @click="handleClose"
        />
        <Button
          label="Cancelar Cita"
          icon="pi pi-trash"
          severity="danger"
          outlined
          :loading="saving"
          class="px-4 py-2 text-sm font-medium hover:bg-red-50"
          @click="confirmCancel"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { AppointmentService } from "@/services/appointmentService";
import { PatientService } from "@/services/patientService";
import { getErrorMessage } from "@/utils/errorMessages";

const props = defineProps({
  visible: Boolean,
  appointment: Object,
});

const emit = defineEmits(["update:visible", "cancelled"]);
const toast = useToast();

const show = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const saving = ref(false);
const loading = ref(false);
const fullAppointment = ref(null);
const patient = ref(null);

// ─────────────────────────────────────────────
// 🧠 Fetch detailed appointment + patient info
// ─────────────────────────────────────────────
async function loadAppointmentDetails() {
  if (!props.appointment?.id) return;
  loading.value = true;
  try {
    // 1️⃣ Fetch appointment by ID
    const appt = await AppointmentService.getById(props.appointment.id);
    fullAppointment.value = appt;

    // 2️⃣ Fetch patient data
    if (appt.paciente_id) {
      try {
        patient.value = await PatientService.getPatient(appt.paciente_id);
      } catch {
        patient.value = { nombre: "Paciente desconocido", telefono: "" };
      }
    } else {
      patient.value = { nombre: "Paciente desconocido", telefono: "" };
    }
  } catch (err) {
    console.error("Error fetching appointment details:", err);
    fullAppointment.value = props.appointment;
  } finally {
    loading.value = false;
  }
}

watch(
  () => [show.value, props.appointment?.id],
  async ([visible]) => {
    if (visible && props.appointment?.id) await loadAppointmentDetails();
  },
);

// ─────────────────────────────────────────────
// 🧾 Derived display fields
// ─────────────────────────────────────────────
const patientName = computed(() => {
  return (
    patient.value?.nombre ||
    props.appointment?.paciente_nombre ||
    props.appointment?.nombre ||
    "Paciente desconocido"
  );
});

const formattedDate = computed(() => {
  const raw = fullAppointment.value?.fecha || props.appointment?.fecha;
  if (!raw) return "Sin fecha";
  const date = new Date(raw);
  return date.toLocaleString("es-GT", {
    dateStyle: "long",
    timeStyle: "short",
  });
});

const durationText = computed(() => {
  const dur =
    fullAppointment.value?.duracion || props.appointment?.duracion || 1800; // fallback 30min
  return `${Math.round(dur / 60)} minutos`;
});

// ─────────────────────────────────────────────
// 🗑️ Cancel logic
// ─────────────────────────────────────────────
const confirmCancel = async () => {
  saving.value = true;
  try {
    const id = fullAppointment.value?.id || props.appointment?.id;
    await AppointmentService.delete(id);

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
    saving.value = false;
  }
};

const handleClose = () => {
  show.value = false;
  fullAppointment.value = null;
  patient.value = null;
};
</script>
