<template>
  <Card
    class="w-full h-full flex flex-column overflow-hidden"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
      content: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
    }"
  >
    <!-- 🧭 Header -->
    <template #title>
      <div
        class="flex justify-content-between align-items-center flex-wrap gap-3"
      >
        <span class="font-semibold text-base sm:text-md md:text-lg lg:text-xl">
          Citas del Día
        </span>
        <DatePicker v-model="selectedDate" dateFormat="dd/mm/yy" showIcon />
      </div>
    </template>

    <!-- 🧩 Scrollable bounded content -->
    <template #content>
      <div class="flex-1 min-h-0 overflow-y-auto p-3">
        <AppointmentTimeline
          :appointments="normalizedAppointments"
          :business-hours="businessHours"
          :min-gap-minutes="15"
          :selected-date="selectedDate"
          @create-appointment="handleCreateAppointment"
          @edit-appointment="openEditModal"
        />
      </div>
    </template>
  </Card>

  <!-- Modal Crear Cita -->
  <AppointmentCreator
    v-model:visible="showCreator"
    :selectedDate="appointmentDate"
    :selectedTime="appointmentTime"
    @created="handleAppointmentCreated"
  />
  <Dialog
    v-model:visible="showEditor"
    modal
    header="Editar Cita"
    :style="{ width: '30rem', maxWidth: '95vw' }"
  >
    <div class="flex flex-column gap-3">
      <div>
        <label class="text-sm font-medium">Fecha</label>
        <DatePicker v-model="editDate" dateFormat="dd/mm/yy" showIcon />
      </div>
      <div>
        <label class="text-sm font-medium">Hora</label>
        <input type="time" v-model="editTime" class="p-inputtext w-full" />
      </div>
      <div>
        <label class="text-sm font-medium">Duración (min)</label>
        <input type="number" min="5" step="5" v-model.number="editDuration" class="p-inputtext w-full" />
      </div>
      <div class="flex justify-content-end gap-2 mt-3">
        <Button label="Cancelar" text severity="secondary" @click="closeEdit" />
        <Button label="Guardar" icon="pi pi-check" :loading="savingEdit" @click="saveEdit" />
        <Button label="Cancelar Cita" severity="danger" icon="pi pi-trash" :loading="savingEdit" @click="cancelAppt" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Card from "primevue/card";
import DatePicker from "primevue/datepicker";
import AppointmentTimeline from "@/components/dashboard/AppointmentTimeline.vue";
import AppointmentCreator from "@/components/calendar/AppointmentCreator.vue";
import { AppointmentService } from "@/services/appointmentService.js";
import { ScheduleService } from "@/services/scheduleService.js";
import { clinicDateString, buildClinicDateTime } from "@/utils/time.js";
import { getErrorMessage } from "@/utils/errorMessages.js";
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

// ─────────────────────────────────────────────
// 🕒 State
// ─────────────────────────────────────────────
const selectedDate = ref(new Date());
const rawAppointments = ref([]);
const businessHours = ref([]);
const showCreator = ref(false);
const showEditor = ref(false);
const appointmentDate = ref(null);
const appointmentTime = ref(null);
const editingAppt = ref(null);
const editTime = ref("00:00");
const editDuration = ref(30);
const savingEdit = ref(false);
const editDate = ref(new Date());
const toast = useToast();
const loading = ref(false);

// ─────────────────────────────────────────────
// 🧩 Helpers
// ─────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

const addMinutes = (hhmm, minutes = 30) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${pad(hh)}:${pad(mm)}`;
};

// Extrae HH:mm de un datetime RFC3339 preservando la hora declarada (zona clínica)
// Evita usar getUTC* o getHours() para no desplazar por tz del navegador.
const extractTime = (isoDatetime) => {
  if (!isoDatetime || typeof isoDatetime !== "string") return null;
  // "YYYY-MM-DDTHH:mm:ss±HH:MM" -> tomar HH:mm en posiciones 11..16
  return isoDatetime.length >= 16 ? isoDatetime.slice(11, 16) : null;
};

// ─────────────────────────────────────────────
// 🧮 Computed
// ─────────────────────────────────────────────
const formattedDate = computed(() =>
  selectedDate.value.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
);

const normalizedAppointments = computed(() => {
  return (rawAppointments.value || []).map((a) => {
    // Preservar hora clínica desde RFC3339 (sin desplazar a tz del navegador)
    const start = extractTime(a.fecha);
    const durationMinutes = Math.floor((a.duracion ?? 0) / 60);
    const end = addMinutes(start, durationMinutes || 20);

    return {
      start,
      end,
      patient: a.nombre_paciente ?? a.nombre ?? "Paciente",
      doctor: "",
      status: "Pendiente",
      patientId: a.paciente_id,
      id: a.id,
      rfc3339: a.fecha,
    };
  });
});

// ─────────────────────────────────────────────
// 📡 API Calls
// ─────────────────────────────────────────────
const fetchAppointments = async () => {
  loading.value = true;
  try {
    const dateStr = clinicDateString(selectedDate.value);
    console.log("Fetching appointments for:", dateStr);

    const data = await AppointmentService.getByDate(dateStr);
    console.log("Received appointments:", data);

    rawAppointments.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    rawAppointments.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchSchedule = async () => {
  try {
    const dateStr = clinicDateString(selectedDate.value);
    console.log("Fetching schedule for:", dateStr);

    const data = await ScheduleService.getEffectiveDay(dateStr);
    console.log("Schedule received:", data);

    // Extraer HH:mm preservando la hora de la zona clínica
    if (data.ranges && Array.isArray(data.ranges) && data.ranges.length > 0) {
      businessHours.value = data.ranges
        .map((range) => ({
          start: extractTime(range.start),
          end: extractTime(range.end),
        }))
        .filter((range) => range.start && range.end);

      console.log("Parsed business hours:", businessHours.value);
    } else {
      businessHours.value = [];
    }
  } catch (error) {
    console.error("Error fetching schedule:", error);
    businessHours.value = [];
  }
};

const fetchAll = async () => {
  await Promise.all([fetchAppointments(), fetchSchedule()]);
};

// ─────────────────────────────────────────────
// ✳️ Handlers
// ─────────────────────────────────────────────
const handleCreateAppointment = ({ date, time }) => {
  console.log("Create appointment clicked:", { date, time });
  appointmentDate.value = date;
  appointmentTime.value = time;
  showCreator.value = true;
};

const handleAppointmentCreated = async () => {
  showCreator.value = false;
  await fetchAppointments();
};

function openEditModal(item) {
  console.log("🟢 SingleDayAppointments - openEditModal called with:", item);
  
  if (!item || !item.id) {
    console.error("openEditModal: item is invalid", item);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la cita', life: 3000 });
    return;
  }
  
  editingAppt.value = item;
  editTime.value = item.start || "00:00";
  
  const startMins = toMinutes(item.start || "00:00");
  const endMins = toMinutes(item.end || "00:00");
  const diffMins = endMins - startMins;
  editDuration.value = diffMins > 0 ? diffMins : 30;
  
  editDate.value = item.rfc3339 ? new Date(item.rfc3339) : new Date(selectedDate.value);
  showEditor.value = true;
  console.log("🟢 SingleDayAppointments - showEditor set to:", showEditor.value);
  console.log("🟢 Edit data:", { editTime: editTime.value, editDuration: editDuration.value, editDate: editDate.value });
}

function closeEdit() {
  showEditor.value = false;
  editingAppt.value = null;
}

function toMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') {
    console.warn('toMinutes received invalid input:', hhmm);
    return 0;
  }
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

async function saveEdit() {
  if (!editingAppt.value) return;
  savingEdit.value = true;
  try {
    const datePart = clinicDateString(editDate.value);
    const apptDateStr = buildClinicDateTime(datePart, editTime.value);
    const durationSeconds = editDuration.value * 60;
    await AppointmentService.update(editingAppt.value.id, {
      fecha: apptDateStr,
      duracion: durationSeconds,
    });
    await fetchAppointments();
    toast.add({ severity: 'success', summary: 'Cita actualizada', life: 2000 });
    closeEdit();
  } catch (e) {
    console.error("Error updating appointment", e);
    const errorMsg = getErrorMessage(e);
    toast.add({ 
      severity: 'error', 
      summary: 'Error al actualizar la cita', 
      detail: errorMsg, 
      life: 5000 
    });
  } finally {
    savingEdit.value = false;
  }
}

async function cancelAppt() {
  if (!editingAppt.value) return;
  const confirmDelete = window.confirm("¿Eliminar esta cita?");
  if (!confirmDelete) return;
  savingEdit.value = true;
  try {
    await AppointmentService.delete(editingAppt.value.id);
    await fetchAppointments();
    toast.add({ severity: 'success', summary: 'Cita eliminada', life: 2000 });
    closeEdit();
  } catch (e) {
    console.error('Error deleting appointment', e);
    const errorMsg = getErrorMessage(e);
    toast.add({ 
      severity: 'error', 
      summary: 'Error al eliminar la cita', 
      detail: errorMsg, 
      life: 5000 
    });
  } finally {
    savingEdit.value = false;
  }
}

// ─────────────────────────────────────────────
// ⚙️ Lifecycle
// ─────────────────────────────────────────────
onMounted(fetchAll);
watch(selectedDate, fetchAll);

// ─────────────────────────────────────────────
// 💾 Exports to template
// ─────────────────────────────────────────────
defineExpose({
  selectedDate,
  formattedDate,
  normalizedAppointments,
  businessHours,
  showCreator,
  appointmentDate,
  appointmentTime,
  handleCreateAppointment,
  handleAppointmentCreated,
  loading,
  // editor exposure (optional for parent access)
  showEditor,
  openEditModal,
  saveEdit,
  closeEdit,
  cancelAppt,
});
</script>
