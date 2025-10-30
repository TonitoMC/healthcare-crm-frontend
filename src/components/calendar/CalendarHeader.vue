<template>
  <div
    class="flex justify-content-between align-items-center flex-wrap gap-3 p-3"
  >
    <div>
      <h2 class="m-0 font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">
        Calendario
      </h2>
      <p
        class="m-0 text-color-secondary text-sm sm:text-base md:text-md lg:text-lg"
      >
        {{ displayLabel }}
      </p>
    </div>

    <div class="flex align-items-center gap-2">
      <Button icon="pi pi-angle-left" text rounded @click="prevPeriod" />
      <Button icon="pi pi-angle-right" text rounded @click="nextPeriod" />
      <Button
        label="Hoy"
        icon="pi pi-calendar"
        text
        class="font-medium"
        @click="goToday"
      />
      <Dropdown
        v-model="currentView"
        :options="viewOptions"
        optionLabel="label"
        optionValue="value"
        class="w-8rem"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";

const currentView = ref("month");
const currentDate = ref(new Date());

const viewOptions = [
  { label: "Mes", value: "month" },
  { label: "Semana", value: "week" },
];

// Capitalize helper (handles accents safely)
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// 🧭 Dynamic subtitle label
const displayLabel = computed(() => {
  const date = currentDate.value;
  const monthName = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);

  if (currentView.value === "month") {
    return capitalize(monthName);
  }

  // week view: Monday -> Sunday
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatDay = (d) =>
    d
      .toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })
      .replace(".", "");

  return `${capitalize(formatDay(start))} – ${formatDay(end)} ${end.getFullYear()}`;
});

// Monday-based start of week
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function prevPeriod() {
  const d = new Date(currentDate.value);
  if (currentView.value === "month") d.setMonth(d.getMonth() - 1);
  else d.setDate(d.getDate() - 7);
  currentDate.value = d;
}

function nextPeriod() {
  const d = new Date(currentDate.value);
  if (currentView.value === "month") d.setMonth(d.getMonth() + 1);
  else d.setDate(d.getDate() + 7);
  currentDate.value = d;
}

function goToday() {
  currentDate.value = new Date();
}
</script>
