<template>
  <div class="flex flex-column flex-1 min-h-0 p-3 text-xs md:text-sm">
    <div class="flex-shrink-0">
      <WeekHeader
        :weekDays="weekDays"
        :dayNames="dayNames"
        :isToday="isToday"
        :effectiveSchedules="effectiveSchedules"
        :loadSchedules="loadSchedules"
      />
    </div>

    <div class="grid flex-1 gap-2 pt-3 overflow-auto">
      <DayColumn
        v-for="day in weekDays"
        :key="day.toDateString()"
        :slots="getSlotsFor(day)"
        @slot-click="handleSlotClick(day, $event)"
      />
    </div>
  </div>

  <!-- Modal Crear Cita -->
  <AppointmentCreator
    v-model:visible="showCreator"
    :selectedDate="selectedDate"
    :selectedTime="selectedTime"
    @created="handleAppointmentCreated"
  />

  <!-- ✔ New Edit Modal -->
  <EditAppointmentDialog
    v-model:visible="showEditor"
    :appointment="editingAppt"
    @updated="handleEditUpdated"
    @cancelled="handleEditCancelled"
  />
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import WeekHeader from "@/components/calendar/WeekHeader.vue";
import DayColumn from "@/components/calendar/DayColumn.vue";
import AppointmentCreator from "@/components/calendar/AppointmentCreator.vue";
import EditAppointmentDialog from "@/components/calendar/EditAppointmentDialog.vue";

import { ScheduleService } from "@/services/scheduleService.js";
import { AppointmentService } from "@/services/appointmentService.js";
import {
  clinicDateString,
  hhmmToMinutes,
  minutesToHHMM,
  buildClinicDateTime,
} from "@/utils/time.js";
import { getErrorMessage } from "@/utils/errorMessages.js";
import { useToast } from "primevue/usetoast";

const toast = useToast();

// Props
const props = defineProps({
  currentDate: { type: Date, required: true },
});

// Constants
const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Reactive state
const effectiveSchedules = ref([]);
const weekAppointments = ref([]); // All full raw appts
const showCreator = ref(false);
const selectedDate = ref(null);
const selectedTime = ref(null);

// Edit modal state
const showEditor = ref(false);
const editingAppt = ref(null);

const editTime = ref("00:00");
const editDuration = ref(30);
const editDate = ref(new Date());
const savingEdit = ref(false);

// Compute week days
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

async function loadSchedules() {
  const start = clinicDateString(weekDays.value[0]);
  const end = clinicDateString(weekDays.value[6]);
  try {
    effectiveSchedules.value = await ScheduleService.getEffectiveRange(
      start,
      end,
    );
  } catch (err) {
    console.error("[WeekView] Failed to fetch effective schedule:", err);
  }
}

async function loadAppointments() {
  const start = clinicDateString(weekDays.value[0]);
  const end = clinicDateString(weekDays.value[6]);

  try {
    const promises = weekDays.value.map((day) =>
      AppointmentService.getByDate(clinicDateString(day)),
    );
    const results = await Promise.all(promises);
    weekAppointments.value = results.flat(); // raw full objects
  } catch (err) {
    console.error("[WeekView] Failed to fetch appointments:", err);
    weekAppointments.value = [];
  }
}

async function loadAll() {
  await Promise.all([loadSchedules(), loadAppointments()]);
}

onMounted(loadAll);

watch(
  () => props.currentDate,
  async () => {
    await loadAll();
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

const toMinutes = hhmmToMinutes;
const toHHMM = minutesToHHMM;

const extractTime = (isoDatetime) => {
  if (!isoDatetime || typeof isoDatetime !== "string") return null;
  return isoDatetime.length >= 16 ? isoDatetime.slice(11, 16) : null;
};

function getSlotsFor(day) {
  const dateStr = clinicDateString(day);
  const schedule = effectiveSchedules.value.find(
    (s) => s.date.slice(0, 10) === dateStr,
  );

  if (!schedule || !schedule.active || !schedule.ranges?.length) {
    return [
      {
        type: "workingRange",
        label: "Día Libre",
        slots: [{ type: "dayOff", time: "Día Libre", centered: true }],
      },
    ];
  }

  const ranges = schedule.ranges.map((r) => ({
    start: r.start.slice(11, 16),
    end: r.end.slice(11, 16),
  }));

  // FULL RAW APPTS INCLUDED HERE 👇
  const dayAppts = weekAppointments.value
    .filter((a) => {
      if (!a || !a.fecha) return false;
      return a.fecha.slice(0, 10) === dateStr;
    })
    .map((a) => {
      const start = extractTime(a.fecha);
      if (!start) return null;

      const durationMin = Math.round((a.duracion || 1800) / 60);
      const startMin = toMinutes(start);
      const endMin = startMin + durationMin;

      return {
        start,
        end: toHHMM(endMin),
        patient: a.nombre_paciente || a.nombre || "Paciente",
        id: a.id,
        rfc3339: a.fecha,

        // ✔ KEEP FULL RAW APPT
        raw: a,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.start.localeCompare(b.start));

  const rangeGroups = [];
  const GAP_MINUTES = 0;

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

      // ✔ Pass raw appointment to the slot
      slots.push({
        type: "appointment",
        time: `${toHHMM(effectiveStart)} - ${toHHMM(effectiveEnd)}`,
        patient: appt.patient,
        id: appt.id,
        start: toHHMM(effectiveStart),
        end: toHHMM(effectiveEnd),
        rfc3339: appt.rfc3339,

        raw: appt.raw, // <-- FULL OBJECT HERE
      });

      prevEnd = toHHMM(effectiveEnd + GAP_MINUTES);
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

  return rangeGroups;
}

function handleSlotClick(day, slot) {
  if (slot.type === "appointment") {
    openEditModal(slot, day);
    return;
  }
  if (slot.type === "dayOff") return;
  if (slot.type !== "free") return;

  let timeStr;
  if (slot.time === "Libre" || slot.centered) {
    timeStr = "09:00";
  } else {
    timeStr = slot.time.split(" - ")[0] || "09:00";
  }

  selectedDate.value = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
  );
  selectedTime.value = timeStr;
  showCreator.value = true;
}

async function handleAppointmentCreated() {
  showCreator.value = false;
  await loadAll();
}

function handleEditUpdated() {
  showEditor.value = false;
  editingAppt.value = null;
  loadAll();
}

function handleEditCancelled() {
  showEditor.value = false;
  editingAppt.value = null;
  loadAll();
}

function openEditModal(slot, day) {
  if (!slot || !slot.id) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar la cita",
      life: 3000,
    });
    return;
  }

  // ✔ Use FULL RAW APPOINTMENT
  editingAppt.value = slot.raw;

  showEditor.value = true;
}
</script>
