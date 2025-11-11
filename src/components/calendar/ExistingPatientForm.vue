<template>
  <div class="p-2">
    <!-- Grid 2x2: Fila 1 (Buscador | Tarjeta) + Fila 2 (Fecha/Hora | Duración) -->
    <div class="grid" style="row-gap: 1rem">
      <!-- Fila 1, Col 1: Buscador -->
      <div class="col-12 lg:col-6 p-0">
        <div class="px-2">
          <label
            class="block font-medium text-900"
            :class="hasPatient ? 'mb-1' : 'mb-2'"
          >
            <i class="pi pi-search mr-2 text-primary"></i>
            Buscar Paciente
          </label>
          <template v-if="!hasPatient">
            <AutoComplete
              v-model="localPatient"
              :suggestions="filteredPatients"
              @complete="searchPatient"
              optionLabel="nombre"
              placeholder="Escriba al menos 2 caracteres para buscar..."
              :minLength="2"
              class="w-full"
              inputClass="w-full p-3"
              :pt="{
                root: { class: 'w-full', style: 'width: 100%;' },
                pcInputText: {
                  root: {
                    class: 'w-full p-3',
                    style: 'width: 100% !important; box-sizing: border-box;',
                  },
                },
              }"
            >
              <template #option="{ option }">
                <div class="flex align-items-center gap-2 p-2">
                  <i class="pi pi-user text-primary"></i>
                  <div class="flex flex-column">
                    <span class="font-semibold">{{ option.nombre }}</span>
                    <small class="text-color-secondary">{{
                      option.telefono || "Sin teléfono"
                    }}</small>
                  </div>
                </div>
              </template>
            </AutoComplete>
            <small class="text-color-secondary mt-1 block">
              Escriba el nombre del paciente para buscar en la base de datos
            </small>
          </template>
        </div>
      </div>

      <!-- Fila 1, Col 2: Empty state cuando no hay paciente -->
      <div class="col-12 lg:col-6 p-0">
        <div class="px-2">
          <div
            v-if="!hasPatient"
            class="text-center py-5 surface-section border-round-lg border-1 border-dashed border-200 h-full flex flex-column align-items-center justify-content-center"
          >
            <i class="pi pi-search text-3xl text-400 mb-2"></i>
            <p class="text-600 m-0 text-sm">
              Seleccione un paciente para continuar
            </p>
          </div>
        </div>
      </div>

      <!-- Card full-width debajo del buscador cuando hay paciente seleccionado -->
      <div v-if="hasPatient" class="col-12 p-0">
        <div class="px-2">
          <div
            class="surface-card p-4 border-round-lg border-1 border-200 shadow-1 w-full"
          >
            <div class="flex align-items-start gap-3 flex-wrap">
              <!-- Avatar: ocultar hasta md para evitar aplastamiento en anchos intermedios -->
              <div
                class="flex align-items-center justify-content-center bg-primary-100 text-primary-700 border-circle hidden md:flex"
                style="width: 3rem; height: 3rem"
              >
                <i class="pi pi-user text-xl"></i>
              </div>

              <div class="flex-1 min-w-0">
                <!-- Nombre: permite wrap hasta md, luego una sola línea -->
                <div
                  class="font-semibold text-xl text-900 mb-1 line-height-3"
                  :class="'text-wrap md:overflow-hidden md:text-overflow-ellipsis md:whitespace-nowrap'"
                  style="overflow: hidden"
                >
                  {{ localPatient.nombre }}
                </div>
                <div class="flex align-items-center gap-2 text-600">
                  <i class="pi pi-phone text-sm"></i>
                  <span
                    class="text-sm"
                    style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                    :title="localPatient.telefono || 'Sin teléfono registrado'"
                    >{{ localPatient.telefono || "Sin teléfono" }}</span
                  >
                </div>
                <div
                  v-if="localPatient.edad"
                  class="flex align-items-center gap-2 text-600 mt-1"
                >
                  <i class="pi pi-calendar text-sm"></i>
                  <span class="text-sm">{{ localPatient.edad }} años</span>
                </div>
              </div>

              <!-- Botón Cambiar: full width hasta md para evitar overflow -->
              <div
                class="ml-auto w-full md:w-auto flex align-items-center mt-2 md:mt-0"
              >
                <Button
                  size="small"
                  severity="secondary"
                  outlined
                  @click="clearPatient"
                  label="Cambiar"
                  icon="pi pi-refresh"
                  class="w-full md:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila 2, Col 1: Fecha y Hora -->
      <div class="col-12 lg:col-6 p-0 mt-2">
        <div class="px-2">
          <label class="block mb-2 font-medium text-900">
            <i class="pi pi-calendar mr-2 text-primary"></i>
            Fecha y Hora
          </label>
          <DatePicker
            v-model="localDate"
            :disabled="!hasPatient"
            showTime
            hourFormat="24"
            dateFormat="dd/mm/yy"
            class="w-full"
            placeholder="Seleccione fecha y hora"
            :pt="{
              input: { class: 'w-full p-3' },
            }"
          />
          <small class="text-color-secondary mt-1 block">
            <i class="pi pi-info-circle mr-1"></i>
            Horarios: L-V 9:00-13:00 y 15:00-18:00 | Sáb 9:00-13:00
          </small>
        </div>
      </div>

      <!-- Fila 2, Col 2: Duración -->
      <div class="col-12 lg:col-6 p-0 mt-2">
        <div class="px-2">
          <label class="block mb-2 font-medium text-900">
            <i class="pi pi-clock mr-2 text-primary"></i>
            Duración (minutos)
          </label>
          <InputNumber
            v-model="localDuration"
            :disabled="!hasPatient"
            :min="15"
            :max="180"
            :step="15"
            showButtons
            buttonLayout="horizontal"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
            class="w-full"
            suffix=" min"
            placeholder="30"
            @blur="handleDurationBlur"
            :pt="{
              input: { class: 'w-full p-3' },
            }"
          />
          <small class="text-color-secondary mt-1 block"
            >Intervalos de 15 minutos</small
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import AutoComplete from "primevue/autocomplete";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { PatientService } from "@/services/patientService";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  patient: Object,
  date: Date,
  duration: Number,
});

const emit = defineEmits(["update:patient", "update:date", "update:duration"]);
const toast = useToast();

const filteredPatients = ref([]);

const localPatient = computed({
  get: () => props.patient,
  set: (val) => emit("update:patient", val),
});

const hasPatient = computed(
  () => !!localPatient.value && typeof localPatient.value === "object",
);

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
      const rounded = Math.round(newVal / 15) * 15;
      const clamped = Math.max(15, Math.min(180, rounded));

      if (clamped !== newVal) {
        // Redondear inmediatamente
        emit("update:duration", clamped);
        toast.add({
          severity: "info",
          summary: "Duración ajustada",
          detail: `Ajustado a ${clamped} minutos (intervalos de 15)`,
          life: 3000,
        });
      }
    }
  },
);

const handleDurationBlur = () => {
  const val = localDuration.value;
  if (val !== null && val !== undefined) {
    const rounded = Math.round(val / 15) * 15;
    const clamped = Math.max(15, Math.min(180, rounded));

    if (clamped !== val) {
      localDuration.value = clamped;
      toast.add({
        severity: "info",
        summary: "Duración ajustada",
        detail: `Ajustado a ${clamped} minutos (intervalos de 15)`,
        life: 3000,
      });
    }
  }
};

const searchPatient = async (event) => {
  const query = event.query?.trim();

  if (!query || query.length < 2) {
    filteredPatients.value = [];
    return;
  }

  try {
    const results = await PatientService.searchByName(query);
    filteredPatients.value = Array.isArray(results) ? results : [];
  } catch (err) {
    console.error("Error searching patients:", err);
    filteredPatients.value = [];
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo buscar pacientes. Verifique su conexión.",
      life: 3000,
    });
  }
};

const clearPatient = () => emit("update:patient", null);
</script>
