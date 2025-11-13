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
      <!-- 🔹 Quick New Exam Bar -->
      <div class="mb-4 p-3 border-1 border-round surface-border">
        <h4 class="text-lg p-0 font-semibold mb-3">Nuevo Examen</h4>
        <div class="flex gap-2">
          <InputText
            v-model="newExamTipo"
            placeholder="Tipo de examen"
            class="flex-1"
          />
          <Button
            label="Crear"
            icon="pi pi-plus"
            @click="openNewExamDialog"
            :disabled="!newExamTipo.trim()"
          />
        </div>
      </div>

      <!-- 📋 Exams List -->
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
                  ? new Date(data.fecha).toLocaleDateString("es-GT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Sin fecha"
              }}
            </template>
          </Column>

          <Column field="tipo" header="Tipo" />

          <Column header="Acciones">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <!-- 📂 Exam file actions -->
                <template v-if="data.s3_key">
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
                </template>

                <template v-else>
                  <Button
                    label="Subir PDF"
                    icon="pi pi-upload"
                    text
                    size="small"
                    class="text-primary"
                    @click="openUploadDialog(data)"
                  />
                </template>

                <!-- ❌ Cancel/Delete action -->
                <Button
                  label="Eliminar"
                  icon="pi pi-times"
                  text
                  size="small"
                  class="text-red-500"
                  severity="danger"
                  @click="openCancelDialog(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </Card>

  <!-- 🟡 Upload Dialog -->
  <Dialog
    v-model:visible="showUploadDialog"
    header="Subir PDF"
    modal
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

  <!-- ✅ Confirm New Exam Modal -->
  <Dialog
    v-model:visible="showNewExamDialog"
    modal
    :style="{ width: '32rem', maxWidth: '90vw' }"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      content: { class: 'px-5 py-0' },
    }"
  >
    <template #header>
      <div
        class="flex align-items-center gap-2 w-full px-3 py-2 surface-card border-bottom-1 surface-border"
      >
        <div class="flex flex-column">
          <h2 class="m-0 text-lg font-semibold text-color">
            Confirmar Nuevo Examen
          </h2>
          <span class="text-sm text-color-secondary mt-1">
            Revise los datos antes de confirmar la creación del examen
          </span>
        </div>
      </div>
    </template>

    <div class="pt-0 pb-4 flex flex-column gap-4">
      <div
        class="surface-card border-round-lg shadow-1 border-1 surface-border p-4 flex flex-column gap-3"
      >
        <div class="flex align-items-center gap-2">
          <i class="pi pi-user text-primary"></i>
          <span class="font-medium text-color">
            {{ props.patientName || "Paciente desconocido" }}
          </span>
        </div>

        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
          <i class="pi pi-calendar"></i>
          <span>{{ today }}</span>
        </div>

        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
          <i class="pi pi-clipboard"></i>
          <InputText
            v-model="newExamTipo"
            placeholder="Tipo de examen"
            class="flex-1"
          />
        </div>
      </div>

      <Message severity="warn" icon="pi pi-exclamation-triangle" class="w-full">
        Confirme la creación de este nuevo examen.
      </Message>
    </div>

    <template #footer>
      <div
        class="flex justify-content-end align-items-center w-full gap-2 px-3 py-2 border-top-1 surface-border"
      >
        <Button
          label="Cerrar"
          icon="pi pi-times"
          text
          severity="secondary"
          class="px-3 py-2 text-sm"
          @click="showNewExamDialog = false"
          :disabled="creatingExam"
        />
        <Button
          label="Confirmar Examen"
          icon="pi pi-check"
          severity="primary"
          outlined
          :loading="creatingExam"
          class="px-4 py-2 text-sm font-medium hover:bg-primary-50"
          @click="createExam"
        />
      </div>
    </template>
  </Dialog>

  <!-- 🗑️ Cancel/Delete Exam Dialog -->
  <Dialog
    v-model:visible="showCancelDialog"
    modal
    :style="{ width: '32rem', maxWidth: '90vw' }"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      content: { class: 'px-5 py-0' },
    }"
  >
    <template #header>
      <div
        class="flex align-items-center gap-2 w-full px-3 py-2 surface-card border-bottom-1 surface-border"
      >
        <div class="flex flex-column">
          <h2 class="m-0 text-lg font-semibold text-color">Eliminar Examen</h2>
          <span class="text-sm text-color-secondary mt-1">
            Confirme la eliminacion del examen seleccionado
          </span>
        </div>
      </div>
    </template>

    <!-- Content -->
    <div class="pt-0 pb-4 flex flex-column gap-4">
      <div
        class="surface-card border-round-lg shadow-1 border-1 surface-border p-4 flex flex-column gap-3"
      >
        <div class="flex align-items-center gap-2">
          <i class="pi pi-user text-primary"></i>
          <span class="font-medium text-color">
            {{ cancelTarget?.patientName || props.patientName }}
          </span>
        </div>

        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
          <i class="pi pi-calendar"></i>
          <span>{{
            cancelTarget?.fecha
              ? new Date(cancelTarget.fecha).toLocaleDateString("es-GT", {
                  dateStyle: "long",
                })
              : "Sin fecha"
          }}</span>
        </div>

        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
          <i class="pi pi-clipboard"></i>
          <span>{{ cancelTarget?.tipo || "Sin tipo" }}</span>
        </div>
      </div>

      <Message severity="warn" icon="pi pi-exclamation-triangle" class="w-full">
        Esta acción no se puede deshacer.
      </Message>
    </div>

    <!-- Footer -->
    <template #footer>
      <div
        class="flex justify-content-end align-items-center w-full gap-2 px-3 py-2 border-top-1 surface-border"
      >
        <Button
          label="Cerrar"
          icon="pi pi-times"
          text
          severity="secondary"
          class="px-3 py-2 text-sm"
          @click="showCancelDialog = false"
          :disabled="deleting"
        />
        <Button
          label="Eliminar Examen"
          icon="pi pi-trash"
          severity="danger"
          outlined
          :loading="deleting"
          class="px-4 py-2 text-sm font-medium hover:bg-red-50"
          @click="confirmCancelExam"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import FileUpload from "primevue/fileupload";
import Message from "primevue/message";
import { ExamService } from "@/services/examService";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  patientId: { type: Number, required: true },
  exams: { type: Array, required: true },
  patientName: { type: String, default: "Paciente" },
});

const showUploadDialog = ref(false);
const showNewExamDialog = ref(false);
const showCancelDialog = ref(false);

const creatingExam = ref(false);
const deleting = ref(false);
const cancelTarget = ref(null);

const newExamTipo = ref("");
const selectedFile = ref(null);
const currentExam = ref(null);
const exams = ref([...props.exams]);
const toast = useToast();

const today = computed(() => {
  const d = new Date();
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

function openNewExamDialog() {
  if (!newExamTipo.value.trim()) return;
  showNewExamDialog.value = true;
}

function openCancelDialog(exam) {
  cancelTarget.value = exam;
  showCancelDialog.value = true;
}

async function confirmCancelExam() {
  if (!cancelTarget.value) return;
  deleting.value = true;
  try {
    await ExamService.delete(cancelTarget.value.id);
    toast.add({
      severity: "warn",
      summary: "Examen cancelado",
      detail: "El examen fue eliminado correctamente.",
      life: 3000,
    });
    await loadExams();
    showCancelDialog.value = false;
  } catch (error) {
    console.error("Error canceling exam:", error);
    toast.add({
      severity: "error",
      summary: "Error al cancelar",
      detail: "No se pudo cancelar el examen.",
      life: 3000,
    });
  } finally {
    deleting.value = false;
  }
}

async function createExam() {
  if (!newExamTipo.value.trim()) {
    toast.add({
      severity: "warn",
      summary: "Campo vacío",
      detail: "Debe ingresar un tipo de examen antes de confirmar.",
      life: 2500,
    });
    return;
  }

  try {
    creatingExam.value = true;
    await ExamService.create({
      paciente_id: props.patientId,
      tipo: newExamTipo.value.trim(),
    });
    await loadExams();
    toast.add({
      severity: "success",
      summary: "Examen creado",
      detail: `Nuevo examen para ${props.patientName} creado correctamente.`,
      life: 3000,
    });
    newExamTipo.value = "";
    showNewExamDialog.value = false;
  } catch (error) {
    console.error("Error creating exam:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo crear el examen",
      life: 3000,
    });
  } finally {
    creatingExam.value = false;
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
