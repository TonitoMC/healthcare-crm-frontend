<template>
  <Dialog
    v-model:visible="show"
    modal
    :style="{ width: '60rem', maxWidth: '95vw' }"
    @hide="handleClose"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      content: { class: 'px-6 py-0' },
    }"
  >
    <!-- Header -->
    <template #header>
      <div class="flex align-items-center gap-3 w-full px-2 py-1 surface-card">
        <i class="pi pi-calendar-plus text-primary text-3xl"></i>
        <div class="flex flex-column">
          <h2 class="m-0 text-xl font-semibold text-color">
            Nueva Cita Médica
          </h2>
          <span class="text-sm text-color-secondary">
            Seleccione un paciente existente o cree uno nuevo
          </span>
        </div>
      </div>
    </template>

    <!-- Tabs -->
    <Tabs v-model:value="activeTab" class="w-full">
      <TabList class="mb-0">
        <Tab value="existing" class="px-4 py-3">
          <i class="pi pi-search mr-2"></i>
          <span class="font-semibold">Paciente Existente</span>
        </Tab>
        <Tab value="new" class="px-4 py-3">
          <i class="pi pi-user-plus mr-2"></i>
          <span class="font-semibold">Paciente Nuevo</span>
        </Tab>
      </TabList>

      <TabPanels>
        <!-- EXISTING: Two-column layout with a small right sidebar -->
        <TabPanel value="existing" class="py-4">
          <div class="flex flex-column md:flex-row">
            <!-- Left: existing form (unchanged) -->
            <div class="flex-1 min-w-0">
              <ExistingPatientForm
                v-model:patient="selectedPatient"
                v-model:date="form.fecha"
                v-model:duration="durationMinutes"
              />
            </div>

            <!-- Separator -->
            <div
              class="hidden md:block border-left-1 surface-border mx-3"
            ></div>

            <!-- Right: Free slots bar -->
            <aside
              class="md:w-18rem w-full md:pl-4 mt-4 md:mt-0 flex flex-column gap-3 p-0"
            >
              <div class="flex align-items-center gap-2">
                <i class="pi pi-clock text-primary text-lg"></i>
                <span class="font-semibold text-color text-base">
                  Horarios disponibles
                </span>
              </div>

              <!-- Card container -->
              <Panel
                class="w-full shadow-1 border-round-lg overflow-hidden"
                :pt="{
                  header: {
                    class:
                      'bg-surface-100 text-color font-medium text-sm px-3 py-2',
                  },
                  content: { class: 'p-0 bg-surface-section' },
                }"
              >
                <ScrollPanel
                  class="w-full"
                  style="max-height: 16rem"
                  :pt="{
                    bar: { class: 'bg-primary-200' },
                    handle: { class: 'bg-primary-400 border-round-sm' },
                  }"
                >
                  <div
                    v-if="freeSlots.length"
                    class="flex flex-column gap-2 p-2"
                  >
                    <Button
                      v-for="slot in freeSlots"
                      :key="slot"
                      :label="slot"
                      icon="pi pi-clock"
                      iconPos="left"
                      size="small"
                      outlined
                      class="justify-content-between w-full text-left text-sm"
                      @click="selectSlot(slot)"
                    />
                  </div>

                  <div
                    v-else
                    class="text-center text-sm text-color-secondary italic p-3 border-top-1 surface-border"
                  >
                    No hay espacios libres en esta fecha
                  </div>
                </ScrollPanel>
              </Panel>

              <small class="block text-color-secondary text-xs italic pl-1">
                * Toque un rango para usar su hora de inicio.
              </small>
            </aside>
          </div>
        </TabPanel>

        <TabPanel value="new" class="py-4">
          <div class="flex flex-column md:flex-row align-items-start">
            <!-- Left: new patient form -->
            <div class="flex-1 min-w-0">
              <NewPatientForm
                v-model:form="newPatientForm"
                v-model:date="form.fecha"
                v-model:duration="durationMinutes"
              />
            </div>

            <!-- Separator (visible and full height on desktop) -->
            <div
              class="hidden md:block border-left-1 surface-border mx-3"
              style="align-self: stretch"
            ></div>

            <!-- Right: Free slots bar -->
            <aside
              class="md:w-18rem w-full md:pl-4 mt-4 md:mt-0 flex flex-column gap-3 p-0 flex-shrink-0"
            >
              <div class="flex align-items-center gap-2">
                <i class="pi pi-clock text-primary text-lg"></i>
                <span class="font-semibold text-color text-base">
                  Horarios disponibles
                </span>
              </div>

              <!-- Card container -->
              <Panel
                class="w-full shadow-1 border-round-lg overflow-hidden"
                :pt="{
                  header: {
                    class:
                      'bg-surface-100 text-color font-medium text-sm px-3 py-2',
                  },
                  content: { class: 'p-0 bg-surface-section' },
                }"
              >
                <ScrollPanel
                  class="w-full"
                  style="max-height: 16rem"
                  :pt="{
                    bar: { class: 'bg-primary-200' },
                    handle: { class: 'bg-primary-400 border-round-sm' },
                  }"
                >
                  <div
                    v-if="freeSlots.length"
                    class="flex flex-column gap-2 p-2"
                  >
                    <Button
                      v-for="slot in freeSlots"
                      :key="slot"
                      :label="slot"
                      icon="pi pi-clock"
                      iconPos="left"
                      size="small"
                      outlined
                      class="justify-content-between w-full text-left text-sm"
                      @click="selectSlot(slot)"
                    />
                  </div>

                  <div
                    v-else
                    class="text-center text-sm text-color-secondary italic p-3 border-top-1 surface-border"
                  >
                    No hay espacios libres en esta fecha
                  </div>
                </ScrollPanel>
              </Panel>

              <small class="block text-color-secondary text-xs italic pl-1">
                * Toque un rango para usar su hora de inicio.
              </small>
            </aside>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <!-- Footer -->
    <template #footer>
      <div
        class="flex justify-content-between align-items-center w-full gap-3 px-3 py-2 border-top-1 surface-border"
      >
        <Button
          label="Cancelar"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="handleClose"
          class="px-3 py-2 text-sm"
        />
        <Button
          :label="
            activeTab === 'existing' ? 'Crear Cita' : 'Crear Paciente y Cita'
          "
          :icon="activeTab === 'existing' ? 'pi pi-check' : 'pi pi-user-plus'"
          @click="save"
          :loading="loading"
          :disabled="!canSave"
          severity="success"
          class="px-4 py-2 text-sm font-medium"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import { useToast } from "primevue/usetoast";

import { AppointmentService } from "@/services/appointmentService";
import { ScheduleService } from "@/services/scheduleService";

import ExistingPatientForm from "./ExistingPatientForm.vue";
import NewPatientForm from "./NewPatientForm.vue";

import { getErrorMessage } from "@/utils/errorMessages";
import { buildClinicDateTime, clinicDateString } from "@/utils/time";

const props = defineProps({
  visible: Boolean,
  selectedDate: Date,
  selectedTime: String,
});

const emit = defineEmits(["update:visible", "created"]);
const toast = useToast();

const show = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const activeTab = ref("existing");
const form = ref({ fecha: new Date() });
const durationMinutes = ref(30);
const selectedPatient = ref(null);
const loading = ref(false);

// NEW: free slots
const freeSlots = ref([]);

const newPatientForm = ref({
  nombre: "",
  telefono: "",
  fecha_nacimiento: null,
  sexo: null,
});

const canSave = computed(() => {
  if (activeTab.value === "existing") return selectedPatient.value !== null;
  const f = newPatientForm.value;
  return f.nombre && f.telefono && f.fecha_nacimiento && f.sexo;
});

// Keep your initial date initializations
watch(
  () => [props.selectedDate, props.selectedTime, props.visible],
  ([date, time, visible]) => {
    if (visible && date) {
      let d;
      if (date instanceof Date) {
        d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      } else {
        const [year, month, day] = date.split("-").map(Number);
        d = new Date(year, month - 1, day);
      }
      
      if (time) {
        // Si se proporciona una hora específica, usarla
        const [h, m] = time.split(":");
        d.setHours(parseInt(h), parseInt(m), 0, 0);
      } else {
        // Si no hay hora específica, usar 8:00 como hora temporal
        // refreshFreeSlots() la ajustará al primer slot disponible
        d.setHours(8, 0, 0, 0);
      }
      
      form.value.fecha = d;
    }
  },
  { immediate: true },
);

// ─────────────────────────────────────────────
// Free-slots computation (minimal & side-effect free)
// ─────────────────────────────────────────────
const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

// Extract "HH:mm" from RFC3339 without TZ drift
const extractHHMM = (rfc3339) =>
  typeof rfc3339 === "string" && rfc3339.length >= 16
    ? rfc3339.slice(11, 16)
    : null;

function computeFreeSlots(businessRanges, dayAppointments, minGap = 15) {
  if (!Array.isArray(businessRanges) || businessRanges.length === 0) return [];

  // normalize appointments into minutes
  const booked = (dayAppointments || [])
    .map((a) => {
      const startHHMM = extractHHMM(a.fecha);
      if (!startHHMM) return null;
      const start = toMinutes(startHHMM);
      const durMin = Math.max(0, Math.floor((a.duracion ?? 0) / 60));
      return { start, end: start + durMin };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);

  const free = [];

  businessRanges.forEach((r) => {
    // ranges from ScheduleService.getEffectiveDay usually come as RFC3339
    const rs = extractHHMM(r.start);
    const re = extractHHMM(r.end);
    if (!rs || !re) return;

    const rangeStart = toMinutes(rs);
    const rangeEnd = toMinutes(re);

    let cursor = rangeStart;

    for (const appt of booked) {
      // skip appointments fully outside this range
      if (appt.end <= rangeStart || appt.start >= rangeEnd) continue;

      const blockStart = Math.max(appt.start, rangeStart);
      const blockEnd = Math.min(appt.end, rangeEnd);

      if (blockStart - cursor >= minGap) {
        free.push(`${toHHMM(cursor)} - ${toHHMM(blockStart)}`);
      }
      cursor = Math.max(cursor, blockEnd);
    }

    if (rangeEnd - cursor >= minGap) {
      free.push(`${toHHMM(cursor)} - ${toHHMM(rangeEnd)}`);
    }
  });

  return free;
}

async function refreshFreeSlots() {
  try {
    const dateStr = clinicDateString(form.value.fecha);
    const [schedule, appts] = await Promise.all([
      ScheduleService.getEffectiveDay(dateStr),
      AppointmentService.getByDate(dateStr),
    ]);

    const ranges = Array.isArray(schedule?.ranges) ? schedule.ranges : [];
    freeSlots.value = computeFreeSlots(ranges, appts, 15);
    
    // Si no hay hora especificada y hay slots libres, usar el primero
    if (!props.selectedTime && freeSlots.value.length > 0) {
      const firstSlot = freeSlots.value[0];
      const startTime = firstSlot.split(" - ")[0];
      const [h, m] = startTime.split(":");
      const d = new Date(form.value.fecha);
      d.setHours(parseInt(h), parseInt(m), 0, 0);
      form.value.fecha = d;
    }
  } catch (err) {
    console.error("Slots load error:", err);
    freeSlots.value = [];
  }
}

// Update free slots when dialog opens or date changes
watch(
  () => [show.value, form.value.fecha, durationMinutes.value],
  async ([visible]) => {
    if (visible && form.value.fecha) await refreshFreeSlots();
  },
  { immediate: true },
);

import { nextTick } from "vue"; // make sure this is imported

function selectSlot(slotRange) {
  const [start] = String(slotRange).split(" - ");
  if (!start) return;
  const [h, m] = start.split(":").map(Number);

  const newDate = new Date(form.value.fecha);
  newDate.setHours(h, m, 0, 0);

  // 🔥 Force Vue to replace the object and trigger watchers downstream
  form.value.fecha = new Date(newDate.getTime());

  // 🔥 PrimeVue DatePicker sometimes caches — nudge it slightly next tick
  nextTick(() => {
    form.value.fecha = new Date(newDate.getTime());
  });
}

// ─────────────────────────────────────────────
// Save logic (unchanged except imports)
// ─────────────────────────────────────────────
const save = async () => {
  if (!canSave.value) return;
  loading.value = true;
  try {
    const datePart = `${form.value.fecha.getFullYear()}-${String(
      form.value.fecha.getMonth() + 1,
    ).padStart(2, "0")}-${String(form.value.fecha.getDate()).padStart(2, "0")}`;
    const timePart = `${String(form.value.fecha.getHours()).padStart(
      2,
      "0",
    )}:${String(form.value.fecha.getMinutes()).padStart(2, "0")}`;
    const apptDateStr = buildClinicDateTime(datePart, timePart);

    if (activeTab.value === "existing") {
      await AppointmentService.create({
        paciente_id: selectedPatient.value?.id,
        fecha: apptDateStr,
        duracion: durationMinutes.value * 60,
      });
      toast.add({
        severity: "success",
        summary: "¡Éxito!",
        detail: "La cita ha sido creada correctamente",
        life: 3000,
      });
    } else {
      const birth = newPatientForm.value.fecha_nacimiento;
      const birthStr = `${birth.getFullYear()}-${String(
        birth.getMonth() + 1,
      ).padStart(2, "0")}-${String(birth.getDate()).padStart(2, "0")}`;
      await AppointmentService.createWithNewPatient({
        patient_data: {
          nombre: newPatientForm.value.nombre,
          telefono: newPatientForm.value.telefono,
          fecha_nacimiento: birthStr,
          sexo: newPatientForm.value.sexo,
        },
        appointment_data: {
          fecha: apptDateStr,
          duracion: durationMinutes.value * 60,
        },
      });
      toast.add({
        severity: "success",
        summary: "¡Éxito!",
        detail: "El paciente y la cita han sido creados correctamente",
        life: 3000,
      });
    }
    emit("created");
    resetForm();
    show.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(err),
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  selectedPatient.value = null;
  durationMinutes.value = 30;
  newPatientForm.value = {
    nombre: "",
    telefono: "",
    fecha_nacimiento: null,
    sexo: null,
  };
  activeTab.value = "existing";
};

const handleClose = () => {
  resetForm();
  emit("update:visible", false);
};
</script>

<style scoped>
/* 1️⃣ Make TabPanels consistent height */
:deep(.p-tabpanels) {
  min-height: 26rem; /* 👈 adjust this until both look perfect */
}

/* 2️⃣ Prevent scroll clipping or jump */
:deep(.p-tabview-panel) {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
}

/* 3️⃣ Ensure dialog body doesn't collapse on tab change */
:deep(.p-dialog-content) {
  min-height: 36rem; /* keeps outer dialog stable */
}
</style>
