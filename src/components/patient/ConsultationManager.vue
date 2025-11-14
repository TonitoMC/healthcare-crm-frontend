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
      <!-- NEW CONSULTATION FORM -->
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
            @click="beginConsultationFlow"
          />
        </div>
      </div>

      <!-- CONSULTATION LIST -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <DataTable
          :value="consultations"
          paginator
          :rows="4"
          scrollable
          scrollHeight="flex"
          selectionMode="single"
          @row-click="openDetail"
          class="cursor-pointer flex-1"
        >
          <Column field="fecha" header="Fecha">
            <template #body="{ data }">{{ formatDate(data.fecha) }}</template>
          </Column>

          <Column field="motivo" header="Motivo" />

          <Column header="Tratamientos">
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

          <Column header="Diagnósticos">
            <template #body="{ data }">
              <span class="text-color-secondary italic">
                {{ data.diagnostics?.map((d) => d.nombre).join(", ") || "—" }}
              </span>
            </template>
          </Column>

          <Column header="Estado">
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

  <!-- CONSULTATION DETAIL -->
  <Dialog
    v-model:visible="showDetailDialog"
    header="Detalle de Consulta"
    modal
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

      <div
        v-if="!currentConsultation.completada"
        class="flex justify-content-end"
      >
        <Button
          label="Marcar como Completada"
          icon="pi pi-check"
          severity="success"
          @click="markAsComplete"
        />
      </div>
    </div>
  </Dialog>

  <!-- SELECT QUESTIONNAIRE (with motivo text inside) -->
  <SelectQuestionnaireModal
    v-model:visible="showSelectModal"
    :motivo="newMotivo"
    @update:motivo="newMotivo = $event"
    @selected="onQuestionnaireChosen"
  />

  <!-- ANSWERS MODAL -->
  <QuestionnaireAnswersModal
    v-if="selectedQuestionnaire"
    v-model:visible="showAnswerModal"
    :questionnaire="selectedQuestionnaire"
    @save="saveAnswers"
  />
</template>

<script setup>
import { ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import Tag from "primevue/tag";
import InputText from "primevue/inputtext";

import SelectQuestionnaireModal from "@/components/patient/SelectQuestionnaireModal.vue";
import QuestionnaireAnswersModal from "@/components/patient/QuestionnaireAnswersModal.vue";

import { ConsultationService } from "@/services/consultationService";
import { useConsultationManager } from "../../composables/useConsultationManager";

const props = defineProps({
  patientId: Number,
  consultations: Array,
});

const {
  consultations: managedConsultations,
  currentConsultation,
  loadConsultations,
  createConsultation,
  markComplete,
} = useConsultationManager();

const newMotivo = ref("");
const showDetailDialog = ref(false);

// Questionnaire flow
const showSelectModal = ref(false);
const showAnswerModal = ref(false);
const selectedQuestionnaire = ref(null);
const pendingConsultationId = ref(null);

/* STEP 1 — Open select questionnaire modal */
function beginConsultationFlow() {
  if (!newMotivo.value.trim()) return;
  showSelectModal.value = true;
}

/* STEP 2 — User selected questionnaire */
async function onQuestionnaireChosen(questionnaire) {
  selectedQuestionnaire.value = questionnaire;

  // Create consultation with selected questionnaire
  const { id } = await ConsultationService.create({
    paciente_id: props.patientId,
    motivo: newMotivo.value,
    cuestionario_id: questionnaire.id,
  });

  pendingConsultationId.value = id;

  // Open answers modal
  showAnswerModal.value = true;

  // clear motive field
  newMotivo.value = "";
}

/* STEP 3 — Save answers */
async function saveAnswers(answersJson) {
  await ConsultationService.addAnswers(
    pendingConsultationId.value,
    answersJson,
  );

  await loadConsultations(props.patientId);

  showAnswerModal.value = false;
  selectedQuestionnaire.value = null;
}

/* LIST / DETAILS */
function openDetail(event) {
  currentConsultation.value = event.data;
  showDetailDialog.value = true;
}

function formatDate(ddmmyyyy) {
  if (!ddmmyyyy) return "—";
  const [d, m, y] = ddmmyyyy.split("-");
  return new Date(y, m - 1, d).toLocaleDateString();
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
</style>
