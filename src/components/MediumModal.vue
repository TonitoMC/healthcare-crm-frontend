<template>
  <Dialog
    v-model:visible="inner"
    modal
    :header="header"
    class="w-full sm:w-25rem md:w-30rem lg:w-35rem"
  >
    <div class="p-3 flex flex-column gap-3 text-xs md:text-sm">
      <slot />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, required: true },
  header: { type: String, default: "Modal" },
});
const emit = defineEmits(["update:visible"]);

const inner = ref(props.visible);
watch(
  () => props.visible,
  (v) => (inner.value = v),
);
watch(inner, (v) => emit("update:visible", v));
</script>

<style scoped>
.p-dialog .p-dialog-content {
  padding: 1rem !important;
}
</style>
