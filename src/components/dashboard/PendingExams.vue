<template>
  <Card
    class="flex flex-column flex-1 overflow-hidden"
    :pt="{
      body: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
      content: { class: 'flex flex-column flex-1 min-h-0 overflow-hidden' },
    }"
  >
    <!-- 🧭 Header -->
    <template #title>
      <div
        class="flex justify-content-between align-items-center flex-wrap gap-2"
      >
        <span class="font-semibold text-lg">Exámenes Pendientes</span>

        <IconField iconPosition="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            placeholder="Buscar"
            class="w-15rem sm:w-12rem md:w-20rem"
            fluid
          />
        </IconField>
      </div>
    </template>

    <!-- 📋 Scrollable table -->
    <template #content>
      <div class="flex-1 min-h-0 overflow-hidden p-3">
        <DataTable
          :value="filteredExams"
          scrollable
          scrollHeight="flex"
          stripedRows
          size="small"
          responsiveLayout="scroll"
        >
          <Column field="date" header="Fecha">
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>

          <Column header="Paciente">
            <template #body="slotProps">
              <router-link
                v-if="slotProps.data.patientId"
                :to="`/app/patients/${slotProps.data.patientId}`"
                class="patient-link"
              >
                {{ slotProps.data.patient }}
              </router-link>
              <span v-else>{{ slotProps.data.patient }}</span>
            </template>
          </Column>

          <Column field="examType" header="Tipo de Examen" />

          <Column header="Acciones">
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <Button
                  :label="slotProps.data.file ? 'Editar' : 'Subir PDF'"
                  icon="pi pi-upload"
                  text
                  size="small"
                  @click="openUploadDialog(slotProps.data)"
                />
                <Button
                  label="Eliminar"
                  icon="pi pi-times"
                  text
                  size="small"
                  class="text-red-500"
                  severity="danger"
                  @click="openDeleteDialog(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- Empty state -->
        <div
          v-if="!filteredExams.length"
          class="text-center text-color-secondary py-3"
        >
          No hay exámenes pendientes.
        </div>

        <!-- 📤 Upload Modal -->
        <UploadExamModal
          v-model="uploadDialogVisible"
          :exam="selectedExam"
          @uploaded="onExamUploaded"
        />
      </div>
    </template>
  </Card>

  <!-- 🗑️ Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="showDeleteDialog"
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
            Confirme la eliminación del examen seleccionado
          </span>
        </div>
      </div>
    </template>

    <!-- Content -->
    <div class="pt-0 pb-4 flex flex-column gap-4">
      <!-- Exam Summary -->
      <div
        class="surface-card border-round-lg shadow-1 border-1 surface-border p-4 flex flex-column gap-2"
      >
        <div class="flex align-items-center gap-2">
          <i class="pi pi-user text-primary"></i>
          <span class="font-medium text-color">{{
            examToDelete?.patient || "Paciente desconocido"
          }}</span>
        </div>

        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
          <i class="pi pi-clipboard"></i>
          <span>{{ examToDelete?.examType || "Sin tipo" }}</span>
        </div>

        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
          <i class="pi pi-calendar"></i>
          <span>{{ formatDate(examToDelete?.date) }}</span>
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
          @click="showDeleteDialog = false"
        />
        <Button
          label="Eliminar Examen"
          icon="pi pi-trash"
          severity="danger"
          outlined
          :loading="deleting"
          class="px-4 py-2 text-sm font-medium hover:bg-red-50"
          @click="confirmDeleteExam"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import UploadExamModal from "./UploadExamModal.vue";
import { ExamService } from "@/services/examService";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const exams = ref([]);
const searchQuery = ref("");
const uploadDialogVisible = ref(false);
const selectedExam = ref(null);

const showDeleteDialog = ref(false);
const deleting = ref(false);
const examToDelete = ref(null);

function formatDate(dateStr) {
  if (!dateStr) return "Sin fecha";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

async function loadPendingExams() {
  try {
    const data = await ExamService.getPending();
    exams.value = (Array.isArray(data) ? data : []).map((exam) => ({
      id: exam.id,
      date: exam.fecha ? new Date(exam.fecha).toISOString().split("T")[0] : "",
      patient: exam.nombre_paciente || "Sin nombre",
      patientId: exam.paciente_id,
      examType: exam.tipo || "Sin tipo",
      file: exam.s3_key || null,
    }));
  } catch (error) {
    console.error("Error loading pending exams:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar los exámenes pendientes",
      life: 3000,
    });
    exams.value = [];
  }
}

onMounted(() => {
  loadPendingExams();
});

const filteredExams = computed(() => {
  if (!searchQuery.value.trim()) return exams.value;
  const q = searchQuery.value.toLowerCase();
  return exams.value.filter(
    (e) =>
      e.patient.toLowerCase().includes(q) ||
      e.examType.toLowerCase().includes(q),
  );
});

function openUploadDialog(exam) {
  selectedExam.value = exam;
  uploadDialogVisible.value = true;
}

async function onExamUploaded({ exam, file }) {
  try {
    await ExamService.uploadPdf(exam.id, file);
    const target = exams.value.find((e) => e.id === exam.id);
    if (target) {
      target.file = file.name;
      target.estado = "COMPLETADO";
    }
    uploadDialogVisible.value = false;
    await loadPendingExams();
  } catch (error) {
    console.error("Error uploading exam:", error);
    toast.add({
      severity: "error",
      summary: "Error al subir archivo",
      detail: "No se pudo subir el archivo",
      life: 3000,
    });
  }
}

function openDeleteDialog(exam) {
  examToDelete.value = exam;
  showDeleteDialog.value = true;
}

async function confirmDeleteExam() {
  if (!examToDelete.value) return;
  deleting.value = true;
  try {
    await ExamService.delete(examToDelete.value.id);
    toast.add({
      severity: "warn",
      summary: "Examen eliminado",
      detail: "El examen fue eliminado correctamente",
      life: 3000,
    });
    showDeleteDialog.value = false;
    await loadPendingExams();
  } catch (error) {
    console.error("Error deleting exam:", error);
    toast.add({
      severity: "error",
      summary: "Error al eliminar",
      detail: "No se pudo eliminar el examen.",
      life: 3000,
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<style scoped>
.patient-link {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}
.patient-link:hover {
  text-decoration: underline;
}
</style>
