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
          <Column field="date" header="Fecha" />
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
              <Button
                :label="slotProps.data.file ? 'Editar' : 'Subir PDF'"
                icon="pi pi-upload"
                text
                size="small"
                @click="openUploadDialog(slotProps.data)"
              />
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
import Tag from "primevue/tag";
import UploadExamModal from "./UploadExamModal.vue";
import { ExamService } from "@/services/examService";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const exams = ref([]);
const searchQuery = ref("");
const uploadDialogVisible = ref(false);
const selectedExam = ref(null);

function getDaysOverdue(dateStr) {
  if (!dateStr) return 0;
  const examDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now - examDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

async function loadPendingExams() {
  try {
    const data = await ExamService.getPending();
    // Map backend data to expected format
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
    // Upload file to backend
    await ExamService.uploadPdf(exam.id, file);

    // Update local state
    const target = exams.value.find((e) => e.id === exam.id);
    if (target) {
      target.file = file.name;
      target.estado = "COMPLETADO";
    }

    uploadDialogVisible.value = false;

    // Optionally reload exams
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
