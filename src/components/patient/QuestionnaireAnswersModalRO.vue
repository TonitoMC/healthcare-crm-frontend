<template>
  <Dialog
    v-model:visible="visible"
    modal
    :pt="{
      root: 'border-round-xl overflow-hidden',
      header: 'bg-primary text-primary-contrast px-4 py-3',
      content: 'px-0 py-0',
    }"
    :style="{ width: '48rem', maxWidth: '95vw', height: '80vh' }"
  >
    <!-- HEADER -->
    <template #header>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-file text-xl"></i>
        <h2 class="m-0 text-lg font-semibold">
          {{ questionnaire.nombre }} — Respuestas
        </h2>
      </div>
    </template>

    <!-- BODY -->
    <ScrollPanel
      style="height: calc(80vh - 10rem)"
      class="px-4 py-3 overflow-x-hidden"
    >
      <div v-if="questionnaire" class="flex flex-column gap-3">
        <div
          v-for="(q, i) in questionnaire.schema.questions"
          :key="i"
          class="border-1 surface-border border-round-lg p-3 surface-card"
        >
          <div class="font-semibold text-sm mb-2 text-900">
            {{ q.label }}
          </div>

          <!-- BILATERAL -->
          <div v-if="q.type === 'bilateral'" class="flex gap-4">
            <!-- Number/string -->
            <template v-if="isNumberOrFloat(q)">
              <div class="text-sm">
                <span class="font-semibold text-600">OI: </span>
                {{ answers[q.label]?.value?.OI ?? "—" }}
              </div>

              <div class="text-sm">
                <span class="font-semibold text-600">OD: </span>
                {{ answers[q.label]?.value?.OD ?? "—" }}
              </div>
            </template>

            <!-- Text bilateral -->
            <template v-else>
              <div class="text-sm">
                <span class="font-semibold text-600">OI: </span>
                {{ answers[q.label]?.value?.OI ?? "—" }}
              </div>

              <div class="text-sm">
                <span class="font-semibold text-600">OD: </span>
                {{ answers[q.label]?.value?.OD ?? "—" }}
              </div>
            </template>
          </div>

          <!-- UNILATERAL -->
          <div v-else class="text-sm">
            <!-- Bool -->
            <div v-if="q.data_type === 'bool'">
              <span class="font-semibold text-600">Respuesta: </span>
              {{ answers[q.label]?.value ? "Sí" : "No" }}
            </div>

            <!-- Number / Text -->
            <div v-else>
              <span class="font-semibold text-600">Respuesta: </span>
              {{ answers[q.label]?.value ?? "—" }}
            </div>
          </div>

          <!-- COMMENT -->
          <div
            v-if="answers[q.label]?.comment"
            class="mt-2 pt-2 border-top-1 surface-border text-sm"
          >
            <span class="font-semibold text-600">Comentario: </span>
            {{ answers[q.label].comment }}
          </div>
        </div>
      </div>
    </ScrollPanel>

    <!-- FOOTER -->
    <div
      class="flex justify-content-end gap-2 pt-3 pb-3 px-4 border-top-1 surface-border"
    >
      <Button
        label="Cerrar"
        text
        severity="secondary"
        size="small"
        @click="close"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import ScrollPanel from "primevue/scrollpanel";
import Button from "primevue/button";

const props = defineProps({
  visible: Boolean,
  questionnaire: Object, // same object as writable modal
  answers: Object, // pre-loaded JSON answers from DB
});

const emit = defineEmits(["update:visible"]);

const visible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
});

function close() {
  visible.value = false;
}

function isNumberOrFloat(q) {
  return q.data_type === "int" || q.data_type === "float";
}
</script>
