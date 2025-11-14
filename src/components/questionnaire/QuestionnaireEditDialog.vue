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
        <h2 class="m-0 text-2xl font-semibold">Editar Cuestionario</h2>
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
          <!-- NOMBRE (READONLY) -->
          <div class="col-12 md:col-8">
            <div class="field">
              <label class="font-semibold mb-1 block"
                >Nombre del Cuestionario</label
              >
              <InputText
                v-model="form.nombre"
                class="w-full opacity-80"
                readonly
              />
            </div>
          </div>

          <!-- VERSION (READ-ONLY, AUTO-FILLED) -->
          <div class="col-12 md:col-4">
            <div class="field">
              <label class="font-semibold mb-1 block">Versión Nueva</label>
              <InputText
                v-model="form.version"
                class="w-full opacity-80"
                readonly
              />
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
              <Tag
                :value="`${form.questions.length} preguntas`"
                severity="info"
              />
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
            No hay preguntas. Haz clic en "Agregar Pregunta".
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
              <!-- Order -->
              <div
                class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle flex-shrink-0"
                style="width: 2.5rem; height: 2.5rem"
              >
                <span class="font-bold">{{ question.order }}</span>
              </div>

              <!-- Question -->
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
                  <!-- Tipo -->
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

                  <!-- Bilateral -->
                  <div class="col-12 md:col-6">
                    <div class="field flex align-items-center gap-2">
                      <Checkbox v-model="question.bilateral" :binary="true" />
                      <i class="pi pi-arrows-h text-orange-500"></i>
                      <label class="font-semibold text-sm m-0">Bilateral</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-column gap-1">
                <Button
                  icon="pi pi-arrow-up"
                  size="small"
                  text
                  rounded
                  severity="secondary"
                  :disabled="index === 0"
                  @click="moveQuestion(index, -1)"
                />
                <Button
                  icon="pi pi-arrow-down"
                  size="small"
                  text
                  rounded
                  severity="secondary"
                  :disabled="index === form.questions.length - 1"
                  @click="moveQuestion(index, 1)"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  text
                  rounded
                  severity="danger"
                  :disabled="form.questions.length === 1"
                  @click="removeQuestion(index)"
                />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <!-- Footer -->
      <div
        class="flex justify-content-end gap-2 pt-3 border-top-1 surface-border"
      >
        <Button
          label="Cancelar"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="handleClose"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          type="submit"
          :disabled="!isFormValid"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Panel from "primevue/panel";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Checkbox from "primevue/checkbox";
import Tag from "primevue/tag";

const props = defineProps({
  visible: Boolean,
  questionnaire: Object,
});

const emit = defineEmits(["update:visible", "save"]);

const show = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

/* ------------------------------------------
   VERSION AUTO-INCREMENT LOGIC
------------------------------------------- */
function nextVersion(v) {
  if (!v || !v.includes(".")) return "1.0";

  let [maj, min] = v.split(".").map(Number);

  if (Number.isNaN(maj) || Number.isNaN(min)) {
    return "1.0";
  }

  if (min < 9) return `${maj}.${min + 1}`;
  return `${maj + 1}.0`;
}

/* ------------------------------------------
   TYPE OPTIONS (UI)
------------------------------------------- */
const questionTypes = [
  { label: "Texto", value: "texto" },
  { label: "Número", value: "entero" },
  { label: "Número Decimal", value: "float" },
  { label: "Sí/No", value: "booleano" },
];

/**
 * Map backend data_type -> UI value
 *  backend: int | float | bool | string
 *  ui:      entero | float | booleano | texto
 * Also idempotent if it already comes as ui value.
 */
const toUiType = (dataType) => {
  if (!dataType) return "texto";

  const uiValues = ["texto", "entero", "float", "booleano"];
  if (uiValues.includes(dataType)) return dataType;

  const map = {
    int: "entero",
    float: "float",
    bool: "booleano",
    boolean: "booleano",
    string: "texto",
    text: "texto",
  };

  return map[dataType] || "texto";
};

const form = ref({
  nombre: "",
  version: "",
  questions: [],
});

const questionErrors = ref({});

const isFormValid = computed(() => {
  return (
    form.value.nombre.trim().length > 0 &&
    form.value.version.trim().length > 0 &&
    form.value.questions.length > 0 &&
    form.value.questions.every((q) => q.name.trim().length > 0)
  );
});

watch(
  () => props.questionnaire,
  (val) => {
    if (val && props.visible) initializeForm();
  },
  { immediate: true },
);

watch(
  () => props.visible,
  (val) => {
    if (val && props.questionnaire) initializeForm();
  },
);

const initializeForm = () => {
  if (!props.questionnaire) return;

  form.value = {
    nombre: props.questionnaire.nombre,
    version: nextVersion(props.questionnaire.version), // auto-assigned, read-only
    questions: prepareQuestions(props.questionnaire.schema?.questions || []),
  };

  questionErrors.value = {};
};

/**
 * questions from backend:
 * {
 *   type: "bilateral" | "unilateral",
 *   label: "Agudeza Visual",
 *   order: 1,
 *   data_type: "int" | "float" | "bool" | "string"
 * }
 */
const prepareQuestions = (questions) =>
  (questions || []).map((q, i) => ({
    id: q.id ?? null,
    name: q.label || q.name || "",
    // UI type for <Select>
    type: toUiType(q.data_type),
    // bilateral flag from backend type or explicit boolean
    bilateral: q.type === "bilateral" || Boolean(q.bilateral),
    order: q.order || i + 1,
  }));

const addQuestion = () => {
  form.value.questions.push({
    id: null,
    name: "",
    type: "texto",
    bilateral: false,
    order: form.value.questions.length + 1,
  });
};

const removeQuestion = (i) => {
  if (form.value.questions.length <= 1) return;
  form.value.questions.splice(i, 1);
  reorder();
};

const moveQuestion = (i, d) => {
  const ni = i + d;
  if (ni < 0 || ni >= form.value.questions.length) return;

  const tmp = form.value.questions[i];
  form.value.questions[i] = form.value.questions[ni];
  form.value.questions[ni] = tmp;

  reorder();
};

const reorder = () => {
  form.value.questions.forEach((q, i) => (q.order = i + 1));
};

const validateQuestion = (i) => {
  const q = form.value.questions[i];
  if (!q.name.trim()) {
    questionErrors.value[i] = { name: "El nombre es obligatorio" };
  } else {
    delete questionErrors.value[i];
  }
};

const handleSubmit = () => {
  form.value.questions.forEach((_, i) => validateQuestion(i));
  if (!isFormValid.value) return;

  emit("save", {
    ...form.value,
    originalId: props.questionnaire.id,
  });
};

const handleClose = () => (show.value = false);
</script>
