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

<style scoped>
/* ─────────────────────────────
   1️⃣ General input alignment baseline
   ───────────────────────────── */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-select-label),
:deep(.p-datepicker-input) {
  padding: 0.75rem 1rem !important; /* same inner padding for all */
  font-size: 0.95rem !important;
  line-height: 1.4 !important;
  box-sizing: border-box;
  height: 3rem; /* consistent field height */
}

/* ─────────────────────────────
   2️⃣ InputNumber fixes (keep your version)
   ───────────────────────────── */
:deep(.p-inputnumber) {
  width: 100%;
  display: flex;
  align-items: stretch;
  box-sizing: border-box;
}

:deep(.p-inputnumber-button) {
  flex: 0 0 auto;
}

:deep(.p-inputnumber-input) {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

/* ─────────────────────────────
   3️⃣ Select height / alignment
   ───────────────────────────── */
:deep(.p-select) {
  width: 100%;
}

:deep(.p-select-label) {
  display: flex;
  align-items: center;
  height: 3rem !important;
}

/* ─────────────────────────────
   4️⃣ DatePicker alignment
   ───────────────────────────── */
:deep(.p-datepicker) {
  width: 100%;
}

:deep(.p-datepicker-input) {
  height: 3rem !important;
  display: flex;
  align-items: center;
}

/* ─────────────────────────────
   5️⃣ Placeholder sizing (like your other form)
   ───────────────────────────── */
:deep(input::placeholder),
:deep(.p-inputnumber-input::placeholder),
:deep(.p-datepicker-input::placeholder) {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

/* ─────────────────────────────
   6️⃣ Cosmetic consistency tweaks
   ───────────────────────────── */
label i {
  width: 1.25rem; /* prevents icon width shifts */
  text-align: center;
}

/* Keep your previous alignment fixes here... then add these */

/* ─────────────────────────────
   DatePicker full-width normalization
   ───────────────────────────── */
:deep(.p-datepicker),
:deep(.p-datepicker input),
:deep(.p-datepicker-input) {
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box;
}

/* Fix height consistency for both simple and showTime variants */
:deep(.p-datepicker input),
:deep(.p-datepicker-input) {
  height: 3rem !important; /* match InputText + Select + InputNumber */
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
  line-height: 1.4 !important;
  display: flex;
  align-items: center;
}

/* Ensure the internal flex wrapper doesn’t shrink (this causes the short input look) */
:deep(.p-inputwrapper) {
  width: 100% !important;
  flex: 1 1 auto !important;
  display: flex;
}

/* Optional – tiny polish for inner calendar icon spacing */
:deep(.p-datepicker .p-inputtext) {
  padding-right: 2.5rem !important;
}
</style>
