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

  <!-- Modal Editar Cita -->
  <Dialog
    v-model:visible="showEditor"
    modal
    header="Editar Cita"
    :style="{ width: '30rem', maxWidth: '95vw' }"
  >
    <div class="flex flex-column gap-3">
      <div>
        <label class="text-sm font-medium">Fecha</label>
        <DatePicker v-model="editDate" dateFormat="dd/mm/yy" showIcon class="w-full" />
      </div>
      <div>
        <label class="text-sm font-medium">Hora</label>
        <input type="time" v-model="editTime" class="p-inputtext w-full" />
      </div>
      <div>
        <label class="text-sm font-medium">Duración (min)</label>
        <input type="number" min="5" step="5" v-model.number="editDuration" class="p-inputtext w-full" />
      </div>
      <div class="flex justify-content-end gap-2 mt-3">
        <Button label="Cancelar" text severity="secondary" @click="closeEdit" />
        <Button label="Guardar" icon="pi pi-check" :loading="savingEdit" @click="saveEdit" />
        <Button label="Cancelar Cita" severity="danger" icon="pi pi-trash" :loading="savingEdit" @click="cancelAppt" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import WeekHeader from "@/components/calendar/WeekHeader.vue";
import DayColumn from "@/components/calendar/DayColumn.vue";
import AppointmentCreator from "@/components/calendar/AppointmentCreator.vue";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import { ScheduleService } from "@/services/scheduleService.js";
import { AppointmentService } from "@/services/appointmentService.js";
import { clinicDateString, hhmmToMinutes, minutesToHHMM, buildClinicDateTime } from "@/utils/time.js";
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
const weekAppointments = ref([]); // Citas de la semana
const showCreator = ref(false);
const selectedDate = ref(null);
const selectedTime = ref(null);

// Estado para editar citas
const showEditor = ref(false);
const editingAppt = ref(null);
const editTime = ref("00:00");
const editDuration = ref(30);
const editDate = ref(new Date());
const savingEdit = ref(false);

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

// Cargar citas de la semana
async function loadAppointments() {
  const start = clinicDateString(weekDays.value[0]);
  const end = clinicDateString(weekDays.value[6]);
  console.log(`[WeekView] Loading appointments from ${start} to ${end}`);
  try {
    // Cargar citas para cada día de la semana
    const promises = weekDays.value.map(day =>
      AppointmentService.getByDate(clinicDateString(day))
    );
    const results = await Promise.all(promises);
    weekAppointments.value = results.flat();
    console.log(`[WeekView] Loaded ${weekAppointments.value.length} appointments:`, weekAppointments.value);
  } catch (err) {
    console.error("[WeekView] Failed to fetch appointments:", err);
    weekAppointments.value = [];
  }
}

// Cargar horarios y citas
async function loadAll() {
  await Promise.all([loadSchedules(), loadAppointments()]);
}

// Fetch schedule range from API
onMounted(loadAll);

// 🔁 Re-fetch whenever currentDate changes
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

// Helpers for time manipulation
const toMinutes = hhmmToMinutes;
const toHHMM = minutesToHHMM;

// Helper para extraer hora de una fecha ISO
const extractTime = (isoDatetime) => {
  if (!isoDatetime || typeof isoDatetime !== "string") return null;
  return isoDatetime.length >= 16 ? isoDatetime.slice(11, 16) : null;
};

/**
 * Builds slots (free + appointment) for each day.
 * Uses effective working ranges from backend and real appointments.
 */

function getSlotsFor(day) {
  const dateStr = clinicDateString(day);
  const schedule = effectiveSchedules.value.find(
    (s) => s.date.slice(0, 10) === dateStr,
  );

  if (!schedule || !schedule.active || !schedule.ranges?.length) {
    return [{
      type: "workingRange",
      label: "Sin horario",
      slots: [{ type: "free", time: "Libre", centered: true }]
    }];
  }

  const ranges = schedule.ranges.map((r) => ({
    start: r.start.slice(11, 16),
    end: r.end.slice(11, 16),
  }));

  // Filtrar y normalizar citas del día
  const dayAppts = weekAppointments.value
    .filter((a) => {
      if (!a || !a.fecha) return false;
      // fecha es un ISO datetime, extraemos la parte de fecha
      const apptDate = a.fecha.slice(0, 10);
      return apptDate === dateStr;
    })
    .map((a) => {
      const start = extractTime(a.fecha);
      if (!start) {
        console.warn('Could not extract time from appointment:', a);
        return null;
      }
      // duracion está en segundos, convertir a minutos
      const durationMin = Math.round((a.duracion || 1800) / 60);
      const startMin = toMinutes(start);
      const endMin = startMin + durationMin;
      return {
        start,
        end: toHHMM(endMin),
        patient: a.nombre_paciente || a.nombre || 'Paciente',
        id: a.id,
        rfc3339: a.fecha,
      };
    })
    .filter(Boolean) // Remover nulos
    .sort((a, b) => a.start.localeCompare(b.start));

  const rangeGroups = [];
  const GAP_MINUTES = 5; // Gap mínimo entre citas

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
        id: appt.id,
        start: toHHMM(effectiveStart),
        end: toHHMM(effectiveEnd),
        rfc3339: appt.rfc3339,
      });

      // Agregar el gap de 5 minutos después de la cita
      const endWithGap = effectiveEnd + GAP_MINUTES;
      prevEnd = toHHMM(endWithGap);
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
    return [{
      type: "workingRange",
      label: "Sin horario",
      slots: [{ type: "free", time: "Libre", centered: true }]
    }];
  }

  return rangeGroups;
}

// Handler para clicks en slots
function handleSlotClick(day, slot) {
  console.log('🟣 [WeekView] Slot clicked:', { day, slot }); // Debug
  
  // Si es una cita, abrir modal de edición
  if (slot.type === 'appointment') {
    console.log('🟣 [WeekView] Opening edit modal for appointment');
    openEditModal(slot, day);
    return;
  }
  
  // Si no es slot libre, ignorar
  if (slot.type !== 'free') {
    console.log('🟣 [WeekView] Not a free slot, ignoring');
    return;
  }
  
  // Extraer hora de inicio del slot
  let timeStr;
  if (slot.time === 'Libre' || slot.centered) {
    // Si es un slot "Libre" sin rango específico, usar hora de inicio del día laboral (9:00)
    timeStr = '09:00';
  } else {
    // Extraer hora de inicio (ej: "09:00 - 13:00" → "09:00")
    const parts = slot.time.split(' - ');
    timeStr = parts[0] || '09:00';
  }
  
  console.log('🟣 [WeekView] Opening creator with:', { date: day, time: timeStr }); // Debug
  
  // Asegurar que la fecha seleccionada mantiene la semántica de día clínico
  selectedDate.value = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  selectedTime.value = timeStr;
  showCreator.value = true;
  
  console.log('🟣 [WeekView] Modal state:', { 
    showCreator: showCreator.value, 
    selectedDate: selectedDate.value, 
    selectedTime: selectedTime.value 
  });
}

// Handler cuando se crea una cita
async function handleAppointmentCreated() {
  showCreator.value = false;
  await loadAll(); // Recargar horarios y citas para reflejar la nueva cita
}

// ─────────────────────────────────────────────
// Funciones para editar citas
// ─────────────────────────────────────────────

function openEditModal(slot, day) {
  console.log("🟢 [WeekView] openEditModal called with:", { slot, day });
  
  if (!slot || !slot.id) {
    console.error("openEditModal: slot is invalid", slot);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la cita', life: 3000 });
    return;
  }
  
  editingAppt.value = slot;
  
  // Extraer hora de inicio del slot (ej: "09:00 - 10:00" → "09:00")
  const startTime = slot.time.split(' - ')[0] || slot.start || "00:00";
  editTime.value = startTime;
  
  // Calcular duración
  const timeParts = slot.time.split(' - ');
  if (timeParts.length === 2) {
    const startMins = toMinutes(timeParts[0]);
    const endMins = toMinutes(timeParts[1]);
    const diffMins = endMins - startMins;
    editDuration.value = diffMins > 0 ? diffMins : 30;
  } else {
    editDuration.value = 30;
  }
  
  // Usar la fecha del día seleccionado o la fecha RFC3339 de la cita
  editDate.value = slot.rfc3339 ? new Date(slot.rfc3339) : new Date(day.getFullYear(), day.getMonth(), day.getDate());
  
  showEditor.value = true;
  console.log("🟢 [WeekView] showEditor set to:", showEditor.value);
  console.log("🟢 Edit data:", { editTime: editTime.value, editDuration: editDuration.value, editDate: editDate.value });
}

function closeEdit() {
  showEditor.value = false;
  editingAppt.value = null;
}

async function saveEdit() {
  if (!editingAppt.value) return;
  savingEdit.value = true;
  try {
    const datePart = clinicDateString(editDate.value);
    const apptDateStr = buildClinicDateTime(datePart, editTime.value);
    const durationSeconds = editDuration.value * 60;
    
    await AppointmentService.update(editingAppt.value.id, {
      fecha: apptDateStr,
      duracion: durationSeconds,
    });
    
    await loadAll(); // Recargar citas
    toast.add({ severity: 'success', summary: 'Cita actualizada', life: 2000 });
    closeEdit();
  } catch (e) {
    console.error("Error updating appointment", e);
    const errorMsg = getErrorMessage(e);
    toast.add({ 
      severity: 'error', 
      summary: 'Error al actualizar la cita', 
      detail: errorMsg, 
      life: 5000 
    });
  } finally {
    savingEdit.value = false;
  }
}

async function cancelAppt() {
  if (!editingAppt.value) return;
  const confirmDelete = window.confirm("¿Eliminar esta cita?");
  if (!confirmDelete) return;
  
  savingEdit.value = true;
  try {
    await AppointmentService.delete(editingAppt.value.id);
    await loadAll(); // Recargar citas
    toast.add({ severity: 'success', summary: 'Cita eliminada', life: 2000 });
    closeEdit();
  } catch (e) {
    console.error('Error deleting appointment', e);
    const errorMsg = getErrorMessage(e);
    toast.add({ 
      severity: 'error', 
      summary: 'Error al eliminar la cita', 
      detail: errorMsg, 
      life: 5000 
    });
  } finally {
    savingEdit.value = false;
  }
}
</script>
