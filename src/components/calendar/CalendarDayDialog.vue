<template>
  <Dialog v-model:visible="visible" modal :header="headerLabel" :style="{ width: '34rem' }">
    <div class="flex flex-column gap-3">
      <div v-if="appointments.length === 0" class="text-color-secondary">No hay citas para este día.</div>

      <div v-for="a in appointments" :key="a.id" class="p-2 border-round-md surface-100">
        <div class="flex justify-content-between">
          <div>
            <div class="font-medium">{{ a.patient }}</div>
            <div class="text-sm text-color-secondary">{{ a.doctor }}</div>
          </div>
          <div class="text-sm text-color-secondary">{{ a.start }} - {{ a.end }}</div>
        </div>
      </div>

      <hr />

      <div class="text-sm font-semibold">Crear nueva cita</div>
      <div class="flex flex-column gap-2">
        <InputText v-model="form.patient" placeholder="Paciente" />
        <InputText v-model="form.doctor" placeholder="Doctor" />
        <div class="flex gap-2">
          <InputText v-model="form.start" placeholder="Inicio (HH:MM)" class="w-6rem" />
          <InputText v-model="form.end" placeholder="Fin (HH:MM)" class="w-6rem" />
        </div>
        <Button label="Añadir" icon="pi pi-plus" @click="add" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { selectedDate, dayDialogVisible } from "@/composables/useCalendarState";
import { useAppointments } from "@/composables/useAppointments";

const { listForDate, addAppointment } = useAppointments();

const visible = computed({
  get: () => dayDialogVisible.value,
  set: (v) => (dayDialogVisible.value = v),
});

const headerLabel = computed(() => {
  if (!selectedDate.value) return "Día";
  const d = new Date(selectedDate.value);
  return d.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
});

const appointments = computed(() => {
  if (!selectedDate.value) return [];
  return listForDate(selectedDate.value);
});

const form = ref({ patient: "", doctor: "", start: "09:00", end: "09:30" });

function add() {
  if (!selectedDate.value) return;
  addAppointment({ date: selectedDate.value, start: form.value.start, end: form.value.end, patient: form.value.patient || "Paciente", doctor: form.value.doctor || "Doctor", status: "Pendiente" });
  // reset
  form.value = { patient: "", doctor: "", start: "09:00", end: "09:30" };
}
</script>

<style scoped>
.w-6rem { width: 6rem; }
</style>
