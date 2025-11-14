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
    <!-- HEADER -->
    <template #header>
      <div class="flex align-items-center gap-3 w-full">
        <i class="pi pi-file-edit text-3xl"></i>

        <div class="flex flex-column flex-1">
          <h2 class="m-0 text-2xl font-semibold">
            {{ questionnaire?.nombre || "Cuestionario" }}
          </h2>

          <div class="flex gap-2 mt-2 flex-wrap">
            <Tag
              :value="`Versión ${questionnaire?.version}`"
              class="bg-white-alpha-30"
            />

            <Tag
              :value="questionnaire?.activo ? 'Activo' : 'Inactivo'"
              :severity="questionnaire?.activo ? 'success' : 'danger'"
              :icon="
                questionnaire?.activo
                  ? 'pi pi-check-circle'
                  : 'pi pi-times-circle'
              "
            />
          </div>
        </div>
      </div>
    </template>

    <!-- EMPTY STATE -->
    <div
      v-if="!questionnaire?.questions || questionnaire.questions.length === 0"
      class="text-center py-6"
    >
      <i class="pi pi-info-circle text-6xl text-400 mb-3"></i>
      <p class="text-color-secondary text-lg m-0">
        No se encontraron preguntas para este cuestionario
      </p>
    </div>

    <!-- QUESTION LIST -->
    <div v-else class="flex flex-column gap-3">
      <!-- Section header -->
      <div class="mb-2">
        <h3 class="text-lg font-semibold flex align-items-center gap-2 mb-3">
          <i class="pi pi-list text-primary"></i>
          Preguntas del Cuestionario
          <Tag
            :value="`${questionnaire.questions.length} preguntas`"
            severity="info"
          />
        </h3>
      </div>

      <!-- QUESTIONS -->
      <div
        v-for="question in normalizedQuestions"
        :key="question.order"
        class="surface-card border-round-lg p-4 shadow-1 border-1 surface-border"
      >
        <div class="flex align-items-center gap-3">
          <!-- NUMBER BUBBLE -->
          <div
            class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle flex-shrink-0"
            style="width: 2.5rem; height: 2.5rem"
          >
            <span class="font-bold">{{ question.order }}</span>
          </div>

          <!-- TEXT -->
          <div class="flex flex-column justify-content-center flex-1">
            <h4 class="font-semibold text-lg m-0 text-color">
              {{ question.label }}
            </h4>

            <div class="flex gap-2 flex-wrap mt-1">
              <Tag
                :value="getQuestionTypeLabel(question.type)"
                :severity="getTypeSeverity(question.type)"
                icon="pi pi-tag"
                class="text-xs"
              />

              <Tag
                v-if="question.bilateral"
                value="Bilateral"
                severity="warning"
                icon="pi pi-arrows-h"
                class="text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cerrar" icon="pi pi-times" text @click="show = false" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Tag from "primevue/tag";

const props = defineProps({
  visible: Boolean,
  questionnaire: Object,
});

const emit = defineEmits(["update:visible"]);

const show = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

/* ---------------------------------------------------------
   NORMALIZATION: Fixes the “type not loading correctly” issue
--------------------------------------------------------- */
const normalizedQuestions = computed(() => {
  if (!props.questionnaire?.questions) return [];

  return props.questionnaire.questions.map((q) => {
    const rawType = (q.data_type || q.type || "").toString().toLowerCase();

    // Map weird backend labels into one unified internal type
    const normalized =
      {
        int: "entero",
        integer: "entero",
        entero: "entero",

        float: "float",
        decimal: "float",

        bool: "booleano",
        boolean: "booleano",
        booleano: "booleano",

        string: "texto",
        text: "texto",
        texto: "texto",
      }[rawType] ||
      rawType ||
      "texto";

    return {
      order: q.order,
      label: q.label || q.name,
      type: normalized,
      bilateral: q.type === "bilateral" || q.bilateral === true,
    };
  });
});

/* ---------------------------------------------------------
   Tag Type Translations
--------------------------------------------------------- */
const getQuestionTypeLabel = (type) => {
  const labels = {
    entero: "Número",
    float: "Decimal",
    texto: "Texto",
    booleano: "Sí/No",
  };
  return labels[type] || type || "Texto";
};

const getTypeSeverity = (type) => {
  const sev = {
    entero: "info",
    float: "info",
    texto: "success",
    booleano: "warning",
  };
  return sev[type] || "secondary";
};
</script>

<style scoped>
:deep(.p-dialog-header) {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-tag) {
  font-weight: 600;
}
</style>
