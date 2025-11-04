<template>
  <MediumModal v-model:visible="visible" :header="formattedHeader">
    <form class="flex flex-column gap-4" @submit.prevent="onSubmit">
      <!-- Override banner -->

      <!-- Override banner -->
      <Message
        v-if="isOverride"
        severity="warn"
        class="flex align-items-center mb-0 border-round-md py-0 px-2 text-sm sm:text-sm md:text-base leading-none"
      >
        <span class="text-color-secondary font-medium m-0">
          Este día tiene un horario personalizado.
        </span>
      </Message>

      <!-- Revert button -->
      <div v-if="isOverride" class="flex justify-content-start mt-1 mb-2">
        <Button
          label="Revertir a horario normal"
          icon="pi pi-refresh"
          severity="warning"
          text
          size="small"
          class="text-sm sm:text-sm md:text-base font-medium p-0 px-2 hover:surface-100 transition-all duration-150"
          @click="removeOverride"
        />
      </div>

      <!-- Override mode -->
      <div class="flex flex-column gap-1">
        <label class="text-xs md:text-sm font-medium text-color-secondary">
          Cómo quieres aplicar el cambio
        </label>
        <Dropdown
          v-model="mode"
          :options="modeOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full text-xs md:text-sm"
        />
      </div>

      <div
        v-for="(range, idx) in ranges"
        :key="idx"
        class="flex align-items-center gap-2 mb-2 flex-wrap"
      >
        <!-- Start -->
        <DatePicker
          v-model="range.start"
          timeOnly
          hourFormat="24"
          :pt="{
            root: { class: 'min-w-0 w-6rem sm:w-7rem md:w-8rem lg:w-9rem' },
            pcInputText: {
              root: {
                class: 'w-full text-center text-s md:text-m p-1 rounded-md',
              },
            },
          }"
        />

        <span class="text-color-secondary text-xs md:text-sm select-none"
          >—</span
        >

        <!-- End -->
        <DatePicker
          v-model="range.end"
          timeOnly
          hourFormat="24"
          :pt="{
            root: { class: 'min-w-0 w-6rem sm:w-7rem md:w-8rem lg:w-9rem' },
            pcInputText: {
              root: {
                class: 'w-full text-center text-s md:text-m p-1 rounded-md',
              },
            },
          }"
        />

        <!-- Remove -->
        <Button
          icon="pi pi-times"
          type="button"
          @click="removeRange(idx)"
          severity="danger"
          class="p-button-rounded p-button-text w-2rem h-2rem flex align-items-center justify-content-center transition-all duration-150"
        />
      </div>

      <!-- Add Range -->
      <div class="flex justify-content-start mt-2">
        <Button
          label="Agregar rango"
          icon="pi pi-plus"
          type="button"
          severity="success"
          class="p-button-sm sm:w-7rem md:w-8rem lg:w-9rem"
          @click="addRange"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-content-end gap-2 pt-3">
        <Button
          label="Cancelar"
          class="p-button-text text-xs md:text-sm"
          type="button"
          @click="close"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          :loading="loading"
          class="p-button-sm p-button-success text-xs md:text-sm"
          type="submit"
        />
      </div>
    </form>
  </MediumModal>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import MediumModal from "@/components/MediumModal.vue";
import { ScheduleService } from "@/services/scheduleService.js";
import { useToast } from "primevue/usetoast";
const toast = useToast();

const isOverride = computed(() => props.dayData?.is_override === true);

// ✅ Props
const props = defineProps({
  visible: { type: Boolean, required: true },
  date: { type: Date, required: true },
  ranges: { type: Array, default: () => [] },

  dayData: { type: Object, default: () => null }, // ✅ new prop
});
const emit = defineEmits(["update:visible", "saved"]);

const visible = ref(props.visible);
watch(
  () => props.visible,
  (v) => (visible.value = v),
);
watch(visible, (v) => emit("update:visible", v));

// ✅ Header
const formattedHeader = computed(() => {
  const text = props.date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
});

// ✅ Override mode
const mode = ref("date");
const modeOptions = computed(() => [
  {
    label: `Aplicar solo para esta fecha (${props.date.toISOString().slice(0, 10)})`,
    value: "date",
  },
  {
    label: `Aplicar para cada ${props.date.toLocaleDateString("es-ES", {
      weekday: "long",
    })}`,
    value: "day",
  },
]);

// ✅ Local copy of ranges that resets when props change
const ranges = ref([]);
watch(
  () => [props.date, props.ranges],
  () => {
    ranges.value = props.ranges.map((r) => ({
      start: parseTimeToDate(r.start),
      end: parseTimeToDate(r.end),
    }));
  },
  { immediate: true },
);

const loading = ref(false);

// ---------- helpers ----------
function parseTimeToDate(timeStr) {
  if (!timeStr) return new Date(0, 0, 0, 9, 0);
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(0, 0, 0, h, m);
}

function formatDateToHHMM(dateObj) {
  if (!(dateObj instanceof Date)) return "09:00";
  const h = String(dateObj.getHours()).padStart(2, "0");
  const m = String(dateObj.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// ---------- range controls ----------
function addRange() {
  ranges.value.push({
    start: new Date(0, 0, 0, 9, 0),
    end: new Date(0, 0, 0, 17, 0),
  });
}
function removeRange(i) {
  ranges.value.splice(i, 1);
}
function close() {
  visible.value = false;
}

async function onSubmit() {
  // validate before saving
  for (let i = 0; i < ranges.value.length; i++) {
    const { start, end } = ranges.value[i];
    if (start >= end) {
      toast.add({
        severity: "error",
        summary: "Rango inválido",
        detail: `El rango #${i + 1} tiene la hora inicial mayor o igual a la final.`,
        life: 3000,
      });
      return;
    }

    for (let j = i + 1; j < ranges.value.length; j++) {
      const a = ranges.value[i];
      const b = ranges.value[j];
      // Overlap check: if startA < endB && startB < endA
      if (a.start < b.end && b.start < a.end) {
        toast.add({
          severity: "error",
          summary: "Rangos superpuestos",
          detail: `Los rangos #${i + 1} y #${j + 1} se superponen.`,
          life: 3000,
        });
        return;
      }
    }
  }

  // proceed if validation passed
  loading.value = true;
  try {
    const formattedRanges = ranges.value.map((r) => ({
      start: formatDateToHHMM(r.start),
      end: formatDateToHHMM(r.end),
    }));

    if (mode.value === "day") {
      const dayOfWeek = props.date.getDay() === 0 ? 7 : props.date.getDay();
      await ScheduleService.setWorkingHours({
        day_of_week: dayOfWeek,
        ranges: formattedRanges,
      });
    } else {
      await ScheduleService.setSpecialHours({
        date: props.date.toISOString().slice(0, 10),
        ranges: formattedRanges,
      });
    }

    emit("saved");
    close();
    toast.add({
      severity: "success",
      summary: "Horario guardado",
      detail: "Los cambios se aplicaron correctamente.",
      life: 2500,
    });
  } catch (err) {
    console.error("Failed to update schedule:", err);
    toast.add({
      severity: "error",
      summary: "Error al guardar",
      detail: "No se pudo actualizar el horario.",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}

// ---------- remove override ----------
async function removeOverride() {
  if (!props.dayData?.date) return;

  loading.value = true;
  try {
    await ScheduleService.deleteSpecialHours(props.dayData.date.slice(0, 10));
    emit("saved"); // triggers parent to reload schedules
    close(); // close modal
  } catch (err) {
    console.error("Failed to remove override:", err);
  } finally {
    loading.value = false;
  }
}
</script>
