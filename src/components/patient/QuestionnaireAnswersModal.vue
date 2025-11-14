<template>
  <Dialog
    v-model:visible="visible"
    modal
    :pt="{
      root: 'border-round-xl overflow-hidden',
      header: 'bg-primary text-primary-contrast px-4 py-3',
      content: 'px-0 py-0' /* remove padding, we'll control it */,
    }"
    :style="{ width: '48rem', maxWidth: '95vw', height: '80vh' }"
  >
    <!-- HEADER -->
    <template #header>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-list-check text-xl"></i>
        <h2 class="m-0 text-lg font-semibold">{{ questionnaire.nombre }}</h2>
      </div>
    </template>

    <!-- BODY WITH SCROLL -->
    <ScrollPanel
      style="height: calc(80vh - 10rem)"
      class="px-4 py-3 overflow-x-hidden"
    >
      <form @submit.prevent="handleSubmit" class="flex flex-column gap-3">
        <div
          v-for="(q, i) in questionnaire.schema.questions"
          :key="i"
          class="border-1 surface-border border-round-lg p-3 surface-card transition-all transition-duration-200"
          :class="{
            'border-red-400': errors[q.label],
            'hover:border-primary-200': !errors[q.label],
          }"
        >
          <div class="flex align-items-start gap-3">
            <!-- LEFT SIDE: Question + Inputs -->
            <div class="flex-1" style="max-width: calc(100% - 3rem)">
              <div class="font-semibold text-sm mb-2 text-900">
                {{ q.label }}
              </div>

              <!-- BILATERAL -->
              <div v-if="q.type === 'bilateral'" class="flex gap-3 flex-wrap">
                <!-- NUMBER (OI LEFT, OD RIGHT) -->
                <template
                  v-if="q.data_type === 'int' || q.data_type === 'float'"
                >
                  <!-- OI -->
                  <div class="flex align-items-center gap-2">
                    <label class="text-xs font-semibold text-600 min-w-2rem"
                      >OI</label
                    >
                    <InputNumber
                      v-model="answers[q.label].value.OI"
                      class="w-6rem"
                      inputClass="text-center text-sm py-2 px-2 w-full"
                      :placeholder="exampleFor(q.data_type)"
                      :useGrouping="false"
                      :invalid="!!errors[q.label]?.OI"
                    />
                  </div>

                  <!-- OD -->
                  <div class="flex align-items-center gap-2">
                    <label class="text-xs font-semibold text-600 min-w-2rem"
                      >OD</label
                    >
                    <InputNumber
                      v-model="answers[q.label].value.OD"
                      class="w-6rem"
                      inputClass="text-center text-sm py-2 px-2 w-full"
                      :placeholder="exampleFor(q.data_type)"
                      :useGrouping="false"
                      :invalid="!!errors[q.label]?.OD"
                    />
                  </div>
                </template>

                <!-- TEXT BILATERAL -->
                <template v-else>
                  <div class="flex align-items-center gap-2">
                    <label class="text-xs font-semibold text-600 min-w-2rem"
                      >OI</label
                    >
                    <InputText
                      v-model="answers[q.label].value.OI"
                      class="w-14rem text-sm"
                      style="padding: 0.4rem 0.6rem"
                      :invalid="!!errors[q.label]?.OI"
                    />
                  </div>

                  <div class="flex align-items-center gap-2">
                    <label class="text-xs font-semibold text-600 min-w-2rem"
                      >OD</label
                    >
                    <InputText
                      v-model="answers[q.label].value.OD"
                      class="w-14rem text-sm"
                      style="padding: 0.4rem 0.6rem"
                      :invalid="!!errors[q.label]?.OD"
                    />
                  </div>
                </template>
              </div>

              <!-- UNILATERAL -->
              <div v-else>
                <!-- BOOL -->
                <div
                  v-if="q.data_type === 'bool'"
                  class="flex align-items-center gap-2"
                >
                  <Checkbox
                    v-model="answers[q.label].value"
                    :binary="true"
                    :inputId="`check-${i}`"
                  />
                  <label
                    :for="`check-${i}`"
                    class="text-sm cursor-pointer text-700"
                  >
                    Marcar si aplica
                  </label>
                </div>

                <!-- NUMBER -->
                <InputNumber
                  v-else-if="q.data_type === 'int' || q.data_type === 'float'"
                  v-model="answers[q.label].value"
                  class="w-6rem"
                  inputClass="text-center text-sm py-2 px-2 w-full"
                  :placeholder="exampleFor(q.data_type)"
                  :useGrouping="false"
                  :invalid="!!errors[q.label]?.value"
                />

                <!-- TEXT -->
                <InputText
                  v-else
                  v-model="answers[q.label].value"
                  class="w-full text-sm"
                  style="padding: 0.4rem 0.6rem"
                  placeholder="..."
                  :invalid="!!errors[q.label]?.value"
                />
              </div>

              <!-- ERROR -->
              <small v-if="errors[q.label]" class="p-error text-xs block mt-1">
                <i class="pi pi-exclamation-circle mr-1"></i>Campos requeridos
              </small>
            </div>

            <!-- RIGHT SIDE: Comment Button -->
            <div class="flex-shrink-0">
              <Button
                :icon="showComment[q.label] ? 'pi pi-times' : 'pi pi-comment'"
                :severity="answers[q.label].comment ? 'info' : 'secondary'"
                text
                rounded
                size="small"
                @click="showComment[q.label] = !showComment[q.label]"
              />
            </div>
          </div>

          <!-- COMMENT ACCORDION -->
          <transition
            name="accordion"
            @enter="startAccordion"
            @after-enter="endAccordion"
            @before-leave="startAccordion"
            @after-leave="endAccordion"
          >
            <div v-if="showComment[q.label]" class="comment-wrapper">
              <div class="comment-content">
                <InputText
                  v-model="answers[q.label].comment"
                  class="w-full text-sm"
                  style="padding: 0.4rem 0.6rem"
                  placeholder="Escriba un comentario adicional..."
                />
              </div>
            </div>
          </transition>
        </div>
      </form>
    </ScrollPanel>

    <!-- FOOTER -->
    <div
      class="flex justify-content-end gap-2 pt-3 pb-3 px-4 border-top-1 surface-border"
    >
      <Button
        label="Cancelar"
        text
        severity="secondary"
        size="small"
        @click="close"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        type="button"
        severity="success"
        size="small"
        @click="handleSubmit"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import ScrollPanel from "primevue/scrollpanel";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";

const props = defineProps({
  visible: Boolean,
  questionnaire: Object,
});

const emit = defineEmits(["update:visible", "save"]);

const visible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
});

const answers = ref({});
const showComment = ref({});
const errors = ref({});

// Reset form when questionnaire loads
watch(
  () => props.questionnaire,
  (q) => {
    if (!q) return;

    answers.value = {};
    showComment.value = {};
    errors.value = {};

    q.schema.questions.forEach((question) => {
      if (question.type === "bilateral") {
        answers.value[question.label] = {
          value: { OD: null, OI: null },
          comment: "",
        };
      } else {
        answers.value[question.label] = {
          value: question.data_type === "bool" ? false : null,
          comment: "",
        };
      }
      showComment.value[question.label] = false;
    });
  },
  { immediate: true },
);

function exampleFor(dt) {
  switch (dt) {
    case "int":
      return "0";
    case "float":
      return "0.0";
    case "string":
      return "...";
    default:
      return "";
  }
}

function validate() {
  errors.value = {};

  for (const q of props.questionnaire.schema.questions) {
    const entry = answers.value[q.label];
    const errs = {};

    if (q.type === "bilateral") {
      if (!entry.value.OD && entry.value.OD !== 0) errs.OD = true;
      if (!entry.value.OI && entry.value.OI !== 0) errs.OI = true;
    } else {
      if (q.data_type !== "bool" && !entry.value && entry.value !== 0) {
        errs.value = true;
      }
    }

    if (Object.keys(errs).length) {
      errors.value[q.label] = errs;
    }
  }

  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (!validate()) return;

  const payload = {
    cuestionario_id: props.questionnaire.id,
    respuestas: JSON.parse(JSON.stringify(answers.value)),
  };

  emit("save", payload);
  visible.value = false;
}

function close() {
  visible.value = false;
}

// Accordion animation
function startAccordion(el) {
  el.style.height = el.scrollHeight + "px";
}
function endAccordion(el) {
  el.style.height = "";
}
</script>

<style scoped>
/* Checkbox resize */
:deep(.p-checkbox),
:deep(.p-checkbox-box) {
  width: 1.1rem;
  height: 1.1rem;
}

/* Accordion */
.comment-wrapper {
  overflow: hidden;
  transition: height 0.3s ease;
}
.comment-content {
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid var(--surface-border);
}
.accordion-enter-active,
.accordion-leave-active {
  transition: height 0.3s ease;
}
.accordion-enter-from,
.accordion-leave-to {
  height: 0 !important;
}
</style>
