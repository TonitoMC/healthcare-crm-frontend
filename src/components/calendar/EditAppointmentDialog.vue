<template>
  <Dialog
    v-model:visible="show"
    modal
    :style="{ width: '64rem', maxWidth: '95vw' }"
    @hide="handleClose"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      content: { class: 'px-6 py-0' },
    }"
  >
    <!-- Header -->
    <template #header>
      <div
        class="flex align-items-center gap-3 w-full px-2 py-1 surface-card mb-1"
      >
        <i class="pi pi-calendar-edit text-primary text-3xl"></i>
        <div class="flex flex-column">
          <h2 class="m-0 text-xl font-semibold text-color">Editar Cita</h2>
          <span class="text-sm text-color-secondary mt-1">
            Actualice la información de la cita seleccionada
          </span>
        </div>
      </div>
    </template>

    <!-- Content -->
    <div class="pb-5 flex flex-column md:flex-row align-items-start min-h-full">
      <!-- Left Column -->
      <div class="flex flex-column flex-1 min-w-0 gap-4 pr-0 md:pr-3">
        <!-- Patient Summary -->
        <div
          v-if="patient"
          class="surface-card border-round-lg shadow-1 border-1 surface-border p-4 flex flex-row align-items-center gap-3"
        >
          <div
            class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle flex-shrink-0"
            style="width: 3rem; height: 3rem"
          >
            <i class="pi pi-user text-xl"></i>
          </div>

          <div class="flex flex-column flex-1 min-w-0 text-left">
            <div
              class="font-semibold text-lg text-color mb-1 md:overflow-hidden md:text-overflow-ellipsis md:whitespace-nowrap"
            >
              {{ patient.nombre || "Paciente desconocido" }}
            </div>

            <div class="flex flex-column gap-1 text-color-secondary text-sm">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-phone text-sm"></i>
                <span>{{ patient.telefono || "Sin teléfono" }}</span>
              </div>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-calendar text-sm"></i>
                <span>
                  {{
                    patient.fecha_nacimiento
                      ? new Date(patient.fecha_nacimiento).toLocaleDateString()
                      : "Sin fecha de nacimiento"
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="flex-1">
          <div class="grid" style="row-gap: 1.25rem">
            <!-- Fecha y Hora combinadas -->
            <div class="col-12 md:col-6 p-0">
              <div class="px-2">
                <label class="block mb-2 font-medium text-color">
                  <i class="pi pi-calendar mr-2 text-primary"></i>
                  Fecha y hora
                </label>
                <DatePicker
                  v-model="editDate"
                  showIcon
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
                  class="w-full"
                  placeholder="Seleccione fecha y hora"
                  :pt="{ input: { class: 'w-full p-3' } }"
                />
              </div>
            </div>

            <!-- Duración -->
            <div class="col-12 md:col-6 p-0">
              <div class="px-2">
                <label class="block mb-2 font-medium text-color">
                  <i class="pi pi-hourglass mr-2 text-primary"></i>
                  Duración (minutos)
                </label>
                <InputNumber
                  v-model="editDuration"
                  :min="5"
                  :max="180"
                  :step="5"
                  showButtons
                  buttonLayout="horizontal"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  class="w-full"
                  suffix=" min"
                  placeholder="30"
                  :pt="{ input: { class: 'w-full p-3' } }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Separator -->
      <div
        class="hidden md:block border-left-1 surface-border mx-3"
        style="align-self: stretch"
      ></div>

      <!-- Right Column -->
      <aside
        class="md:w-20rem w-full flex flex-column gap-3 flex-shrink-0 h-full"
      >
        <div class="flex align-items-center gap-2">
          <i class="pi pi-clock text-primary text-lg"></i>
          <span class="font-semibold text-color text-base">
            Horarios disponibles
          </span>
        </div>

        <Panel
          class="w-full shadow-1 border-round-lg overflow-hidden flex-1"
          :pt="{
            header: {
              class: 'bg-surface-100 text-color font-medium text-sm px-3 py-2',
            },
            content: {
              class: 'p-0 bg-surface-section flex-1 flex flex-column',
            },
          }"
        >
          <ScrollPanel
            class="w-full flex-1"
            style="max-height: 100%"
            :pt="{
              bar: { class: 'bg-primary-200' },
              handle: { class: 'bg-primary-400 border-round-sm' },
            }"
          >
            <div v-if="freeSlots.length" class="flex flex-column gap-2 p-2">
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

    <!-- Footer -->
    <template #footer>
      <div
        class="flex justify-content-between align-items-center w-full gap-3 px-3 py-2 border-top-1 surface-border"
      >
        <Button
          label="Cerrar"
          icon="pi pi-times"
          text
          severity="secondary"
          class="px-3 py-2 text-sm"
          @click="handleClose"
        />
        <div class="flex gap-2">
          <Button
            label="Guardar Cambios"
            icon="pi pi-check"
            :loading="savingEdit"
            @click="saveEdit"
            severity="success"
            class="px-4 py-2 text-sm font-medium"
          />
          <Button
            label="Cancelar Cita"
            icon="pi pi-trash"
            severity="danger"
            outlined
            :loading="savingCancel"
            @click="cancelAppt"
            class="px-4 py-2 text-sm font-medium"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, nextTick, computed } from "vue";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import Panel from "primevue/panel";
import ScrollPanel from "primevue/scrollpanel";
import InputNumber from "primevue/inputnumber";
import { useToast } from "primevue/usetoast";

import { AppointmentService } from "@/services/appointmentService";
import { ScheduleService } from "@/services/scheduleService";
import { PatientService } from "@/services/patientService";
import { getErrorMessage } from "@/utils/errorMessages";
import { buildClinicDateTime, clinicDateString } from "@/utils/time";

const props = defineProps({
  visible: Boolean,
  appointment: Object,
});
const emit = defineEmits(["update:visible", "updated", "cancelled"]);
const toast = useToast();

const show = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const editDate = ref(new Date());
const editDuration = ref(30);
const savingEdit = ref(false);
const savingCancel = ref(false);
const freeSlots = ref([]);
const patient = ref(null);

/* Fetch patient info */
async function loadPatientInfo() {
  const id =
    props.appointment?.paciente_id ||
    props.appointment?.patientId ||
    props.appointment?.pacienteId;

  if (!id) {
    patient.value = { nombre: "Paciente desconocido", telefono: "" };
    return;
  }

  try {
    const data = await PatientService.getPatient(id);
    patient.value = data;
  } catch (err) {
    console.error("Error fetching patient:", err);
    patient.value = { nombre: "Error al cargar", telefono: "" };
  }
}

watch(
  [() => props.appointment, show],
  async ([appt, visible]) => {
    if (visible && appt) {
      await loadPatientInfo();
      editDate.value = appt.rfc3339 ? new Date(appt.rfc3339) : new Date();
      editDuration.value =
        Math.floor(appt.duracion / 60) ||
        Math.floor(appt.endMinutes - appt.startMinutes || 30);
    }
  },
  { immediate: true },
);

/* Free slots logic */
const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(
    mins % 60,
  ).padStart(2, "0")}`;
const extractHHMM = (rfc3339) =>
  typeof rfc3339 === "string" && rfc3339.length >= 16
    ? rfc3339.slice(11, 16)
    : null;

function computeFreeSlots(businessRanges, dayAppointments, minGap = 15) {
  if (!Array.isArray(businessRanges) || businessRanges.length === 0) return [];
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
    const rs = extractHHMM(r.start);
    const re = extractHHMM(r.end);
    if (!rs || !re) return;
    const rangeStart = toMinutes(rs);
    const rangeEnd = toMinutes(re);
    let cursor = rangeStart;
    for (const appt of booked) {
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
    const dateStr = clinicDateString(editDate.value);
    const [schedule, appts] = await Promise.all([
      ScheduleService.getEffectiveDay(dateStr),
      AppointmentService.getByDate(dateStr),
    ]);
    const ranges = Array.isArray(schedule?.ranges) ? schedule.ranges : [];
    freeSlots.value = computeFreeSlots(ranges, appts, 15);
  } catch (err) {
    console.error("Slots load error:", err);
    freeSlots.value = [];
  }
}

function selectSlot(slotRange) {
  const [start] = String(slotRange).split(" - ");
  if (!start) return;
  const current = new Date(editDate.value);
  const [h, m] = start.split(":").map(Number);
  current.setHours(h, m, 0, 0);
  editDate.value = new Date(current);
}

watch([editDate, show], async ([date, visible]) => {
  if (visible && date) await refreshFreeSlots();
});

/* Save / Cancel */
const saveEdit = async () => {
  savingEdit.value = true;
  try {
    const dateISO = editDate.value.toISOString();
    await AppointmentService.update(props.appointment.id, {
      fecha: dateISO,
      duracion: editDuration.value * 60,
    });

    toast.add({
      severity: "success",
      summary: "¡Éxito!",
      detail: "La cita ha sido actualizada correctamente",
      life: 3000,
    });
    emit("updated");
    show.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(err),
      life: 5000,
    });
  } finally {
    savingEdit.value = false;
  }
};

const cancelAppt = async () => {
  savingCancel.value = true;
  try {
    await AppointmentService.delete(props.appointment.id);
    toast.add({
      severity: "warn",
      summary: "Cita cancelada",
      detail: "La cita fue eliminada correctamente",
      life: 3000,
    });
    emit("cancelled");
    show.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(err),
      life: 5000,
    });
  } finally {
    savingCancel.value = false;
  }
};

const handleClose = () => {
  show.value = false;
  patient.value = null;
};
</script>

<style scoped>
:deep(.p-dialog-content) {
  min-height: 36rem;
}

/* Sidebar height & form alignment */
aside {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

aside .p-panel {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

aside .p-scrollpanel {
  flex: 1 1 auto;
}

/* Normalize DatePicker & InputNumber */
:deep(.p-datepicker) {
  width: 100%;
}
:deep(.p-datepicker .p-inputtext) {
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  box-sizing: border-box;
}
:deep(.p-datepicker .p-input-icon-right .pi-calendar) {
  right: 0.75rem !important;
  color: var(--text-color-secondary);
  font-size: 1rem;
}
:deep(.p-inputnumber) {
  width: 100%;
  display: flex;
  align-items: stretch;
  box-sizing: border-box;
}
:deep(.p-inputnumber-input) {
  flex: 1 1 auto;
  width: 100%;
  padding: 0.75rem 1rem !important;
  box-sizing: border-box;
}
:deep(.p-inputnumber-button) {
  flex: 0 0 auto;
}
</style>
