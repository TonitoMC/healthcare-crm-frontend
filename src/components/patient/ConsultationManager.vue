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
  <ConsultationDetailModal
    v-model:visible="showDetailDialog"
    :consultation="currentConsultation"
    @show-form="openForm"
    @view-questionnaire="openQuestionnaire"
  />

  <!-- STEP 1: SELECT QUESTIONNAIRE -->
  <SelectQuestionnaireModal
    v-model:visible="showSelectModal"
    :motivo="newMotivo"
    @update:motivo="newMotivo = $event"
    @selected="onQuestionnaireChosen"
  />

  <!-- STEP 2: ANSWERS MODAL -->
  <QuestionnaireAnswersModal
    v-if="selectedQuestionnaire"
    v-model:visible="showAnswerModal"
    :questionnaire="selectedQuestionnaire"
    @save="saveAnswers"
  />

  <!-- ⭐ STEP 3: DIAGNOSTICS MODAL (ADDED) -->
  <ConsultationDiagnosticsModal
    v-model:visible="showDiagnosticsModal"
    :consultationId="pendingConsultationId"
    @saved="onDiagnosticsSaved"
  />

  <QuestionnaireAnswersModalRO
    v-model:visible="showQModal"
    :questionnaire="selectedQuestionnaire"
    :answers="loadedAnswers"
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

import ConsultationDetailModal from "@/components/patient/ConsultationDetailModal.vue";
import SelectQuestionnaireModal from "@/components/patient/SelectQuestionnaireModal.vue";
import QuestionnaireAnswersModal from "@/components/patient/QuestionnaireAnswersModal.vue";
import QuestionnaireAnswersModalRO from "@/components/patient/QuestionnaireAnswersModalRO.vue";
import { QuestionnaireService } from "@/services/questionnaireService";
import ConsultationDiagnosticsModal from "@/components/patient/ConsultationDiagnosticsModal.vue";

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

const showQModal = ref(false);
const loadedAnswers = ref(null);

async function openQuestionnaire(consultaId) {
  // 1. Load answers for this consultation
  const data = await ConsultationService.getAnswers(consultaId);
  // data = { id, consulta_id, cuestionario_id, respuestas }

  if (!data || !data.cuestionario_id) {
    console.error("No cuestionario_id found in answers:", data);
    return;
  }

  const questionnaire = await QuestionnaireService.getByID(
    data.cuestionario_id,
  );

  // IMPORTANT: QuestionnaireService.getByID produces:
  // {
  //   id, nombre, version, schema, title, questions
  // }

  // 3. Assign reactive data
  selectedQuestionnaire.value = questionnaire;
  loadedAnswers.value = data.respuestas;

  // 4. Open modal
  showQModal.value = true;
}
// ⭐ NEW FOR DIAGNOSTICS
const showDiagnosticsModal = ref(false);

// STEP 1 — Open select questionnaire modal
function beginConsultationFlow() {
  if (!newMotivo.value.trim()) return;
  showSelectModal.value = true;
}

// STEP 2 — User selected questionnaire
async function onQuestionnaireChosen(questionnaire) {
  selectedQuestionnaire.value = questionnaire;

  const { id } = await ConsultationService.create({
    paciente_id: props.patientId,
    motivo: newMotivo.value,
    cuestionario_id: questionnaire.id,
  });

  pendingConsultationId.value = id;

  showAnswerModal.value = true;
  newMotivo.value = "";
}

// ⭐ STEP 3 — Save Answers + Open Diagnostics Modal
async function saveAnswers(answersJson) {
  await ConsultationService.addAnswers(
    pendingConsultationId.value,
    answersJson,
  );

  showAnswerModal.value = false;
  selectedQuestionnaire.value = null;

  // ⭐ OPEN DIAGNOSTICS FLOW
  showDiagnosticsModal.value = true;
}

// ⭐ STEP 4 — After diagnostics saved
async function onDiagnosticsSaved() {
  showDiagnosticsModal.value = false;

  await loadConsultations(props.patientId);
}

// LIST / DETAILS
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
