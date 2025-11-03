<template>
  <SmallModal v-model:modelValue="visible" :title="title" :width="width">
    <div class="flex flex-column gap-3">
      <div>{{ message }}</div>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancelar" severity="secondary" outlined @click="$emit('close')" />
        <Button label="Eliminar" severity="danger" icon="pi pi-trash" @click="$emit('confirm')" />
      </div>
    </div>
  </SmallModal>
</template>

<script setup>
import SmallModal from '@/components/SmallModal.vue';
import Button from 'primevue/button';
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Confirmar' },
  width: { type: String, default: '26rem' },
  message: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'close']);

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
});
</script>

<style scoped></style>
