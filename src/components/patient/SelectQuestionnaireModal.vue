<template>
  <Dialog
    v-model:visible="visible"
    header="Seleccionar Cuestionario"
    modal
    :style="{ width: '32rem' }"
  >
    <div class="flex flex-column gap-4">
      <!-- MOTIVO -->
      <div>
        <label class="font-semibold text-sm mb-1 block"
          >Motivo de consulta</label
        >
        <InputText
          v-model="motivoLocal"
          placeholder="Motivo..."
          class="w-full"
          @input="emitMotivo"
        />
      </div>

      <!-- QUESTIONNAIRE DROPDOWN -->
      <div>
        <label class="font-semibold text-sm mb-1 block"
          >Seleccione un cuestionario</label
        >
        <Dropdown
          v-model="selected"
          :options="names"
          placeholder="Seleccione un cuestionario"
          class="w-full"
        />
      </div>

      <!-- ACTIONS -->
      <div class="flex justify-content-end gap-2 mt-2">
        <Button label="Cancelar" text @click="close" />
        <Button
          label="Continuar"
          icon="pi pi-arrow-right"
          :disabled="!selected"
          @click="loadAndContinue"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { QuestionnaireService } from "@/services/questionnaireService";

const props = defineProps({
  visible: Boolean,
  motivo: String,
});

const emit = defineEmits(["update:visible", "update:motivo", "selected"]);

const visible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
});

// Motivo
const motivoLocal = ref(props.motivo || "");

watch(
  () => props.motivo,
  (val) => (motivoLocal.value = val || ""),
);

function emitMotivo() {
  emit("update:motivo", motivoLocal.value);
}

// Names = ["Consulta", "Control", ...]
const names = ref([]);
const selected = ref(null);

async function loadNames() {
  try {
    names.value = await QuestionnaireService.getNames();
  } catch (err) {
    console.error("Error loading names:", err);
  }
}

watch(visible, (v) => v && loadNames());

async function loadAndContinue() {
  // selected = "Consulta"
  const active = await QuestionnaireService.getActiveByName(selected.value);
  emit("selected", active);
  visible.value = false;
}

function close() {
  visible.value = false;
}
</script>
