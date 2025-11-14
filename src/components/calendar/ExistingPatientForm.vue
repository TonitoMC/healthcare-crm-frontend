<template>
  <div class="p-0">
    <div class="grid" style="row-gap: 1rem">
      <!-- Label de sección -->
      <div class="col-12 p-1.5">
        <div class="px-2">
          <label class="block font-medium text-color">
            <i class="pi pi-search mr-2 text-primary"></i>
            Buscar Paciente
          </label>
        </div>
      </div>

      <!-- Primera fila: buscador + empty -->
      <template v-if="!hasPatient">
        <!-- Buscador -->
        <div class="col-12 lg:col-6 p-0">
          <div class="px-2">
            <AutoComplete
              v-model="localPatient"
              :suggestions="filteredPatients"
              @complete="searchPatient"
              optionLabel="nombre"
              placeholder="Escriba al menos 2 caracteres"
              :minLength="2"
              class="w-full"
              :pt="{
                pcInputText: {
                  root: 'w-full p-2 border-round-lg text-sm',
                },
              }"
            >
              <!-- ⬇️ OPTION TEMPLATE -->
              <template #option="{ option }">
                <div
                  class="flex align-items-center gap-2 p-1 w-full"
                  style="min-height: 38px"
                >
                  <div
                    class="flex align-items-center justify-content-center bg-primary border-circle text-primary-contrast"
                    style="width: 1.7rem; height: 1.7rem"
                  >
                    <i class="pi pi-user text-xs"></i>
                  </div>

                  <div class="flex flex-column line-height-2">
                    <span class="font-semibold text-sm">
                      {{ option.nombre }}
                    </span>

                    <small class="text-color-secondary text-xs">
                      {{ option.telefono || "Sin teléfono" }} •
                      {{ formatDate(option.fecha_nacimiento) }}
                    </small>
                  </div>
                </div>
              </template>
            </AutoComplete>
          </div>
        </div>

        <!-- Empty -->
        <div class="col-12 lg:col-6 p-0">
          <div class="px-2">
            <div
              class="text-center surface-section border-round-lg border-1 border-dashed surface-border flex flex-column align-items-center justify-content-center h-full"
              style="min-height: 10rem"
            >
              <i class="pi pi-search text-3xl text-color-secondary mb-2"></i>
              <p class="text-color-secondary m-0 text-sm">
                Seleccione un paciente para continuar
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Tarjeta del paciente seleccionado (reemplaza toda la fila) -->
      <div v-else class="col-12 p-0">
        <div class="px-2">
          <div
            class="surface-card p-4 border-round-lg border-1 surface-border shadow-1 w-full flex align-items-center"
            style="min-height: 10rem; box-sizing: border-box"
          >
            <div
              class="w-full flex gap-3 flex-wrap md:flex-nowrap align-items-center"
            >
              <!-- Avatar -->
              <div
                class="hidden md:flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle flex-shrink-0"
                style="width: 3rem; height: 3rem"
              >
                <i class="pi pi-user text-xl"></i>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div
                  class="font-semibold text-xl text-color mb-1 line-height-3 md:overflow-hidden md:text-overflow-ellipsis md:whitespace-nowrap"
                >
                  {{ localPatient.nombre }}
                </div>

                <!-- PHONE -->
                <div class="flex align-items-center gap-2 text-color-secondary">
                  <i class="pi pi-phone text-sm"></i>
                  <span
                    class="text-sm"
                    style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{ localPatient.telefono || "Sin teléfono" }}
                  </span>
                </div>

                <!-- DOB + AGE -->
                <div
                  class="flex align-items-center gap-2 text-color-secondary mt-1"
                >
                  <i class="pi pi-calendar text-sm"></i>
                  <span class="text-sm">
                    {{ formatDate(localPatient.fecha_nacimiento) }}
                    <span v-if="localPatient.edad">
                      · {{ localPatient.edad }} años</span
                    >
                  </span>
                </div>
              </div>

              <!-- Change button -->
              <div
                class="flex align-items-center justify-content-end w-full md:w-auto mt-2 md:mt-0 md:ml-auto flex-shrink-0"
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

      <!-- FECHA -->
      <div class="col-12 lg:col-6 p-0 mt-2">
        <div class="px-2">
          <label class="block mb-2 font-medium text-color">
            <i class="pi pi-calendar mr-2 text-primary"></i>
            Fecha y Hora
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

      <!-- DURACIÓN (restored) -->
      <div class="col-12 lg:col-6 p-0 mt-2">
        <div class="px-2">
          <label class="block mb-2 font-medium text-color">
            <i class="pi pi-clock mr-2 text-primary"></i>
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
          />
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

// COMPUTEDS
const localPatient = computed({
  get: () => props.patient,
  set: (val) => emit("update:patient", val),
});

const hasPatient = computed(
  () => localPatient.value && typeof localPatient.value === "object",
);

const localDate = computed({
  get: () => props.date,
  set: (val) => emit("update:date", val),
});

const localDuration = computed({
  get: () => props.duration,
  set: (val) => emit("update:duration", val),
});

// FORMAT DOB
function formatDate(dateStr) {
  if (!dateStr) return "Fecha desconocida";
  try {
    return new Date(dateStr).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// DURATION — EXACT original logic
watch(
  () => props.duration,
  (newVal, oldVal) => {
    if (newVal !== oldVal && newVal != null) {
      const rounded = Math.round(newVal / 5) * 5;
      const clamped = Math.max(5, Math.min(180, rounded));
      if (clamped !== newVal) emit("update:duration", clamped);
    }
  },
);

const handleDurationBlur = () => {
  const val = localDuration.value;
  if (val != null) {
    const rounded = Math.round(val / 5) * 5;
    const clamped = Math.max(5, Math.min(180, rounded));
    if (clamped !== val) localDuration.value = clamped;
  }
};

// SEARCH — limit to 5
const filteredPatients = ref([]);

const searchPatient = async (event) => {
  const query = event.query?.trim();
  if (!query || query.length < 2) {
    filteredPatients.value = [];
    return;
  }

  try {
    const results = await PatientService.searchByName(query);
    filteredPatients.value = Array.isArray(results) ? results.slice(0, 5) : [];
  } catch (err) {
    filteredPatients.value = [];
  }
};

const clearPatient = () => emit("update:patient", null);
</script>

<style scoped>
/* 🔥 EXACT WORKING STYLES restored */
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

:deep(.p-autocomplete-input::placeholder) {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}
</style>
