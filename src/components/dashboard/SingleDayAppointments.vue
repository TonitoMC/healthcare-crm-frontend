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
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Card from "primevue/card";
import DatePicker from "primevue/datepicker";
import AppointmentTimeline from "@/components/dashboard/AppointmentTimeline.vue";
import { getTodayAppointments } from "@/services/appointmentService.js";

const selectedDate = ref(new Date());
const rawAppointments = ref([]);

// Configure your clinic hours here
const businessHours = { start: "08:00", end: "18:00" };

const formattedDate = computed(() =>
  selectedDate.value.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
);

// ---------- normalization helpers ----------
const pad = (n) => String(n).padStart(2, "0");

const sanitizeTime = (t) => {
  if (!t) return null;
  // Accept "9:0", "09:00", "09:00:00"
  const m = String(t).match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/);
  if (!m) return null;
  const hh = Math.min(23, Math.max(0, Number(m[1])));
  const mm = Math.min(59, Math.max(0, Number(m[2])));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return `${pad(hh)}:${pad(mm)}`;
};

const addMinutes = (hhmm, minutes = 30) => {
  const parts = String(hhmm).split(":").map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return null;
  const total = parts[0] * 60 + parts[1] + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${pad(hh)}:${pad(mm)}`;
};

// Accepts both legacy { time, end?, duration? } and new { start, end }
const normalizedAppointments = computed(() => {
  const src = Array.isArray(rawAppointments.value) ? rawAppointments.value : [];

  const mapped = src
    .map((a) => {
      const startRaw = a.start ?? a.time;
      const endRaw =
        a.end ?? (startRaw ? addMinutes(startRaw, a.duration ?? 30) : null);

      const start = sanitizeTime(startRaw);
      const end = sanitizeTime(endRaw);

      if (!start || !end) return null;

      return {
        start,
        end,
        patient: a.patient ?? "Paciente",
        doctor: a.doctor ?? "",
        status: a.status ?? "Pendiente",
      };
    })
    .filter(Boolean)
    .sort((x, y) => x.start.localeCompare(y.start));

  // Fallback demo if nothing valid
  if (mapped.length === 0) {
    return [
      {
        start: "09:00",
        end: "09:30",
        patient: "María Pérez",
        doctor: "Dr. López",
        status: "Completada",
      },
      {
        start: "10:00",
        end: "10:30",
        patient: "Juan García",
        doctor: "Dr. Hernández",
        status: "Pendiente",
      },
      {
        start: "11:15",
        end: "11:45",
        patient: "Luis Martínez",
        doctor: "Dr. López",
        status: "En progreso",
      },
    ];
  }

  return mapped;
});

const fetchAppointments = async () => {
  try {
    const data = await getTodayAppointments(selectedDate.value);
    rawAppointments.value = Array.isArray(data) ? data : [];
  } catch {
    rawAppointments.value = [];
  }
};

onMounted(fetchAppointments);
watch(selectedDate, fetchAppointments);
</script>
