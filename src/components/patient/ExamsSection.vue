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
                    @click="openUploadModal(data)"
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

  <!-- 🟡 Upload Exam Modal (SmallModal) -->
  <UploadExamModal
    v-model="showUploadModal"
    :exam="currentExamForUpload"
    @uploaded="handleUploaded"
  />

  <!-- 🚫 New Exam Dialog -->
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
import Message from "primevue/message";
import { ExamService } from "@/services/examService";
import { useToast } from "primevue/usetoast";

/* ⭐ NEW MODAL IMPORT */
import UploadExamModal from "@components/dashboard/UploadExamModal.vue";

const props = defineProps({
  patientId: { type: Number, required: true },
  exams: { type: Array, required: true },
  patientName: { type: String, default: "Paciente" },
});

const toast = useToast();

const exams = ref([...props.exams]);

/* Upload Modal */
const showUploadModal = ref(false);
const currentExamForUpload = ref(null);

function openUploadModal(exam) {
  currentExamForUpload.value = {
    ...exam,
    examType: exam.tipo,
    patient: props.patientName,
  };
  showUploadModal.value = true;
}

async function handleUploaded({ exam, file }) {
  try {
    await ExamService.uploadPdf(exam.id, file);
    await loadExams();
    toast.add({
      severity: "success",
      summary: "PDF cargado",
      detail: "El documento del examen fue guardado correctamente.",
      life: 2500,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo subir el archivo",
      life: 2500,
    });
  }
}

/* New Exam */
const newExamTipo = ref("");
const showNewExamDialog = ref(false);
const creatingExam = ref(false);

function openNewExamDialog() {
  if (!newExamTipo.value.trim()) return;
  showNewExamDialog.value = true;
}

async function createExam() {
  creatingExam.value = true;
  try {
    await ExamService.create({
      paciente_id: props.patientId,
      tipo: newExamTipo.value.trim(),
    });
    await loadExams();
    toast.add({
      severity: "success",
      summary: "Examen creado",
      detail: `Nuevo examen creado para ${props.patientName}.`,
      life: 2500,
    });
    newExamTipo.value = "";
    showNewExamDialog.value = false;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo crear el examen.",
      life: 2500,
    });
  } finally {
    creatingExam.value = false;
  }
}

/* Delete Exam */
const showCancelDialog = ref(false);
const cancelTarget = ref(null);
const deleting = ref(false);

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
      summary: "Examen eliminado",
      detail: "El examen fue eliminado correctamente.",
      life: 2500,
    });
    await loadExams();
    showCancelDialog.value = false;
  } finally {
    deleting.value = false;
  }
}

/* Reload list */
async function loadExams() {
  const data = await ExamService.getByPatient(props.patientId);
  exams.value = data;
}

/* PDF View + Download */
async function viewPdf(exam) {
  const savedAuth = localStorage.getItem("jwt");
  if (!savedAuth) return console.error("No token");

  const { token } = JSON.parse(savedAuth);
  const res = await fetch(ExamService.getDownloadUrl(exam.id), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

async function downloadPdf(exam) {
  const savedAuth = localStorage.getItem("jwt");
  if (!savedAuth) return;

  const { token } = JSON.parse(savedAuth);
  const res = await fetch(ExamService.getDownloadUrl(exam.id), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${exam.tipo || "examen"}.pdf`;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

/* Date */
const today = computed(() => {
  const d = new Date();
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});
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
