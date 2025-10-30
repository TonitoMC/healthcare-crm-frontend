<template>
  <div class="flex flex-column flex-1 min-h-0 p-3 text-xs md:text-sm">
    <!-- Week header -->
    <div
      class="grid text-center border-bottom-1 surface-border pb-1 mb-2 text-xs md:text-sm"
    >
      <div
        v-for="day in weekDays"
        :key="day.toDateString()"
        class="col font-medium"
        :class="
          isToday(day) ? 'text-primary font-semibold' : 'text-color-secondary'
        "
      >
        {{ dayNames[day.getDay()] }}
        <div class="text-2xs text-color-secondary">{{ day.getDate() }}</div>
      </div>
    </div>

    <!-- Day columns -->
    <div class="grid flex-1 gap-2">
      <div
        v-for="day in weekDays"
        :key="'day-' + day.toDateString()"
        class="col flex flex-column min-h-0 p-2 surface-card border-round-lg shadow-1 overflow-auto"
      >
        <div v-for="slot in getSlotsFor(day)" :key="slot.time" class="mb-1">
          <!-- Appointment -->
          <div
            v-if="slot.type === 'appointment'"
            class="p-2 border-round-md shadow-1 bg-primary-50 flex justify-content-between align-items-center"
          >
            <span class="font-medium text-xs md:text-sm text-color truncate">
              {{ slot.patient }}
            </span>
            <small class="text-2xs md:text-xs text-color-secondary">
              {{ slot.time }}
            </small>
          </div>

          <!-- Free slot -->
          <div
            v-else
            class="p-2 border-round-md border-1 border-dashed surface-100 border-gray-300 flex justify-content-between align-items-center"
          >
            <span class="italic text-xs md:text-sm text-color-secondary">
              Libre
            </span>
            <small class="text-2xs md:text-xs text-color-secondary">
              {{ slot.time }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentDate: { type: Date, required: true },
});

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const weekDays = computed(() => {
  const base = new Date(props.currentDate);
  const copy = new Date(base);
  const day = copy.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  copy.setDate(copy.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(copy);
    d.setDate(copy.getDate() + i);
    return d;
  });
});

function isToday(day) {
  const now = new Date();
  return (
    now.getDate() === day.getDate() &&
    now.getMonth() === day.getMonth() &&
    now.getFullYear() === day.getFullYear()
  );
}

// Mock data
const allAppointments = [
  {
    date: "2025-10-27",
    start: "09:00",
    end: "09:30",
    patient: "José Ramírez",
    doctor: "Dr. González",
    status: "Pendiente",
  },
  {
    date: "2025-10-28",
    start: "10:15",
    end: "11:00",
    patient: "María López",
    doctor: "Dra. Pérez",
    status: "Completada",
  },
  {
    date: "2025-10-29",
    start: "14:00",
    end: "14:45",
    patient: "Carlos Díaz",
    doctor: "Dr. Hernández",
    status: "En progreso",
  },
  {
    date: "2025-10-30",
    start: "15:00",
    end: "16:00",
    patient: "Lucía Morales",
    doctor: "Dr. Sánchez",
    status: "Pendiente",
  },
];

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const pad = (n) => String(n).padStart(2, "0");
const toHHMM = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

function getSlotsFor(day) {
  const bhStart = "08:00";
  const bhEnd = "18:00";
  const minGap = 15;
  const dateStr = day.toISOString().slice(0, 10);
  const dayAppts = allAppointments
    .filter((a) => a.date === dateStr)
    .sort((a, b) => a.start.localeCompare(b.start));

  const items = [];
  let prevEnd = bhStart;

  for (const appt of dayAppts) {
    const gap = toMinutes(appt.start) - toMinutes(prevEnd);
    if (gap >= minGap) {
      items.push({ time: `${prevEnd} - ${appt.start}`, type: "free" });
    }
    items.push({
      type: "appointment",
      time: `${appt.start} - ${appt.end}`,
      patient: appt.patient,
      doctor: appt.doctor,
      status: appt.status,
    });
    prevEnd = appt.end;
  }

  const tailGap = toMinutes(bhEnd) - toMinutes(prevEnd);
  if (tailGap >= minGap)
    items.push({ time: `${prevEnd} - ${bhEnd}`, type: "free" });
  if (items.length === 0)
    items.push({ time: `${bhStart} - ${bhEnd}`, type: "free" });
  return items;
}
</script>
