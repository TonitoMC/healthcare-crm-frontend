<template>
  <Dialog
    :visible="internalVisible"
    @update:visible="onVisibleChange"
    modal
    :style="{ width: '60rem', maxWidth: '95vw' }"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      content: { class: 'p-0' },
      footer: {
        class:
          'flex justify-content-between align-items-center p-3 surface-ground',
      },
    }"
  >
    <!-- HEADER -->
    <template #header>
      <span class="text-2xl font-semibold text-primary">
        Detalles de Consulta
      </span>
    </template>

    <!-- MAIN CONTENT -->
    <div
      v-if="consultation"
      class="p-5 flex flex-column gap-3 overflow-y-auto"
      style="max-height: 75vh"
    >
      <!-- MOTIVO & FECHA -->
      <div
        class="flex justify-content-between flex-wrap gap-3 align-items-start"
      >
        <div class="flex flex-column gap-1">
          <span class="font-semibold text-color-secondary">Motivo</span>
          <span class="text-lg">{{ consultation.motivo }}</span>
        </div>

        <div class="flex flex-column gap-1">
          <span class="font-semibold text-color-secondary">Fecha</span>
          <span class="text-lg">{{ formatDate(consultation.fecha) }}</span>
        </div>
      </div>

      <Divider class="mt-2 mb-3" />

      <!-- DIAGNÓSTICOS + TRATAMIENTOS -->
      <div class="flex flex-column gap-3">
        <h3 class="m-0 text-xl font-semibold">Diagnósticos & Tratamientos</h3>

        <!-- EACH DIAGNOSTIC -->
        <div
          v-for="diag in consultation.diagnostics || []"
          :key="diag.id"
          class="border-1 surface-border border-round p-3 shadow-1"
        >
          <h4 class="text-lg font-semibold mt-0 mb-2 text-primary">
            {{ diag.nombre }}
          </h4>

          <!-- ONE-LINE TREATMENTS -->
          <div
            v-for="t in diag.treatments || []"
            :key="t.id"
            class="text-sm mb-2"
          >
            {{ t.Nombre || "—" }} – {{ t.ComponenteActivo || "—" }} –
            {{ t.Presentacion || "—" }} – {{ t.Dosificacion || "—" }} por
            {{ t.Tiempo || "—" }}
            {{ t.Frecuencia?.toLowerCase() || "—" }}
          </div>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-else class="p-4">
      <Skeleton height="1.5rem" class="mb-3" />
      <Skeleton height="1.5rem" width="70%" class="mb-4" />
      <Skeleton height="8rem" />
    </div>

    <!-- FOOTER -->
    <template #footer>
      <Button
        label="Eliminar"
        icon="pi pi-trash"
        severity="danger"
        class="p-button-sm"
        @click="deleteConsultation"
      />

      <Button
        label="Ver Cuestionario"
        icon="pi pi-file"
        class="p-button-sm"
        @click="emit('view-questionnaire', consultation.id)"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import Divider from "primevue/divider";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import { ConsultationService } from "@/services/consultationService";

const props = defineProps({
  visible: Boolean,
  consultation: Object,
});

const emit = defineEmits(["update:visible", "view-questionnaire"]);

// internal v-model mirror
const internalVisible = ref(props.visible);

watch(
  () => props.visible,
  (v) => (internalVisible.value = v),
);

function onVisibleChange(v) {
  internalVisible.value = v;
  emit("update:visible", v);
}

async function deleteConsultation() {
  if (!props.consultation?.id) return;

  try {
    await ConsultationService.delete(props.consultation.id);
    internalVisible.value = false; // CLOSE INTERNALLY
    emit("update:visible", false); // TELL PARENT TO CLOSE
  } catch (err) {
    console.error("Error deleting consultation:", err);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";

  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
      d.getUTCMonth() + 1,
    ).padStart(2, "0")}/${d.getUTCFullYear()}`;
  }

  if (dateStr.includes("-")) {
    const [d, m, y] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  return dateStr;
}
</script>
