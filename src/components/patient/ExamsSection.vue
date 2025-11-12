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
      <div class="flex-1 min-h-0 overflow-hidden">
        <DataTable
          :value="exams"
          :rows="10"
          paginator
          scrollable
          scrollHeight="flex"
          responsiveLayout="scroll"
          class="cursor-pointer flex-1"
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
              <div class="flex align-items-center gap-2">
                <!-- Upload if pending -->
                <Button
                  v-if="data.estado === 'PENDIENTE'"
                  label="Subir PDF"
                  icon="pi pi-upload"
                  text
                  size="small"
                  class="text-primary"
                  @click="openUploadDialog(data)"
                />

                <!-- Open & download if file exists -->
                <div v-else class="flex gap-2">
                  <Button
                    label="Abrir"
                    icon="pi pi-external-link"
                    text
                    size="small"
                    class="text-primary"
                    @click="viewPdf(data)"
                  />
                  <Button
                    icon="pi pi-download"
                    text
                    size="small"
                    class="text-primary"
                    @click="downloadPdf(data)"
                  />
                </div>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
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
import { ExamService } from "@/services/examService";

const props = defineProps({
  patientId: { type: Number, required: true },
  exams: { type: Array, required: true },
});

const showUploadDialog = ref(false);
const newExamTipo = ref("");
const selectedFile = ref(null);
const currentExam = ref(null);
const exams = ref([...props.exams]);

async function createExam() {
  if (!newExamTipo.value.trim()) return;
  try {
    await ExamService.create({
      paciente_id: props.patientId,
      tipo: newExamTipo.value,
    });
    await loadExams();
    newExamTipo.value = "";
  } catch (error) {
    console.error("Error creating exam:", error);
  }
}

async function loadExams() {
  try {
    const data = await ExamService.getByPatient(props.patientId);
    exams.value = data;
  } catch (error) {
    console.error("Error loading exams:", error);
  }
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
    await ExamService.uploadPdf(currentExam.value.id, selectedFile.value);
    await loadExams();
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

    const response = await fetch(ExamService.getDownloadUrl(exam.id), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to download PDF");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const tab = window.open("", "_blank");
    tab.document.title = exam.tipo || "Examen";
    const safeName = (exam.tipo || `examen-${exam.id}`)
      .replace(/\s+/g, "_")
      .replace(/[^\w_-]/g, "");

    tab.document.body.innerHTML = `
      <embed src="${url}" type="application/pdf" width="100%" height="100%">
    `;
    tab.history.replaceState({}, safeName, `${safeName}.pdf`);
    setTimeout(() => window.URL.revokeObjectURL(url), 15000);
  } catch (error) {
    console.error("Error viewing PDF:", error);
  }
}

async function downloadPdf(exam) {
  try {
    const savedAuth = localStorage.getItem("jwt");
    if (!savedAuth) return console.error("No authentication token found");
    const { token } = JSON.parse(savedAuth);

    const response = await fetch(ExamService.getDownloadUrl(exam.id), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to download PDF");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const safeName = (exam.tipo || `examen-${exam.id}`)
      .replace(/\s+/g, "_")
      .replace(/[^\w_-]/g, "");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}.pdf`;
    link.click();

    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  } catch (error) {
    console.error("Error downloading PDF:", error);
  }
}
</script>

<style scoped>
.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
}

:deep(.p-datatable-wrapper) {
  flex: 1;
  min-height: 0;
}

:deep(.p-paginator-bottom) {
  margin-top: auto;
}

:deep(h4) {
  padding: 0 !important;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
