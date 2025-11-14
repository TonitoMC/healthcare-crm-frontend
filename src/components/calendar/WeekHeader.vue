<template>
  <div
    class="grid text-center border-bottom-1 surface-border pb-1 mb-2 text-xs md:text-sm"
  >
    <div
      v-for="day in weekDays"
      :key="day.toDateString()"
      class="col text-xl relative flex flex-column align-items-center justify-content-center h-5rem"
      :class="
        isToday(day) ? 'text-primary font-semibold' : 'text-color-secondary'
      "
    >
      <!-- edit icon -->
      <i
        v-if="canEdit"
        class="pi pi-pencil absolute top-0 right-0 m-2 text-sm md:text-base cursor-pointer opacity-50 text-color-secondary hover:opacity-100 border-circle p-1 hover:surface-50"
        v-tooltip.top="'Editar horas'"
        @click="openEdit(day)"
      ></i>

      <!-- day label + date -->
      <div class="text-xs md:text-sm lg:text-base">
        {{ dayNames[day.getDay()] }}
      </div>
      <div class="text-xs md:text-s lg:text-base text-color-secondary">
        {{ day.getDate() }}
      </div>
    </div>

    <EditHoursModal
      v-if="selectedDay"
      v-model:visible="editVisible"
      :date="selectedDay"
      :ranges="getRangesFor(selectedDay)"
      :day-data="getDayDataFor(selectedDay)"
      @saved="loadSchedules"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import EditHoursModal from "@/components/calendar/EditHoursModal.vue";

const { weekDays, dayNames, isToday, effectiveSchedules, loadSchedules } =
  defineProps({
    weekDays: { type: Array, required: true },
    dayNames: { type: Array, required: true },
    isToday: { type: Function, required: true },
    effectiveSchedules: { type: Array, default: () => [] },
    loadSchedules: { type: Function, required: true },
  });

const auth = useAuthStore();
const canEdit = computed(() => auth.permissions.includes("editar-horarios"));

const editVisible = ref(false);
const selectedDay = ref(null);

// 🔥 FIX: NO timezones, clone only Y/M/D
function cloneLocal(day) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate());
}

function openEdit(day) {
  if (!day) return;
  selectedDay.value = cloneLocal(day); // 🔥 FIX — same exact calendar day
  editVisible.value = true;
}

// Create local YYYY-MM-DD (no TZ)
function localDateString(date) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

function getRangesFor(day) {
  if (!day || !effectiveSchedules.length) return [];
  const dateStr = localDateString(day);

  const schedule = effectiveSchedules.find(
    (s) => s?.date?.slice(0, 10) === dateStr,
  );

  return (
    schedule?.ranges?.map((r) => ({
      start: r.start.slice(11, 16),
      end: r.end.slice(11, 16),
    })) || []
  );
}

function getDayDataFor(day) {
  if (!day || !effectiveSchedules.length) return null;
  const dateStr = localDateString(day);

  return (
    effectiveSchedules.find((s) => s?.date?.slice(0, 10) === dateStr) || null
  );
}
</script>
