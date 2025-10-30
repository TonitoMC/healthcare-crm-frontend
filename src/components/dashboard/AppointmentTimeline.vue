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
        <div
          v-if="slotProps.item.type === 'appointment'"
          class="flex flex-column gap-2 w-full p-3 border-round shadow-1 surface-card mb-3"
        >
          <div
            class="flex justify-content-between align-items-center flex-wrap gap-2"
          >
            <div class="flex flex-column">
              <span class="font-medium text-sm md:text-base text-color">
                {{ slotProps.item.patient }}
              </span>
              <small class="text-xs md:text-sm text-color-secondary">
                {{ slotProps.item.doctor }}
              </small>
            </div>
            <Tag
              :value="slotProps.item.status"
              :severity="statusColor(slotProps.item.status)"
              size="small"
            />
          </div>
        </div>

        <div
          v-else
          class="flex flex-column gap-1 w-full p-3 border-round surface-100 border-1 border-dashed border-gray-300 mb-3"
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
import ScrollPanel from "primevue/scrollpanel";

const props = defineProps({
  // Expected normalized: [{ start: "HH:mm", end: "HH:mm", patient, doctor, status }]
  appointments: { type: Array, required: true },
  businessHours: {
    type: Object,
    default: () => ({ start: "08:00", end: "18:00" }),
  },
  minGapMinutes: { type: Number, default: 15 },
});

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

const timelineItems = computed(() => {
  const bhStart = props.businessHours.start;
  const bhEnd = props.businessHours.end;

  // Normalize + validate + clamp
  const valid = props.appointments
    .map((a) => {
      if (!a) return null;
      if (!isValidTime(a.start) || !isValidTime(a.end)) return null;
      const clamped = clampToBusiness(a.start, a.end, bhStart, bhEnd);
      if (!clamped) return null;
      return {
        ...a,
        start: clamped.start,
        end: clamped.end,
      };
    })
    .filter(Boolean)
    .sort((x, y) => x.start.localeCompare(y.start));

  const items = [];
  let prevEnd = bhStart;

  // Build gaps + appointments
  for (const appt of valid) {
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
    });
    prevEnd = appt.end;
  }

  // Tail gap
  const tailGap = toMinutes(bhEnd) - toMinutes(prevEnd);
  if (tailGap >= props.minGapMinutes) {
    items.push({ time: `${prevEnd} - ${bhEnd}`, type: "free" });
  }

  // If no valid appts at all, show the whole day free
  if (valid.length === 0) {
    return [{ time: `${bhStart} - ${bhEnd}`, type: "free" }];
  }

  return items;
});
</script>
