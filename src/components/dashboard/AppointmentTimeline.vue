<template>
  <div class="flex-1 min-h-0 p-3 bg-surface-50">
    <Timeline
      :value="timelineItems"
      align="left"
      class="w-full"
      :pt="{
        eventOpposite: {
          style: `
          flex: 0 0 7rem;
          text-align: right;
          white-space: nowrap;
          padding-right: 0.75rem;
        `,
        },
        eventContent: { style: 'flex: 1;' },
      }"
    >
      <template #opposite="slotProps">
        <small class="text-sm text-color-secondary font-medium">
          {{ slotProps.item.time }}
        </small>
      </template>

      <template #content="slotProps">
        <!-- Appointment -->
        <div
          v-if="slotProps.item.type === 'appointment'"
          class="flex flex-column gap-2 w-full p-3 border-round shadow-1 surface-card mb-3"
        >
          <div
            class="flex justify-content-between align-items-center flex-wrap gap-2"
          >
            <div class="flex flex-column">
              <router-link
                v-if="slotProps.item.patientId"
                :to="`/app/patients/${slotProps.item.patientId}`"
                class="patient-link font-medium text-sm md:text-base"
              >
                {{ slotProps.item.patient }}
              </router-link>
              <span v-else class="font-medium text-sm md:text-base text-color">
                {{ slotProps.item.patient }}
              </span>
              <small class="text-xs md:text-sm text-color-secondary">
                {{ slotProps.item.doctor }}
              </small>
            </div>
            <div class="flex gap-2 align-items-center">
              <Tag
                :value="slotProps.item.status"
                :severity="statusColor(slotProps.item.status)"
                size="small"
              />
              <Button
                v-if="
                  slotProps.item.patientId &&
                  isWithinOneHour(slotProps.item.start)
                "
                label="Ir a Paciente"
                icon="pi pi-user"
                size="small"
                @click="
                  $router.push(`/app/patients/${slotProps.item.patientId}`)
                "
              />
            </div>
          </div>
        </div>

        <!-- Blocked Period (lunch, breaks, etc) -->
        <div
          v-else-if="slotProps.item.type === 'blocked'"
          class="flex flex-column gap-1 w-full p-3 border-round bg-yellow-50 border-1 border-yellow-200 mb-3"
        >
          <div class="flex align-items-center gap-2">
            <i class="pi pi-clock text-yellow-600 text-sm"></i>
            <span class="text-sm md:text-base text-yellow-800 font-medium">
              {{ slotProps.item.label || "Fuera de horario" }}
            </span>
          </div>
        </div>

        <!-- Free Slot (clickable) -->
        <div
          v-else
          class="flex flex-column gap-1 w-full p-3 border-round surface-100 border-1 border-dashed border-gray-300 mb-3 cursor-pointer hover:surface-200 transition-colors transition-duration-150"
          @click="handleCreateAppointment(slotProps.item)"
        >
          <span class="text-sm md:text-base text-color-secondary italic">
            Espacio libre
          </span>
        </div>
      </template>
    </Timeline>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Tag from "primevue/tag";
import Timeline from "primevue/timeline";
import Button from "primevue/button";

const props = defineProps({
  appointments: { type: Array, required: true },
  businessHours: {
    type: Array,
    default: () => [],
  },
  minGapMinutes: { type: Number, default: 15 },
  selectedDate: { type: Date, default: () => new Date() },
});

const emit = defineEmits(["create-appointment"]);

const isWithinOneHour = (timeStr) => {
  if (!timeStr) return false;
  const now = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  const apptTime = new Date();
  apptTime.setHours(hours, minutes, 0, 0);
  const diffMs = apptTime - now;
  const diffMins = diffMs / (1000 * 60);
  return diffMins >= 0 && diffMins <= 60;
};

const toMinutes = (hhmm) => {
  const [h, m] = (hhmm ?? "").split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
};

const isValidTime = (hhmm) =>
  typeof hhmm === "string" &&
  /^\d{1,2}:\d{2}$/.test(hhmm) &&
  !Number.isNaN(toMinutes(hhmm));

const clampToBusiness = (start, end, bhStart, bhEnd) => {
  const s = Math.max(toMinutes(start), toMinutes(bhStart));
  const e = Math.min(toMinutes(end), toMinutes(bhEnd));
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;
  const pad = (n) => String(n).padStart(2, "0");
  const toHHMM = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
  return { start: toHHMM(s), end: toHHMM(e) };
};

const statusColor = (status) => {
  switch (status) {
    case "Pendiente":
      return "warning";
    case "Completada":
      return "success";
    case "En progreso":
      return "info";
    default:
      return "secondary";
  }
};

const handleCreateAppointment = (slot) => {
  const startTime = slot.time.split(" - ")[0];
  emit("create-appointment", { date: props.selectedDate, time: startTime });
};

const timelineItems = computed(() => {
  const items = [];

  // If no business hours, show closed message
  if (!props.businessHours || !props.businessHours.length) {
    return [
      {
        time: "Todo el día",
        type: "blocked",
        label: "Cerrado",
      },
    ];
  }

  // Sort business hours/working ranges
  const sortedRanges = [...props.businessHours].sort((a, b) =>
    a.start.localeCompare(b.start),
  );

  // Process each working range
  sortedRanges.forEach((range, idx) => {
    const rangeStart = range.start;
    const rangeEnd = range.end;

    // Get appointments within this working range
    const validAppts = props.appointments
      .map((a) => {
        if (!a) return null;
        if (!isValidTime(a.start) || !isValidTime(a.end)) return null;
        const clamped = clampToBusiness(a.start, a.end, rangeStart, rangeEnd);
        if (!clamped) return null;
        return { ...a, start: clamped.start, end: clamped.end };
      })
      .filter(Boolean)
      .sort((x, y) => x.start.localeCompare(y.start));

    // Build gaps + appointments within this working range
    let prevEnd = rangeStart;

    for (const appt of validAppts) {
      const gap = toMinutes(appt.start) - toMinutes(prevEnd);
      if (gap >= props.minGapMinutes) {
        items.push({ time: `${prevEnd} - ${appt.start}`, type: "free" });
      }
      items.push({
        time: `${appt.start} - ${appt.end}`,
        patient: appt.patient ?? "Paciente",
        doctor: appt.doctor ?? "",
        status: appt.status ?? "Pendiente",
        type: "appointment",
        patientId: appt.patientId ?? appt.paciente_id,
        start: appt.start,
      });
      prevEnd = appt.end;
    }

    // Add remaining free time at end of working range
    const tailGap = toMinutes(rangeEnd) - toMinutes(prevEnd);
    if (tailGap >= props.minGapMinutes) {
      items.push({ time: `${prevEnd} - ${rangeEnd}`, type: "free" });
    }

    // Add blocked period between working ranges (e.g., lunch)
    if (idx < sortedRanges.length - 1) {
      const nextRange = sortedRanges[idx + 1];
      const gapStart = rangeEnd;
      const gapEnd = nextRange.start;

      if (toMinutes(gapEnd) > toMinutes(gapStart)) {
        items.push({
          time: `${gapStart} - ${gapEnd}`,
          type: "blocked",
          label: "Descanso",
        });
      }
    }
  });

  return items;
});
</script>

<style scoped>
.patient-link {
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

.patient-link:hover {
  text-decoration: underline;
}
</style>
