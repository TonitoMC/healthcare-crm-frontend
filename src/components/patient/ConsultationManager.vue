<template>
  <Card
    class="flex flex-column flex-1 overflow-hidden mb-4"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
      content: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
    }"
  >
    <template #title>Consultas</template>
    <template #content>
      <!-- New Consultation Form -->
      <div class="mb-4 p-3 border-1 border-round surface-border">
        <h4 class="text-lg p-0 font-semibold mb-3">Nueva Consulta</h4>
        <div class="flex gap-2">
          <InputText
            v-model="newMotivo"
            placeholder="Motivo de consulta"
            class="flex-1"
          />
          <Button
            label="Crear"
            icon="pi pi-plus"
            @click="createNewConsultation"
          />
        </div>
      </div>

      <!-- Consultation List -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <DataTable
          :value="consultations"
          :rows="5"
          paginator
          scrollable
          scrollHeight="flex"
          @row-click="openDetail"
          selectionMode="single"
          class="cursor-pointer flex-1"
        >
          <Column field="fecha" header="Fecha">
            <template #body="{ data }">{{ formatDate(data.fecha) }}</template>
          </Column>
          <Column field="motivo" header="Motivo" />
          <Column field="tratamientos" header="Tratamientos">
            <template #body="{ data }">
              <span class="text-color-secondary italic">
                {{
                  data.diagnostics
                    ?.flatMap((d) => d.treatments?.map((t) => t.Nombre))
                    .join(", ") || "—"
                }}
              </span>
            </template>
          </Column>
          <Column field="diagnosticos" header="Diagnósticos">
            <template #body="{ data }">
              <span class="text-color-secondary italic">
                {{ data.diagnostics?.map((d) => d.nombre).join(", ") || "—" }}
              </span>
            </template>
          </Column>
          <Column field="completada" header="Estado">
            <template #body="{ data }">
              <Tag
                :severity="data.completada ? 'success' : 'warning'"
                :value="data.completada ? 'Completada' : 'Pendiente'"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </Card>

  <!-- Consultation Detail Dialog -->
  <Dialog
    v-model:visible="showDetailDialog"
    header="Detalle de Consulta"
    :modal="true"
    style="width: 600px"
  >
    <div v-if="currentConsultation" class="flex flex-column gap-3">
      <div>
        <label class="font-semibold">Motivo:</label>
        <p>{{ currentConsultation.motivo }}</p>
      </div>
      <div>
        <label class="font-semibold">Fecha:</label>
        <p>{{ formatDate(currentConsultation.fecha) }}</p>
      </div>
      <div>
        <label class="font-semibold">Estado:</label>
        <Tag
          :severity="currentConsultation.completada ? 'success' : 'warning'"
          :value="currentConsultation.completada ? 'Completada' : 'Pendiente'"
        />
      </div>

      <!-- 🩹 Placeholder: Tratamientos -->
      <div>
        <label class="font-semibold">Tratamientos:</label>
        <p class="text-color-secondary italic">
          {{ currentConsultation.tratamientos || "No especificado" }}
        </p>
      </div>

      <!-- 🧠 Placeholder: Diagnósticos -->
      <div>
        <label class="font-semibold">Diagnósticos:</label>
        <p class="text-color-secondary italic">
          {{ currentConsultation.diagnosticos || "No especificado" }}
        </p>
      </div>

      <div
        v-if="!currentConsultation.completada"
        class="flex gap-2 justify-content-end"
      >
        <Button
          label="Marcar como Completada"
          icon="pi pi-check"
          @click="markAsComplete"
          severity="success"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import { useConsultationManager } from "../../composables/useConsultationManager";

const props = defineProps({
  patientId: { type: Number, required: true },
  consultations: { type: Array, default: () => [] },
});

const {
  consultations: managedConsultations,
  currentConsultation,
  loadConsultations,
  createConsultation,
  markComplete,
} = useConsultationManager();

const showDetailDialog = ref(false);
const newMotivo = ref("");

async function createNewConsultation() {
  if (!newMotivo.value.trim()) return;
  await createConsultation({
    paciente_id: props.patientId,
    motivo: newMotivo.value,
  });
  newMotivo.value = "";
}

function openDetail(event) {
  currentConsultation.value = event.data;
  showDetailDialog.value = true;
}

function formatDate(ddmmyyyy) {
  if (!ddmmyyyy) return "—";
  const [day, month, year] = ddmmyyyy.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString();
}

async function markAsComplete() {
  await markComplete(currentConsultation.value.id, props.patientId);
  showDetailDialog.value = false;
}

loadConsultations(props.patientId);
</script>

<style scoped>
.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
}

:deep(h4) {
  padding: 0 !important;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
