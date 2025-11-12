<template>
  <Dialog
    v-model:visible="visible"
    header="Nuevo Examen"
    modal
    :closable="!loading"
    style="width: 450px"
    :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
  >
    <div class="flex flex-column gap-3 p-1">
      <!-- 👤 Patient Name -->
      <div class="flex flex-column">
        <label class="text-sm text-color-secondary mb-1">Paciente</label>
        <InputText :value="patientName" readonly class="w-full" />
      </div>

      <!-- 📅 Date -->
      <div class="flex flex-column">
        <label class="text-sm text-color-secondary mb-1">Fecha</label>
        <InputText :value="today" readonly class="w-full" />
      </div>

      <!-- 🧪 Exam Type -->
      <div class="flex flex-column">
        <label class="text-sm text-color-secondary mb-1">Tipo de examen</label>
        <InputText
          v-model="examType"
          placeholder="Ej: Tonometría, Paquimetría..."
          class="w-full"
        />
      </div>

      <!-- Buttons -->
      <div class="flex justify-content-end gap-2 mt-3">
        <Button label="Cancelar" text @click="close" :disabled="loading" />
        <Button
          label="Crear"
          icon="pi pi-check"
          :loading="loading"
          @click="createExam"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { ExamService } from "@/services/examService";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  patientId: { type: Number, required: true },
  patientName: { type: String, required: true },
});

const emit = defineEmits(["update:modelValue", "created"]);

const visible = ref(props.modelValue);
const examType = ref("");
const loading = ref(false);
const toast = useToast();

// Keep v-model synced
watch(
  () => props.modelValue,
  (val) => (visible.value = val),
);
watch(visible, (val) => emit("update:modelValue", val));

const today = computed(() => {
  const d = new Date();
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

function close() {
  examType.value = "";
  visible.value = false;
}

async function createExam() {
  if (!examType.value.trim()) return;

  try {
    loading.value = true;
    await ExamService.create({
      paciente_id: props.patientId,
      tipo: examType.value.trim(),
    });

    toast.add({
      severity: "success",
      summary: "Examen creado",
      detail: `Se creó un nuevo examen para ${props.patientName}`,
      life: 3000,
    });

    emit("created"); // parent can reload list
    close();
  } catch (error) {
    console.error("Error creating exam:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo crear el examen.",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}
</script>
