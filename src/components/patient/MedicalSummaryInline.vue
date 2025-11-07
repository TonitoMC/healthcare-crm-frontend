<template>
  <div class="flex flex-column gap-2 w-full">
    <div class="flex justify-content-between align-items-center">
      <h3 class="m-0 text-base font-semibold">Antecedentes</h3>
      <Button
        icon="pi pi-pencil"
        text
        rounded
        size="small"
        @click="$emit('edit')"
      />
    </div>

    <div v-if="loading" class="text-sm text-color-secondary">
      <i class="pi pi-spin pi-spinner mr-2"></i>Cargando...
    </div>

    <div v-else-if="!hasAnyData" class="text-sm text-color-secondary italic">
      Sin antecedentes registrados
    </div>

    <div v-else class="flex flex-wrap gap-2 text-sm">
      <div v-if="record.medicos">
        <span class="font-semibold text-color-secondary">Médicos:</span>
        <span> {{ record.medicos }}</span>
      </div>
      <div v-if="record.familiares">
        <span class="font-semibold text-color-secondary">Familiares:</span>
        <span> {{ record.familiares }}</span>
      </div>
      <div v-if="record.alergicos">
        <span class="font-semibold text-color-secondary">Alérgicos:</span>
        <span> {{ record.alergicos }}</span>
      </div>
      <div v-if="record.otros">
        <span class="font-semibold text-color-secondary">Otros:</span>
        <span> {{ record.otros }}</span>
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
  const r = props.record;
  return (
    r && (r.medicos || r.familiares || r.oculares || r.alergicos || r.otros)
  );
});
</script>
