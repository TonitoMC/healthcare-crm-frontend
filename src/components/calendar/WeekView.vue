<template>
  <div class="flex flex-column flex-1 min-h-0 p-3 text-xs md:text-sm">
    <WeekHeader
      :weekDays="weekDays"
      :dayNames="dayNames"
      :isToday="isToday"
      :effectiveSchedules="effectiveSchedules"
      :loadSchedules="loadSchedules"
    />

    <div class="grid flex-1 gap-2 pt-3">
      <DayColumn
        v-for="day in weekDays"
        :key="day.toDateString()"
        :slots="getSlotsFor(day)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import WeekHeader from "@/components/calendar/WeekHeader.vue";
import DayColumn from "@/components/calendar/DayColumn.vue";
import { ScheduleService } from "@/services/scheduleService.js";

// Props
const props = defineProps({
  currentDate: { type: Date, required: true },
});

// Constants
const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Reactive state
const effectiveSchedules = ref([]);

// Compute the current week (Mon–Sun)
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

// ⬇️ function that handles schedule loading (added back, nothing else changed)
async function loadSchedules() {
  const start = weekDays.value[0].toISOString().slice(0, 10);
  const end = weekDays.value[6].toISOString().slice(0, 10);
  try {
    effectiveSchedules.value = await ScheduleService.getEffectiveRange(
      start,
      end,
    );
  } catch (err) {
    console.error("[WeekView] Failed to fetch effective schedule:", err);
  }
}

// Fetch schedule range from API
onMounted(loadSchedules);

// 🔁 Re-fetch whenever currentDate changes
watch(
  () => props.currentDate,
  async () => {
    await loadSchedules();
  },
);

function isToday(day) {
  const now = new Date();
  return (
    now.getDate() === day.getDate() &&
    now.getMonth() === day.getMonth() &&
    now.getFullYear() === day.getFullYear()
  );
}

// Helpers for time manipulation
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const pad = (n) => String(n).padStart(2, "0");
const toHHMM = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

// Mock appointments (replace with your real ones later)
const allAppointments = [
  { date: "2025-10-27", start: "09:00", end: "09:30", patient: "José Ramírez" },
  { date: "2025-10-28", start: "10:15", end: "11:00", patient: "María López" },
  { date: "2025-10-29", start: "14:00", end: "14:45", patient: "Carlos Díaz" },
  {
    date: "2025-10-30",
    start: "15:00",
    end: "16:00",
    patient: "Lucía Morales",
  },
];

/**
 * Builds slots (free + appointment) for each day.
 * Uses effective working ranges from backend.
 */

function getSlotsFor(day) {
  const dateStr = day.toISOString().slice(0, 10);
  const schedule = effectiveSchedules.value.find(
    (s) => s.date.slice(0, 10) === dateStr,
  );

  if (!schedule || !schedule.active || !schedule.ranges?.length) {
    return [{ type: "free", time: "Libre", centered: true }];
  }

  const ranges = schedule.ranges.map((r) => ({
    start: r.start.slice(11, 16),
    end: r.end.slice(11, 16),
  }));

  const dayAppts = allAppointments
    .filter((a) => a.date === dateStr)
    .sort((a, b) => a.start.localeCompare(b.start));

  const rangeGroups = [];

  for (const range of ranges) {
    const slots = [];
    let prevEnd = range.start;

    for (const appt of dayAppts) {
      if (appt.end <= range.start || appt.start >= range.end) continue;

      const effectiveStart = Math.max(
        toMinutes(appt.start),
        toMinutes(range.start),
      );
      const effectiveEnd = Math.min(toMinutes(appt.end), toMinutes(range.end));

      if (toMinutes(prevEnd) < effectiveStart) {
        slots.push({
          type: "free",
          time: `${prevEnd} - ${toHHMM(effectiveStart)}`,
        });
      }

      slots.push({
        type: "appointment",
        time: `${toHHMM(effectiveStart)} - ${toHHMM(effectiveEnd)}`,
        patient: appt.patient,
      });

      prevEnd = toHHMM(effectiveEnd);
    }

    if (toMinutes(prevEnd) < toMinutes(range.end)) {
      slots.push({
        type: "free",
        time: `${prevEnd} - ${range.end}`,
      });
    }

    rangeGroups.push({
      label: `${range.start} - ${range.end}`,
      type: "workingRange",
      slots,
    });
  }

  // If no ranges, add all-day "Libre"
  if (!rangeGroups.length) {
    return [{ type: "free", time: "Libre", centered: true }];
  }

  return rangeGroups;
}
</script>
