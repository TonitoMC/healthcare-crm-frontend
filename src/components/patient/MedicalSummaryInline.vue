<template>
  <div class="flex flex-column h-full w-full min-h-0">
    <!-- Header -->
    <div class="flex align-items-center gap-2 mt-2 mb-1">
      <h3 class="m-0 text-base font-semibold line-height-1">Antecedentes</h3>
      <Button
        icon="pi pi-pencil"
        text
        rounded
        size="small"
        class="p-0"
        @click="$emit('edit')"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-sm text-color-secondary shrink-0">
      <i class="pi pi-spin pi-spinner mr-2"></i>Cargando...
    </div>

    <!-- No data -->
    <div
      v-else-if="!hasAnyData"
      class="text-sm text-color-secondary italic shrink-0"
    >
      Sin antecedentes registrados
    </div>

    <!-- ✅ Simple flex layout -->
    <div
      v-else
      class="flex flex-wrap justify-content-between align-content-start text-sm flex-1 min-h-0 overflow-auto w-full"
      style="row-gap: 0.5rem; column-gap: 1rem"
    >
      <div v-if="record.medicos" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Médicos: </span>
        <span>{{ record.medicos }}</span>
      </div>

      <div v-if="record.familiares" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Familiares: </span>
        <span>{{ record.familiares }}</span>
      </div>

      <div v-if="record.oculares" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Oculares: </span>
        <span>{{ record.oculares }}</span>
      </div>

      <div v-if="record.alergicos" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Alérgicos: </span>
        <span>{{ record.alergicos }}</span>
      </div>

      <div v-if="record.otros" class="flex align-items-start gap-1">
        <span class="font-semibold text-color-secondary">Otros: </span>
        <span>{{ record.otros }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Button from "primevue/button";

const props = defineProps({
  record: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit"]);

const hasAnyData = computed(() => {
  const r = props.record || {};
  const filled = (v) => typeof v === "number" || (v && String(v).trim() !== "");
  return (
    filled(r.medicos) ||
    filled(r.familiares) ||
    filled(r.oculares) ||
    filled(r.alergicos) ||
    filled(r.otros)
  );
});
</script>

<style scoped>
.line-height-1 {
  line-height: 1;
}
</style>
