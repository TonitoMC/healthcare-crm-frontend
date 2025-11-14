<template>
  <div class="flex flex-column h-full w-full min-h-0">
    <!-- Header -->
    <div class="flex align-items-center gap-2 mt-2 mb-1">
      <h3 class="m-0 text-base font-semibold line-height-1">Antecedentes</h3>
      <Button
        icon="pi pi-pencil"
        text
        rounded
        size="small"
        class="p-0"
        @click="showModal = true"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-sm text-color-secondary shrink-0">
      <i class="pi pi-spin pi-spinner mr-2"></i>Cargando...
    </div>

    <!-- No data -->
    <div
      v-else-if="!hasAnyData"
      class="text-sm text-color-secondary italic shrink-0"
    >
      Sin antecedentes registrados
    </div>

    <!-- Data -->
    <div
      v-else
      class="flex flex-wrap justify-content-between align-content-start text-sm flex-1 min-h-0 overflow-auto w-full"
      style="row-gap: 0.5rem; column-gap: 1rem"
    >
      <div v-if="record.medicos" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Médicos: </span>
        <span>{{ record.medicos }}</span>
      </div>

      <div v-if="record.familiares" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Familiares: </span>
        <span>{{ record.familiares }}</span>
      </div>

      <div v-if="record.oculares" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Oculares: </span>
        <span>{{ record.oculares }}</span>
      </div>

      <div v-if="record.alergicos" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Alérgicos: </span>
        <span>{{ record.alergicos }}</span>
      </div>

      <div v-if="record.otros" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Otros: </span>
        <span>{{ record.otros }}</span>
      </div>
    </div>
  </div>

  <!-- ====================== MODAL ====================== -->
  <Dialog
    v-model:visible="showModal"
    header="Editar Antecedentes"
    modal
    :style="{ width: '550px', maxWidth: '95vw' }"
  >
    <div class="flex flex-column gap-3">
      <!-- MÉDICOS -->
      <div>
        <label class="block mb-2 text-sm">Médicos</label>
        <Textarea
          v-model="form.medicos"
          class="w-full text-sm"
          rows="2"
          autoResize
        />
      </div>

      <!-- FAMILIARES -->
      <div>
        <label class="block mb-2 text-sm">Familiares</label>
        <Textarea
          v-model="form.familiares"
          class="w-full text-sm"
          rows="2"
          autoResize
        />
      </div>

      <!-- OCULARES -->
      <div>
        <label class="block mb-2 text-sm">Oculares</label>
        <Textarea
          v-model="form.oculares"
          class="w-full text-sm"
          rows="2"
          autoResize
        />
      </div>

      <!-- ALÉRGICOS -->
      <div>
        <label class="block mb-2 text-sm">Alérgicos</label>
        <Textarea
          v-model="form.alergicos"
          class="w-full text-sm"
          rows="2"
          autoResize
        />
      </div>

      <!-- OTROS -->
      <div>
        <label class="block mb-2 text-sm">Otros</label>
        <Textarea
          v-model="form.otros"
          class="w-full text-sm"
          rows="2"
          autoResize
        />
      </div>

      <!-- ACTION BUTTONS -->
      <div class="flex justify-content-end gap-2 mt-3">
        <Button
          label="Cancelar"
          text
          severity="secondary"
          class="text-sm"
          @click="showModal = false"
        />

        <Button
          label="Guardar"
          class="text-sm"
          severity="success"
          :disabled="!isValid"
          @click="save"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";
import { MedicalRecordService } from "@/services/medicalRecordService.js";

const props = defineProps({
  record: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },

  patientId: { type: Number, required: true },
});

const emit = defineEmits(["saved"]);

const showModal = ref(false);

const form = ref({
  medicos: "",
  familiares: "",
  oculares: "",
  alergicos: "",
  otros: "",
});

// Populate modal when opened
watch(
  () => showModal.value,
  (v) => {
    if (v) form.value = { ...props.record };
  },
);

// For showing/hiding card content
const hasAnyData = computed(() => {
  const r = props.record || {};
  const filled = (v) => typeof v === "number" || (v && String(v).trim() !== "");
  return (
    filled(r.medicos) ||
    filled(r.familiares) ||
    filled(r.oculares) ||
    filled(r.alergicos) ||
    filled(r.otros)
  );
});

// Validation
const isValid = computed(() => {
  const f = form.value;
  return (
    f.medicos?.trim() &&
    f.familiares?.trim() &&
    f.oculares?.trim() &&
    f.alergicos?.trim() &&
    f.otros?.trim()
  );
});

// Save record
async function save() {
  try {
    await MedicalRecordService.update(props.patientId, form.value);
    emit("saved"); // parent reloads data
    showModal.value = false;
  } catch (e) {
    console.error("Error saving antecedentes:", e);
  }
}
</script>

<style scoped>
.line-height-1 {
  line-height: 1;
}
</style>
