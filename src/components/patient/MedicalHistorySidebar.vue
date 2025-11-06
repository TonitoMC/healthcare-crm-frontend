<template>
  <Card class="medical-sidebar h-full">
    <template #title>
      <div class="flex justify-content-between align-items-center">
        <span class="text-lg">Antecedentes Médicos</span>
        <Button 
          icon="pi pi-pencil" 
          text 
          rounded 
          size="small"
          @click="editModalVisible = true" 
        />
      </div>
    </template>
    <template #content>
      <div v-if="loading" class="text-center py-4">
        <i class="pi pi-spin pi-spinner text-2xl"></i>
      </div>
      <div v-else-if="medicalRecord" class="flex flex-column gap-3">
        <div v-if="medicalRecord.medicos">
          <div class="font-semibold text-sm text-color-secondary mb-1">Médicos</div>
          <p class="m-0 text-sm">{{ medicalRecord.medicos }}</p>
        </div>
        <div v-if="medicalRecord.familiares">
          <div class="font-semibold text-sm text-color-secondary mb-1">Familiares</div>
          <p class="m-0 text-sm">{{ medicalRecord.familiares }}</p>
        </div>
        <div v-if="medicalRecord.oculares">
          <div class="font-semibold text-sm text-color-secondary mb-1">Oculares</div>
          <p class="m-0 text-sm">{{ medicalRecord.oculares }}</p>
        </div>
        <div v-if="medicalRecord.alergicos">
          <div class="font-semibold text-sm text-color-secondary mb-1">Alérgicos</div>
          <p class="m-0 text-sm">{{ medicalRecord.alergicos }}</p>
        </div>
        <div v-if="medicalRecord.otros">
          <div class="font-semibold text-sm text-color-secondary mb-1">Otros</div>
          <p class="m-0 text-sm">{{ medicalRecord.otros }}</p>
        </div>
        <div v-if="!hasAnyData" class="text-color-secondary text-sm text-center py-3">
          Sin antecedentes registrados
        </div>
      </div>
    </template>
  </Card>

  <Dialog v-model:visible="editModalVisible" header="Editar Antecedentes" modal :style="{ width: '32rem' }">
    <div class="flex flex-column gap-3">
      <div>
        <label class="text-sm font-medium mb-2 block">Médicos</label>
        <textarea v-model="form.medicos" rows="2" class="p-inputtextarea p-inputtext w-full" />
      </div>
      <div>
        <label class="text-sm font-medium mb-2 block">Familiares</label>
        <textarea v-model="form.familiares" rows="2" class="p-inputtextarea p-inputtext w-full" />
      </div>
      <div>
        <label class="text-sm font-medium mb-2 block">Oculares</label>
        <textarea v-model="form.oculares" rows="2" class="p-inputtextarea p-inputtext w-full" />
      </div>
      <div>
        <label class="text-sm font-medium mb-2 block">Alérgicos</label>
        <textarea v-model="form.alergicos" rows="2" class="p-inputtextarea p-inputtext w-full" />
      </div>
      <div>
        <label class="text-sm font-medium mb-2 block">Otros</label>
        <textarea v-model="form.otros" rows="2" class="p-inputtextarea p-inputtext w-full" />
      </div>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancelar" severity="secondary" outlined @click="editModalVisible = false" />
        <Button label="Guardar" @click="saveChanges" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  medicalRecord: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  patientId: { type: Number, required: true },
});

const emit = defineEmits(["update"]);

const toast = useToast();
const editModalVisible = ref(false);
const form = ref({
  medicos: null,
  familiares: null,
  oculares: null,
  alergicos: null,
  otros: null,
});

const hasAnyData = computed(() => {
  const rec = props.medicalRecord;
  return rec && (rec.medicos || rec.familiares || rec.oculares || rec.alergicos || rec.otros);
});

watch(() => props.medicalRecord, (newVal) => {
  if (newVal) {
    form.value = {
      medicos: newVal.medicos || null,
      familiares: newVal.familiares || null,
      oculares: newVal.oculares || null,
      alergicos: newVal.alergicos || null,
      otros: newVal.otros || null,
    };
  }
}, { immediate: true });

async function saveChanges() {
  emit("update", form.value);
  editModalVisible.value = false;
}
</script>
