<template>
  <div class="p-2">
    <!-- Grid 2x3: Fila 1 (Nombre | Teléfono) + Fila 2 (Fecha Nac. | Sexo) + Fila 3 (Fecha/Hora | Duración) -->
    <div class="grid" style="row-gap: 1rem">
      <!-- Fila 1, Col 1: Nombre -->
      <div class="col-12 lg:col-6 p-0">
        <div class="px-2">
          <label class="block mb-2 font-medium text-color">
            <i class="pi pi-user mr-2 text-primary"></i>
            Nombre Completo
            <span class="text-red-500 ml-1">*</span>
          </label>
          <InputText
            v-model="localForm.nombre"
            placeholder="Ej: Juan Pérez González"
            class="w-full"
            :pt="{ root: { class: 'w-full p-3' } }"
          />
        </div>
      </div>

      <!-- Fila 1, Col 2: Teléfono -->
      <div class="col-12 lg:col-6 p-0">
        <div class="px-2">
          <label class="block mb-2 font-medium text-color">
            <i class="pi pi-phone mr-2 text-primary"></i>
            Teléfono
            <span class="text-red-500 ml-1">*</span>
          </label>
          <InputText
            v-model="localForm.telefono"
            placeholder="8888-8888"
            class="w-full"
            :pt="{ root: { class: 'w-full p-3' } }"
          />
        </div>
      </div>

      <!-- Fila 2, Col 1: Fecha de Nacimiento -->
      <div class="col-12 lg:col-6 p-0 mt-2">
        <div class="px-2">
          <label class="block mb-2 font-medium text-color">
            <i class="pi pi-calendar mr-2 text-primary"></i>
            Fecha de Nacimiento
            <span class="text-red-500 ml-1">*</span>
          </label>
          <DatePicker
            v-model="localForm.fecha_nacimiento"
            dateFormat="dd/mm/yy"
            placeholder="dd/mm/aaaa"
            class="w-full"
            :pt="{ input: { class: 'w-full p-3' } }"
          />
        </div>
      </div>

      <!-- Fila 2, Col 2: Sexo -->
      <div class="col-12 lg:col-6 p-0 mt-2">
        <div class="px-2">
          <label class="block mb-2 font-medium text-color">
            <i class="pi pi-venus-mars mr-2 text-primary"></i>
            Sexo
            <span class="text-red-500 ml-1">*</span>
          </label>
          <Select
            v-model="localForm.sexo"
            :options="sexOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar"
            class="w-full"
            :pt="{
              root: { class: 'w-full' },
              input: { class: 'p-3' },
            }"
          />
        </div>
      </div>

      <!-- Fila 3, Col 1: Fecha y Hora de la cita -->
      <div class="col-12 lg:col-6 p-0 mt-3">
        <div class="px-2">
          <label class="block mb-2 font-medium text-color">
            <i class="pi pi-calendar mr-2 text-green-600"></i>
            Fecha y Hora de la Cita
          </label>
          <DatePicker
            v-model="localDate"
            showTime
            hourFormat="24"
            dateFormat="dd/mm/yy"
            class="w-full"
            placeholder="Seleccione fecha y hora"
            :pt="{ input: { class: 'w-full p-3' } }"
          />
          <small class="text-color-secondary mt-1 block">
            <i class="pi pi-info-circle mr-1"></i>
            Horarios: L-V 9:00-13:00 y 15:00-18:00 | Sáb 9:00-13:00
          </small>
        </div>
      </div>

      <!-- Fila 3, Col 2: Duración -->
      <div class="col-12 lg:col-6 p-0 mt-3">
        <div class="px-2">
          <label class="block mb-2 font-medium text-color">
            <i class="pi pi-clock mr-2 text-green-600"></i>
            Duración (minutos)
          </label>
          <InputNumber
            v-model="localDuration"
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
            @blur="handleDurationBlur"
            :pt="{ input: { class: 'w-full p-3' } }"
          />
          <small class="text-color-secondary mt-1 block"
            >Intervalos de 5 minutos</small
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  form: Object,
  date: Date,
  duration: Number,
});

const emit = defineEmits(["update:form", "update:date", "update:duration"]);
const toast = useToast();

const sexOptions = [
  { label: "Masculino", value: "M" },
  { label: "Femenino", value: "F" },
];

const localForm = computed({
  get: () => props.form,
  set: (val) => emit("update:form", val),
});

const localDate = computed({
  get: () => props.date,
  set: (val) => emit("update:date", val),
});

const localDuration = computed({
  get: () => props.duration,
  set: (val) => emit("update:duration", val),
});

// Watch para redondear inmediatamente cuando cambie el valor
watch(
  () => props.duration,
  (newVal, oldVal) => {
    if (newVal !== null && newVal !== undefined && newVal !== oldVal) {
      const rounded = Math.round(newVal / 5) * 5;
      const clamped = Math.max(5, Math.min(180, rounded));

      if (clamped !== newVal) {
        emit("update:duration", clamped);
        toast.add({
          severity: "info",
          summary: "Duración ajustada",
          detail: `Ajustado a ${clamped} minutos (intervalos de 5)`,
          life: 3000,
        });
      }
    }
  },
);

const handleDurationBlur = () => {
  const val = localDuration.value;
  if (val !== null && val !== undefined) {
    const rounded = Math.round(val / 5) * 5;
    const clamped = Math.max(5, Math.min(180, rounded));

    if (clamped !== val) {
      localDuration.value = clamped;
      toast.add({
        severity: "info",
        summary: "Duración ajustada",
        detail: `Ajustado a ${clamped} minutos (intervalos de 5)`,
        life: 3000,
      });
    }
  }
};
</script>
