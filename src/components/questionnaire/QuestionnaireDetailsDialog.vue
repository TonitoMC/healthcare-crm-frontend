<template>
  <Dialog
    v-model:visible="show"
    modal
    :header="questionnaire?.nombre || 'Detalles del Cuestionario'"
    :style="{ width: '50rem', maxWidth: '95vw' }"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      header: { class: 'bg-primary text-primary-contrast px-5 py-4' },
      content: { class: 'px-5 py-4' },
    }"
  >
    <template #header>
      <div class="flex align-items-center gap-3 w-full">
        <i class="pi pi-file-edit text-3xl"></i>
        <div class="flex flex-column flex-1">
          <h2 class="m-0 text-2xl font-semibold">
            {{ questionnaire?.nombre || 'Cuestionario' }}
          </h2>
          <div class="flex gap-2 mt-2">
            <Tag :value="`Versión ${questionnaire?.version}`" class="bg-white-alpha-30" />
            <Tag
              :value="questionnaire?.activo ? 'Activo' : 'Inactivo'"
              :severity="questionnaire?.activo ? 'success' : 'danger'"
              :icon="questionnaire?.activo ? 'pi pi-check-circle' : 'pi pi-times-circle'"
            />
          </div>
        </div>
      </div>
    </template>

    <div v-if="!questionnaire?.questions || questionnaire.questions.length === 0" class="text-center py-6">
      <i class="pi pi-info-circle text-6xl text-400 mb-3"></i>
      <p class="text-color-secondary text-lg m-0">
        No se encontraron preguntas para este cuestionario
      </p>
    </div>

    <div v-else class="flex flex-column gap-3">
      <div class="mb-3">
        <h3 class="text-lg font-semibold flex align-items-center gap-2 mb-3">
          <i class="pi pi-list text-primary"></i>
          Preguntas del Cuestionario
          <Tag :value="`${questionnaire.questions.length} preguntas`" severity="info" />
        </h3>
      </div>

      <div
        v-for="question in questionnaire.questions"
        :key="question.order"
        class="surface-card border-round-lg p-4 shadow-1 border-1 surface-border"
      >
        <div class="flex align-items-start gap-3">
          <div
            class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle flex-shrink-0"
            style="width: 2.5rem; height: 2.5rem"
          >
            <span class="font-bold">{{ question.order }}</span>
          </div>

          <div class="flex-1">
            <h4 class="font-semibold text-lg mb-2 text-color">
              {{ question.label || question.name }}
            </h4>
            <div class="flex gap-2 flex-wrap">
              <Tag
                :value="getQuestionTypeLabel(question.data_type || question.type)"
                :severity="getTypeSeverity(question.data_type || question.type)"
                icon="pi pi-tag"
              />
              <Tag
                v-if="question.type === 'bilateral' || question.bilateral"
                value="Bilateral"
                severity="warning"
                icon="pi pi-arrows-h"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cerrar" icon="pi pi-times" text @click="show = false" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const props = defineProps({
  visible: Boolean,
  questionnaire: Object,
})

const emit = defineEmits(['update:visible'])

const show = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const getQuestionTypeLabel = (type) => {
  const typeLabels = {
    int: 'Número',
    float: 'Decimal',
    string: 'Texto',
    bool: 'Sí/No',
    entero: 'Número',
    texto: 'Texto',
    booleano: 'Sí/No',
  }
  return typeLabels[type?.toLowerCase()] || type || 'Desconocido'
}

const getTypeSeverity = (type) => {
  const typeSeverities = {
    int: 'info',
    entero: 'info',
    float: 'info',
    string: 'success',
    texto: 'success',
    bool: 'warning',
    booleano: 'warning',
  }
  return typeSeverities[type?.toLowerCase()] || 'secondary'
}
</script>

<style scoped>
:deep(.p-dialog-header) {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-tag) {
  font-weight: 600;
}
</style>
