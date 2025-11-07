<template>
  <Card
    class="flex flex-column flex-1 overflow-hidden mb-4"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
      content: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
    }"
  >
    <template #title>Exámenes</template>

    <template #content>
      <!-- New Exam Form -->
      <div class="mb-4 p-3 border-1 border-round surface-border">
        <h4 class="text-lg p-0 font-semibold mb-3">Nuevo Examen</h4>
        <div class="flex gap-2">
          <InputText
            v-model="newExamTipo"
            placeholder="Tipo de examen"
            class="flex-1"
          />
          <Button label="Crear" icon="pi pi-plus" @click="createExam" />
        </div>
      </div>

      <!-- Exams List -->
      <DataTable
        :value="exams"
        :rows="10"
        paginator
        responsiveLayout="scroll"
        class="cursor-pointer"
      >
        <Column field="fecha" header="Fecha">
          <template #body="{ data }">
            {{
              data.fecha
                ? new Date(data.fecha).toLocaleDateString()
                : "Sin fecha"
            }}
          </template>
        </Column>
        <Column field="tipo" header="Tipo" />

        <Column header="Acciones">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                v-if="data.estado === 'PENDIENTE'"
                icon="pi pi-upload"
                text
                size="small"
                @click="openUploadDialog(data)"
              />

              <Button
                v-else
                icon="pi pi-file-pdf"
                size="small"
                text
                @click="viewPdf(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <!-- Upload Dialog -->
  <Dialog
    v-model:visible="showUploadDialog"
    header="Subir PDF"
    :modal="true"
    style="width: 400px"
  >
    <div class="flex flex-column gap-3">
      <FileUpload
        mode="basic"
        accept="application/pdf"
        :maxFileSize="10000000"
        @select="handleFileSelect"
      />
      <Button label="Subir" :disabled="!selectedFile" @click="uploadFile" />
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
import FileUpload from "primevue/fileupload";
import Tag from "primevue/tag";
import { useExamHandler } from "../../composables/useExamHandler";

/**
 * Props
 * - exams: Provided by PatientDetailView (already loaded from usePatientData)
 * - patientId: Used when creating or uploading exams
 */
const props = defineProps({
  patientId: { type: Number, required: true },
  exams: { type: Array, required: true },
});

const {
  createExam: createExamService,
  uploadPdf,
  loadExams,
} = useExamHandler();

const showUploadDialog = ref(false);
const newExamTipo = ref("");
const selectedFile = ref(null);
const currentExam = ref(null);

async function createExam() {
  if (!newExamTipo.value.trim()) return;
  await createExamService({
    paciente_id: props.patientId,
    tipo: newExamTipo.value,
  });
  await loadExams(props.patientId);
  newExamTipo.value = "";
}

function openUploadDialog(exam) {
  currentExam.value = exam;
  showUploadDialog.value = true;
}

function handleFileSelect(event) {
  selectedFile.value = event.files[0];
}

async function uploadFile() {
  if (!selectedFile.value || !currentExam.value) return;
  try {
    await uploadPdf(currentExam.value.id, selectedFile.value);
    await loadExams(props.patientId);
    showUploadDialog.value = false;
    selectedFile.value = null;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

async function viewPdf(exam) {
  try {
    const savedAuth = localStorage.getItem("jwt");
    if (!savedAuth) return console.error("No authentication token found");
    const { token } = JSON.parse(savedAuth);

    const response = await fetch(
      `http://localhost:8080/api/exams/${exam.id}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) throw new Error("Failed to download PDF");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("Error viewing PDF:", error);
  }
}
</script>

<style scoped>
:deep(h4) {
  padding: 0 !important;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
}
</style>
