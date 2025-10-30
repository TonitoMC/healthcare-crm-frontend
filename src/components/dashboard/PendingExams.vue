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
          <Column field="patient" header="Paciente" />
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
import UploadExamModal from "./UploadExamModal.vue";

const exams = ref([]);
const searchQuery = ref("");
const uploadDialogVisible = ref(false);
const selectedExam = ref(null);

onMounted(() => {
  exams.value = [
    {
      date: "2025-04-01",
      patient: "María González López",
      examType: "Refracción ciclopléjica",
      file: null,
    },
    {
      date: "2025-06-30",
      patient: "Carlos Sánchez Díaz",
      examType: "Curva de tensión ocular",
      file: null,
    },
    {
      date: "2025-10-19",
      patient: "Juan Pérez Martínez",
      examType: "Paquimetría",
      file: null,
    },
  ];
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

function onExamUploaded({ exam, file }) {
  // Match the uploaded exam by id or by object reference
  const target = exams.value.find((e) => e === exam);
  if (target) target.file = file.name;
  uploadDialogVisible.value = false;
}
</script>
