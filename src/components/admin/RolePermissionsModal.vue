<template>
  <SmallModal v-model:modelValue="visible" :title="title" :width="width">
    <div class="flex flex-column gap-3">
      <div class="text-sm text-color-secondary">
        Rol:
        <span class="font-medium">{{ currentRole?.nombre }}</span>
      </div>

      <MultiSelect
        v-model="localSelected"
        :options="permissions"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Selecciona permisos"
        display="chip"
        class="w-full"
      />

      <div class="flex justify-content-end gap-2">
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="$emit('close')"
        />
        <Button label="Guardar" icon="pi pi-save" @click="onSave" />
      </div>
    </div>
  </SmallModal>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import SmallModal from "@/components/SmallModal.vue";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: "Permisos del Rol" },
  width: { type: String, default: "32rem" },
  currentRole: { type: Object, default: null },
  permissions: { type: Array, default: () => [] },
  selected: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "save", "close"]);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const localSelected = ref([...props.selected]);

watch(
  () => props.selected,
  (v) => {
    localSelected.value = [...v];
  },
);

function onSave() {
  emit("save", localSelected.value);
  emit("update:modelValue", false);
}
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
