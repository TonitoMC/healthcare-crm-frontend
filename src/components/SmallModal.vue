<template>
  <Dialog
    :visible="modelValue"
    @update:visible="emit('update:modelValue', $event)"
    :header="title"
    modal
    :style="computedStyle"
    :breakpoints="breakpoints"
    :dismissableMask="dismissableMask"
    :closable="closable"
  >
    <div class="p-3 flex flex-column gap-3">
      <slot />
    </div>
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import Dialog from "primevue/dialog";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: "" },
  width: { type: String, default: "30rem" },
  maxWidth: { type: String, default: "95vw" },
  dismissableMask: { type: Boolean, default: true },
  closable: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue"]);

const computedStyle = computed(() => ({
  width: props.width,
  maxWidth: props.maxWidth,
}));

const breakpoints = {
  "960px": { width: "90vw" },
  "640px": { width: "95vw" },
};
</script>

<style scoped>
:deep(.p-dialog) {
  border-radius: 1rem;
}

:deep(.p-dialog-content) {
  padding: 1.25rem;
}
</style>
