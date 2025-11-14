<template>
  <div class="questionnaire-manager p-3 md:p-4 flex flex-column gap-4">
    <!-- Header -->
    <div
      class="flex flex-column sm:flex-row sm:justify-content-between sm:align-items-center gap-3 pb-3 border-bottom-1 surface-border"
    >
      <div class="flex flex-column gap-1">
        <h1 class="text-2xl md:text-3xl font-semibold text-color m-0">
          Formularios de Consulta
        </h1>
        <p class="text-sm md:text-base text-color-secondary m-0">
          Administra versiones y estados de los cuestionarios
        </p>
      </div>

      <Button
        :label="showAll ? 'Mostrar Solo Activos' : 'Mostrar Todos'"
        :icon="showAll ? 'pi pi-filter-slash' : 'pi pi-filter'"
        :severity="showAll ? 'secondary' : 'primary'"
        class="w-full sm:w-auto"
        @click="toggleShowAll"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex justify-content-center align-items-center py-8"
    >
      <ProgressSpinner />
    </div>

    <!-- Empty -->
    <div
      v-else-if="groupedQuestionnaires.length === 0"
      class="text-center py-8 flex flex-column align-items-center gap-3"
    >
      <i class="pi pi-inbox text-5xl text-400"></i>
      <p class="text-lg text-color-secondary m-0">
        No se encontraron cuestionarios
      </p>
    </div>

    <!-- Groups -->
    <div v-else class="flex flex-column gap-4">
      <Panel
        v-for="group in groupedQuestionnaires"
        :key="group.name"
        toggleable
        class="shadow-1 border-round-lg"
        :pt="{
          header: {
            class: 'surface-100 px-3 py-2 text-color font-medium',
          },
          content: { class: 'p-3' },
        }"
      >
        <template #header>
          <div class="flex align-items-center gap-2 w-full">
            <i class="pi pi-folder text-sm text-primary"></i>
            <span class="font-semibold text-base md:text-lg">
              {{ group.name }}
            </span>
            <Tag
              :value="`${group.versions.length} versiones`"
              severity="info"
              class="ml-auto text-xs"
            />
          </div>
        </template>

        <!-- Responsive grid but with max-width per card -->
        <div class="grid">
          <div
            v-for="questionnaire in group.versions"
            :key="questionnaire.id"
            class="col-12 sm:col-6 lg:col-4 xl:col-3 flex justify-content-center"
          >
            <div class="w-full" style="max-width: 330px">
              <QuestionnaireCard
                :questionnaire="questionnaire"
                @edit="openEditModal(questionnaire)"
                @toggle-active="toggleActive(questionnaire)"
                @view-details="viewDetails(questionnaire)"
              />
            </div>
          </div>
        </div>
      </Panel>
    </div>

    <!-- Edit Modal -->
    <QuestionnaireEditDialog
      v-model:visible="showEditModal"
      :questionnaire="selectedQuestionnaire"
      @save="handleSave"
    />

    <!-- Details Modal -->
    <QuestionnaireDetailsDialog
      v-model:visible="showDetailsModal"
      :questionnaire="selectedQuestionnaireDetails"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";

import Panel from "primevue/panel";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";

import QuestionnaireCard from "@/components/questionnaire/QuestionnaireCard.vue";
import QuestionnaireEditDialog from "@/components/questionnaire/QuestionnaireEditDialog.vue";
import QuestionnaireDetailsDialog from "@/components/questionnaire/QuestionnaireDetailsDialog.vue";

import { QuestionnaireService } from "@/services/questionnaireService.js";
import { getErrorMessage } from "@/utils/errorMessages.js";

const toast = useToast();

const questionnaires = ref([]);
const loading = ref(false);
const showAll = ref(true);

const showEditModal = ref(false);
const showDetailsModal = ref(false);
const selectedQuestionnaire = ref(null);
const selectedQuestionnaireDetails = ref(null);

const groupedQuestionnaires = computed(() => {
  if (!Array.isArray(questionnaires.value) || questionnaires.value.length === 0)
    return [];

  const groups = {};

  questionnaires.value.forEach((q) => {
    if (!groups[q.nombre]) {
      groups[q.nombre] = {
        name: q.nombre,
        versions: [],
      };
    }
    groups[q.nombre].versions.push(q);
  });

  // Sort versions within each group (newest first, by version string)
  Object.values(groups).forEach((group) => {
    group.versions.sort((a, b) =>
      String(b.version || "").localeCompare(String(a.version || "")),
    );
  });

  // Sort groups alphabetically by name
  return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
});

onMounted(() => {
  loadQuestionnaires();
});

const loadQuestionnaires = async () => {
  loading.value = true;
  try {
    questionnaires.value = showAll.value
      ? await QuestionnaireService.getAll()
      : await QuestionnaireService.getActive();
  } catch (error) {
    console.error("Error cargando cuestionarios:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(error),
      life: 4000,
    });
    questionnaires.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleShowAll = async () => {
  showAll.value = !showAll.value;
  await loadQuestionnaires();
};

const openEditModal = async (questionnaire) => {
  try {
    // load full questionnaire with questions
    selectedQuestionnaire.value = await QuestionnaireService.getByID(
      questionnaire.id,
    );
    showEditModal.value = true;
  } catch (error) {
    console.error("Error loading questionnaire for editing:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(error),
      life: 4000,
    });
  }
};

const handleSave = async (updatedQuestionnaire) => {
  try {
    // create a new version (POST)
    await QuestionnaireService.create(updatedQuestionnaire);

    toast.add({
      severity: "success",
      summary: "¡Éxito!",
      detail: "Nueva versión del cuestionario creada correctamente",
      life: 3000,
    });

    showEditModal.value = false;
    selectedQuestionnaire.value = null;
    await loadQuestionnaires();
  } catch (error) {
    console.error("Error creando nueva versión:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(error),
      life: 4000,
    });
  }
};

const toggleActive = async (questionnaire) => {
  try {
    await QuestionnaireService.toggleActive(
      questionnaire.id,
      questionnaire.activo,
    );

    toast.add({
      severity: "success",
      summary: "¡Éxito!",
      detail: `Cuestionario ${
        questionnaire.activo ? "desactivado" : "activado"
      } correctamente`,
      life: 3000,
    });

    await loadQuestionnaires();
  } catch (error) {
    console.error("Error cambiando estado activo:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(error),
      life: 4000,
    });
  }
};

const viewDetails = async (questionnaire) => {
  try {
    selectedQuestionnaireDetails.value = await QuestionnaireService.getByID(
      questionnaire.id,
    );
    showDetailsModal.value = true;
  } catch (error) {
    console.error("Error cargando detalles del cuestionario:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: getErrorMessage(error),
      life: 4000,
    });
  }
};
</script>

<style scoped>
.questionnaire-manager {
  min-height: 70vh;
}

:deep(.p-panel-header) {
  cursor: pointer;
}
</style>
