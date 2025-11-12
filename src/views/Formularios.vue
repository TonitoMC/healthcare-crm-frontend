<template>
  <div class="questionnaire-manager p-4">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-4 pb-4 border-bottom-2 surface-border">
        <div>
          <h1 class="text-4xl font-bold text-color m-0 mb-2">
            <i class="pi pi-file-edit text-primary mr-2"></i>
            Gestión de Formularios
          </h1>
          <p class="text-color-secondary m-0">
            Administra los cuestionarios de consulta y sus versiones
          </p>
        </div>
        <Button
          :label="showAll ? 'Mostrar Solo Activos' : 'Mostrar Todos'"
          :icon="showAll ? 'pi pi-filter-slash' : 'pi pi-filter'"
          :severity="showAll ? 'secondary' : 'primary'"
          @click="toggleShowAll"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-content-center align-items-center py-8">
        <ProgressSpinner />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="groupedQuestionnaires.length === 0"
        class="text-center py-8"
      >
        <i class="pi pi-inbox text-6xl text-400 mb-4"></i>
        <p class="text-xl text-color-secondary m-0">
          No se encontraron cuestionarios
        </p>
      </div>

      <!-- Questionnaires List -->
      <div v-else class="flex flex-column gap-4">
        <Panel
          v-for="group in groupedQuestionnaires"
          :key="group.name"
          :header="group.name"
          toggleable
          class="shadow-2"
          :pt="{
            header: { class: 'bg-primary text-primary-contrast font-semibold text-lg' },
            content: { class: 'p-4' },
            togglerIcon: { class: 'text-primary-contrast' },
          }"
        >
          <template #header>
            <div class="flex align-items-center gap-2 w-full">
              <i class="pi pi-folder text-xl"></i>
              <span class="font-bold text-xl">{{ group.name }}</span>
              <Tag :value="`${group.versions.length} versiones`" severity="info" class="ml-2" />
            </div>
          </template>

          <div class="grid">
            <div
              v-for="questionnaire in group.versions"
              :key="questionnaire.id"
              class="col-12 md:col-6 lg:col-4 xl:col-3"
            >
              <QuestionnaireCard
                :questionnaire="questionnaire"
                @edit="openEditModal(questionnaire)"
                @toggle-active="toggleActive(questionnaire)"
                @view-details="viewDetails(questionnaire)"
              />
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
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import QuestionnaireCard from '@/components/questionnaire/QuestionnaireCard.vue'
import QuestionnaireEditDialog from '@/components/questionnaire/QuestionnaireEditDialog.vue'
import QuestionnaireDetailsDialog from '@/components/questionnaire/QuestionnaireDetailsDialog.vue'
import { QuestionnaireService } from '@/services/questionnaireService.js'
import { getErrorMessage } from '@/utils/errorMessages.js'

const toast = useToast()

const questionnaires = ref([])
const loading = ref(false)
const showAll = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const selectedQuestionnaire = ref(null)
const selectedQuestionnaireDetails = ref(null)

const groupedQuestionnaires = computed(() => {
  if (!questionnaires.value) return []

  const groups = {}

  questionnaires.value.forEach((questionnaire) => {
    if (!groups[questionnaire.nombre]) {
      groups[questionnaire.nombre] = {
        name: questionnaire.nombre,
        versions: [],
      }
    }
    groups[questionnaire.nombre].versions.push(questionnaire)
  })

  // Sort versions within each group (newest first)
  Object.values(groups).forEach((group) => {
    group.versions.sort((a, b) => b.version.localeCompare(a.version))
  })

  // Sort groups alphabetically
  return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
})

onMounted(() => {
  loadQuestionnaires()
})

const loadQuestionnaires = async () => {
  loading.value = true
  try {
    questionnaires.value = showAll.value
      ? await QuestionnaireService.getAll()
      : await QuestionnaireService.getActive()
  } catch (error) {
    console.error('Error cargando cuestionarios:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(error),
      life: 4000,
    })
    questionnaires.value = []
  } finally {
    loading.value = false
  }
}

const toggleShowAll = async () => {
  showAll.value = !showAll.value
  await loadQuestionnaires()
}

const openEditModal = async (questionnaire) => {
  try {
    // Load full questionnaire with questions
    selectedQuestionnaire.value = await QuestionnaireService.getByID(questionnaire.id)
    showEditModal.value = true
  } catch (error) {
    console.error('Error loading questionnaire for editing:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(error),
      life: 4000,
    })
  }
}

const handleSave = async (updatedQuestionnaire) => {
  try {
    // Create a new version (POST)
    await QuestionnaireService.create(updatedQuestionnaire)

    toast.add({
      severity: 'success',
      summary: '¡Éxito!',
      detail: 'Nueva versión del cuestionario creada correctamente',
      life: 3000,
    })

    showEditModal.value = false
    selectedQuestionnaire.value = null
    await loadQuestionnaires()
  } catch (error) {
    console.error('Error creando nueva versión:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(error),
      life: 4000,
    })
  }
}

const toggleActive = async (questionnaire) => {
  try {
    await QuestionnaireService.toggleActive(questionnaire.id, questionnaire.activo)

    toast.add({
      severity: 'success',
      summary: '¡Éxito!',
      detail: `Cuestionario ${questionnaire.activo ? 'desactivado' : 'activado'} correctamente`,
      life: 3000,
    })

    await loadQuestionnaires()
  } catch (error) {
    console.error('Error cambiando estado activo:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(error),
      life: 4000,
    })
  }
}

const viewDetails = async (questionnaire) => {
  try {
    selectedQuestionnaireDetails.value = await QuestionnaireService.getByID(questionnaire.id)
    showDetailsModal.value = true
  } catch (error) {
    console.error('Error cargando detalles del cuestionario:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(error),
      life: 4000,
    })
  }
}
</script>

<style scoped>
.questionnaire-manager {
  min-height: 70vh;
}

:deep(.p-panel-header) {
  cursor: pointer;
}

:deep(.p-panel-toggler) {
  margin-left: auto;
}
</style>
