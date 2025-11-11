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
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Card from "primevue/card";
import DatePicker from "primevue/datepicker";
import AppointmentTimeline from "@/components/dashboard/AppointmentTimeline.vue";
import AppointmentCreator from "@/components/calendar/AppointmentCreator.vue";
import { AppointmentService } from "@/services/appointmentService.js";
import { ScheduleService } from "@/services/scheduleService.js";

// ─────────────────────────────────────────────
// 🕒 State
// ─────────────────────────────────────────────
const selectedDate = ref(new Date());
const rawAppointments = ref([]);
const businessHours = ref([]);
const showCreator = ref(false);
const appointmentDate = ref(null);
const appointmentTime = ref(null);
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

// Extract HH:mm from ISO datetime (already in local time, just extract time portion)
const extractTime = (isoDatetime) => {
  if (!isoDatetime) return null;
  const date = new Date(isoDatetime);
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
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
    // Appointments have proper timezone - just extract local time
    const localDate = new Date(a.fecha);
    const h = String(localDate.getHours()).padStart(2, "0");
    const m = String(localDate.getMinutes()).padStart(2, "0");

    const start = `${h}:${m}`;
    const durationMinutes = Math.floor((a.duracion ?? 0) / 60);
    const end = addMinutes(start, durationMinutes || 20);

    return {
      start,
      end,
      patient: a.nombre_paciente ?? a.nombre ?? "Paciente",
      doctor: "",
      status: "Pendiente",
      patientId: a.paciente_id,
    };
  });
});

// ─────────────────────────────────────────────
// 📡 API Calls
// ─────────────────────────────────────────────
const fetchAppointments = async () => {
  loading.value = true;
  try {
    const dateStr = selectedDate.value.toLocaleDateString("sv-SE");
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
    const dateStr = selectedDate.value.toLocaleDateString("sv-SE");
    console.log("Fetching schedule for:", dateStr);

    const data = await ScheduleService.getEffectiveDay(dateStr);
    console.log("Schedule received:", data);

    // Extract time portions (already in local time, just get HH:mm)
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
});
</script>
