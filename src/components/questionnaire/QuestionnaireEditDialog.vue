<template>
  <Dialog
    v-model:visible="show"
    modal
    header="Editar Cuestionario"
    :style="{ width: '60rem', maxWidth: '95vw' }"
    :pt="{
      root: { class: 'border-round-2xl overflow-hidden' },
      header: { class: 'bg-primary text-primary-contrast px-5 py-4' },
      content: { class: 'px-5 py-4' },
    }"
  >
    <template #header>
      <div class="flex align-items-center gap-3 w-full">
        <i class="pi pi-pencil text-3xl"></i>
        <div class="flex flex-column flex-1">
          <h2 class="m-0 text-2xl font-semibold">Editar Cuestionario</h2>
          <div class="flex gap-2 mt-2 flex-wrap">
            <Tag :value="`Actual: ${questionnaire?.version || 'v1.0'}`" class="bg-white-alpha-30" />
            <i class="pi pi-arrow-right text-white"></i>
            <Tag :value="`Nueva: ${form.version}`" severity="warning" class="font-bold" />
          </div>
        </div>
      </div>
    </template>

    <form @submit.prevent="handleSubmit">
      <!-- Información del Cuestionario -->
      <Panel header="Información del Cuestionario" class="mb-4">
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-info-circle text-primary"></i>
            <span class="font-semibold">Información del Cuestionario</span>
          </div>
        </template>

        <div class="grid">
          <div class="col-12 md:col-8">
            <div class="field">
              <label for="nombre" class="font-semibold">Nombre del Cuestionario</label>
              <InputText
                id="nombre"
                v-model="form.nombre"
                required
                class="w-full"
                placeholder="Ej: Consulta General"
              />
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="field">
              <label for="version" class="font-semibold">Nueva Versión</label>
              <div class="p-inputgroup">
                <InputText
                  id="version"
                  v-model="form.version"
                  required
                  placeholder="Ej: v2.0"
                />
                <Button
                  icon="pi pi-plus"
                  severity="secondary"
                  type="button"
                  @click="autoIncrementVersion"
                  v-tooltip.top="'Auto incrementar'"
                />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <!-- Preguntas -->
      <Panel class="mb-4">
        <template #header>
          <div class="flex justify-content-between align-items-center w-full">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-list text-primary"></i>
              <span class="font-semibold">Preguntas del Cuestionario</span>
              <Tag :value="`${form.questions.length} preguntas`" severity="info" />
            </div>
            <Button
              label="Agregar Pregunta"
              icon="pi pi-plus"
              size="small"
              outlined
              type="button"
              @click="addQuestion"
            />
          </div>
        </template>

        <div v-if="form.questions.length === 0" class="text-center py-6">
          <i class="pi pi-inbox text-6xl text-400 mb-3"></i>
          <p class="text-color-secondary m-0">
            No hay preguntas. Haz clic en "Agregar Pregunta" para comenzar.
          </p>
        </div>

        <div v-else class="flex flex-column gap-3">
          <div
            v-for="(question, index) in form.questions"
            :key="`question-${index}`"
            class="surface-card border-round-lg p-4 shadow-1 border-1 surface-border"
            :class="{ 'border-red-500': questionErrors[index] }"
          >
            <div class="flex align-items-start gap-3">
              <div
                class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle flex-shrink-0"
                style="width: 2.5rem; height: 2.5rem"
              >
                <span class="font-bold">{{ question.order }}</span>
              </div>

              <div class="flex-1">
                <div class="field mb-3">
                  <InputText
                    v-model="question.name"
                    placeholder="Nombre de la pregunta"
                    class="w-full"
                    :class="{ 'p-invalid': questionErrors[index]?.name }"
                    required
                    @input="validateQuestion(index)"
                  />
                  <small v-if="questionErrors[index]?.name" class="p-error">
                    {{ questionErrors[index].name }}
                  </small>
                </div>

                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label class="font-semibold text-sm">Tipo</label>
                      <Select
                        v-model="question.type"
                        :options="questionTypes"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label class="font-semibold text-sm flex align-items-center gap-2">
                        <Checkbox v-model="question.bilateral" :binary="true" />
                        <i class="pi pi-arrows-h text-orange-500"></i>
                        Bilateral
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-column gap-1">
                <Button
                  icon="pi pi-arrow-up"
                  size="small"
                  text
                  rounded
                  severity="secondary"
                  :disabled="index === 0"
                  @click="moveQuestion(index, -1)"
                  v-tooltip.left="'Mover arriba'"
                />
                <Button
                  icon="pi pi-arrow-down"
                  size="small"
                  text
                  rounded
                  severity="secondary"
                  :disabled="index === form.questions.length - 1"
                  @click="moveQuestion(index, 1)"
                  v-tooltip.left="'Mover abajo'"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  text
                  rounded
                  severity="danger"
                  :disabled="form.questions.length === 1"
                  @click="removeQuestion(index)"
                  v-tooltip.left="'Eliminar'"
                />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <!-- Footer Actions -->
      <div class="flex justify-content-end gap-2 pt-3 border-top-1 surface-border">
        <Button label="Cancelar" icon="pi pi-times" text severity="secondary" @click="handleClose" />
        <Button
          label="Crear Nueva Versión"
          icon="pi pi-check"
          type="submit"
          :disabled="!isFormValid"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'

const props = defineProps({
  visible: Boolean,
  questionnaire: Object,
})

const emit = defineEmits(['update:visible', 'save'])

const show = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const questionTypes = [
  { label: 'Texto', value: 'texto' },
  { label: 'Número', value: 'entero' },
  { label: 'Número Decimal', value: 'float' },
  { label: 'Sí/No', value: 'booleano' },
]

const form = ref({
  nombre: '',
  version: '',
  questions: [],
})

const questionErrors = ref({})

const isFormValid = computed(() => {
  const hasName = form.value.nombre.trim().length > 0
  const hasVersion = form.value.version.trim().length > 0
  const hasQuestions = form.value.questions.length > 0
  const allQuestionsValid = form.value.questions.every((q) => q.name.trim().length > 0)

  return hasName && hasVersion && hasQuestions && allQuestionsValid
})

watch(
  () => props.questionnaire,
  (newVal) => {
    if (newVal && props.visible) {
      initializeForm()
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.questionnaire) {
      initializeForm()
    }
  }
)

const initializeForm = () => {
  if (!props.questionnaire) return

  form.value = {
    nombre: props.questionnaire.nombre || '',
    version: generateNextVersion(props.questionnaire.version),
    questions: prepareQuestions(props.questionnaire.questions || []),
  }

  questionErrors.value = {}
}

const generateNextVersion = (currentVersion) => {
  if (!currentVersion) return 'v1.0'

  const match = currentVersion.match(/v?(\d+)\.(\d+)/)
  if (match) {
    const major = parseInt(match[1])
    const minor = parseInt(match[2])
    return `v${major}.${minor + 1}`
  }

  return 'v2.0'
}

const autoIncrementVersion = () => {
  form.value.version = generateNextVersion(form.value.version)
}

const prepareQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) return []

  return questions.map((q, index) => ({
    id: q.id || null,
    name: q.label || q.name || q.nombre || '',
    type: reverseMapType(q.data_type || q.type) || 'texto',
    bilateral: q.type === 'bilateral' || Boolean(q.bilateral),
    order: q.order || index + 1,
  }))
}

const reverseMapType = (dataType) => {
  const typeMap = {
    string: 'texto',
    int: 'entero',
    float: 'float',
    bool: 'booleano',
  }
  return typeMap[dataType] || 'texto'
}

const addQuestion = () => {
  const newOrder = form.value.questions.length + 1
  form.value.questions.push({
    id: null,
    name: '',
    type: 'texto',
    bilateral: false,
    order: newOrder,
  })
}

const removeQuestion = (index) => {
  if (form.value.questions.length > 1) {
    form.value.questions.splice(index, 1)
    reorderQuestions()
    delete questionErrors.value[index]
  }
}

const moveQuestion = (index, direction) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= form.value.questions.length) return

  const temp = form.value.questions[index]
  form.value.questions[index] = form.value.questions[newIndex]
  form.value.questions[newIndex] = temp

  reorderQuestions()
}

const reorderQuestions = () => {
  form.value.questions.forEach((q, i) => {
    q.order = i + 1
  })
}

const validateQuestion = (index) => {
  const question = form.value.questions[index]
  const errors = {}

  if (!question.name.trim()) {
    errors.name = 'El nombre de la pregunta es requerido'
  } else if (question.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres'
  }

  if (Object.keys(errors).length > 0) {
    questionErrors.value[index] = errors
  } else {
    delete questionErrors.value[index]
  }
}

const handleSubmit = () => {
  // Validate all questions
  form.value.questions.forEach((_, index) => {
    validateQuestion(index)
  })

  if (!isFormValid.value) {
    return
  }

  emit('save', {
    ...form.value,
    originalId: props.questionnaire?.id,
  })
}

const handleClose = () => {
  show.value = false
}
</script>

<style scoped>
:deep(.p-panel-header) {
  background: var(--surface-50);
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-dialog-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.border-red-500 {
  border-color: var(--red-500) !important;
}
</style>
