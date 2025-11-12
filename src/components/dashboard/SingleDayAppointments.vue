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
      <ScrollPanel class="flex-1 min-h-0">
        <div class="p-3">
          <AppointmentTimeline
            :appointments="normalizedAppointments"
            :business-hours="businessHours"
            :min-gap-minutes="15"
            :selected-date="selectedDate"
            @create-appointment="handleCreateAppointment"
            @edit-appointment="openEditModal"
            @cancel-appointment="openCancelModal"
          />
        </div>
      </ScrollPanel>
    </template>
  </Card>

  <!-- Modal: Crear Cita -->
  <AppointmentCreator
    v-model:visible="showCreator"
    :selectedDate="appointmentDate"
    :selectedTime="appointmentTime"
    @created="handleAppointmentCreated"
  />

  <!-- Modal: Editar Cita -->
  <EditAppointmentDialog
    v-model:visible="showEditor"
    :appointment="editingAppt"
    @updated="handleAppointmentUpdated"
    @cancelled="handleAppointmentCancelled"
  />
  <!-- Modal: Cancelar Cita -->
  <CancelAppointmentDialog
    v-model:visible="showCancelDialog"
    :appointment="cancellingAppt"
    @cancelled="handleAppointmentCancelled"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Card from "primevue/card";
import DatePicker from "primevue/datepicker";
import ScrollPanel from "primevue/scrollpanel";
import AppointmentTimeline from "@/components/dashboard/AppointmentTimeline.vue";
import AppointmentCreator from "@/components/calendar/AppointmentCreator.vue";
import EditAppointmentDialog from "@/components/calendar/EditAppointmentDialog.vue";
import { AppointmentService } from "@/services/appointmentService.js";
import { ScheduleService } from "@/services/scheduleService.js";
import CancelAppointmentDialog from "@/components/calendar/CancelAppointmentDialog.vue";
import { clinicDateString } from "@/utils/time.js";
import { useToast } from "primevue/usetoast";

// ─────────────────────────────────────────────
// 🕒 State
// ─────────────────────────────────────────────
const selectedDate = ref(new Date());
const rawAppointments = ref([]);
const businessHours = ref([]);
const showCreator = ref(false);
const showEditor = ref(false);
const showCancelDialog = ref(false);
const cancellingAppt = ref(null);
const appointmentDate = ref(null);
const appointmentTime = ref(null);
const editingAppt = ref(null);
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

const extractTime = (isoDatetime) => {
  if (!isoDatetime || typeof isoDatetime !== "string") return null;
  return isoDatetime.length >= 16 ? isoDatetime.slice(11, 16) : null;
};

const toMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== "string") return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
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
    const data = await AppointmentService.getByDate(dateStr);
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
    const data = await ScheduleService.getEffectiveDay(dateStr);
    if (data.ranges && Array.isArray(data.ranges) && data.ranges.length > 0) {
      businessHours.value = data.ranges
        .map((range) => ({
          start: extractTime(range.start),
          end: extractTime(range.end),
        }))
        .filter((range) => range.start && range.end);
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
  appointmentDate.value = date;
  appointmentTime.value = time;
  showCreator.value = true;
};

const handleAppointmentCreated = async () => {
  showCreator.value = false;
  await fetchAppointments();
};

const openEditModal = (item) => {
  if (!item || !item.id) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar la cita",
      life: 3000,
    });
    return;
  }

  editingAppt.value = item;
  showEditor.value = true;
};

const openCancelModal = (item) => {
  if (!item || !item.id) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar la cita a cancelar",
      life: 3000,
    });
    return;
  }

  cancellingAppt.value = item;
  showCancelDialog.value = true;
};

const handleAppointmentUpdated = async () => {
  showEditor.value = false;
  await fetchAppointments();
  toast.add({
    severity: "success",
    summary: "Cita actualizada",
    life: 3000,
  });
};

const handleAppointmentCancelled = async () => {
  showEditor.value = false;
  await fetchAppointments();
};

// ─────────────────────────────────────────────
// ⚙️ Lifecycle
// ─────────────────────────────────────────────
onMounted(fetchAll);
watch(selectedDate, fetchAll);
</script>
