<template>
  <SmallModal v-model="visible" title="Detalles y Subir Documento de Examen">
    <form class="flex flex-column gap-3" @submit.prevent="onSubmit">
      <!-- 📋 Tipo de examen -->
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-color-secondary">
          Tipo de Examen
        </label>
        <p class="m-0 font-medium text-color">
          {{ exam?.examType || "—" }}
        </p>
      </div>

      <!-- 👩‍⚕️ Paciente -->
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-color-secondary">
          Paciente
        </label>
        <p class="m-0 font-medium text-color">
          {{ exam?.patient || "—" }}
        </p>
      </div>

      <!-- 📄 Documento -->
      <div class="flex flex-column gap-2">
        <label class="text-sm font-medium text-color-secondary">
          Documento del Examen
        </label>

        <FileUpload
          mode="basic"
          name="file"
          chooseLabel="Seleccionar Archivo"
          customUpload
          accept=".pdf"
          @select="onFileSelect"
          class="p-button-sm w-max"
        />
      </div>

      <!-- 🧾 Submit -->
      <div class="flex justify-content-end pt-2">
        <Button
          type="submit"
          label="Guardar"
          icon="pi pi-check"
          :disabled="!file"
        />
      </div>
    </form>
  </SmallModal>
</template>

<script setup>
import { ref, watch } from "vue";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import SmallModal from "@components/SmallModal.vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  exam: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "uploaded"]);

const visible = ref(props.modelValue);
const file = ref(null);
const fileName = ref("");

// Sync with parent visibility
watch(
  () => props.modelValue,
  (val) => (visible.value = val),
);
watch(visible, (val) => emit("update:modelValue", val));

// Handle file select
const onFileSelect = (event) => {
  file.value = event.files?.[0] || null;
  fileName.value = file.value?.name || "";
};

// Handle form submit
const onSubmit = () => {
  if (!file.value) return;

  // Simulate upload success
  toast.add({
    severity: "success",
    summary: "Archivo subido correctamente",
    detail: fileName.value,
    life: 3000,
  });

  emit("uploaded", { exam: props.exam, file: file.value });
  visible.value = false;
  file.value = null;
  fileName.value = "";
};
</script>

<style scoped>
.w-max {
  width: max-content;
}
</style>
