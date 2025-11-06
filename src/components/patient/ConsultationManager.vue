<template>
  <Card class="mb-4">
    <template #title>Consultas</template>
    <template #content>
      <!-- New Consultation Form -->
      <div class="mb-4 p-3 border-1 border-round surface-border">
        <h4 class="text-lg font-semibold mb-3">Nueva Consulta</h4>
        <div class="flex gap-2">
          <InputText 
            v-model="newMotivo" 
            placeholder="Motivo de consulta" 
            class="flex-1"
          />
          <Button label="Crear" icon="pi pi-plus" @click="createNewConsultation" />
        </div>
      </div>

      <!-- Consultation List -->
      <DataTable 
        :value="consultations" 
        :rows="5" 
        paginator
        @row-click="openDetail"
        selectionMode="single"
        class="cursor-pointer"
      >
        <Column field="motivo" header="Motivo" />
        <Column field="fecha" header="Fecha">
          <template #body="{ data }">
            {{ new Date(data.fecha).toLocaleDateString() }}
          </template>
        </Column>
        <Column field="completada" header="Estado">
          <template #body="{ data }">
            <Tag :severity="data.completada ? 'success' : 'warning'" :value="data.completada ? 'Completada' : 'Pendiente'" />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <!-- Consultation Detail Dialog -->
  <Dialog 
    v-model:visible="showDetailDialog" 
    header="Detalle de Consulta" 
    :modal="true" 
    style="width: 600px"
  >
    <div v-if="currentConsultation" class="flex flex-column gap-3">
      <div>
        <label class="font-semibold">Motivo:</label>
        <p>{{ currentConsultation.motivo }}</p>
      </div>
      <div>
        <label class="font-semibold">Fecha:</label>
        <p>{{ new Date(currentConsultation.fecha).toLocaleString() }}</p>
      </div>
      <div>
        <label class="font-semibold">Estado:</label>
        <Tag 
          :severity="currentConsultation.completada ? 'success' : 'warning'" 
          :value="currentConsultation.completada ? 'Completada' : 'Pendiente'" 
        />
      </div>
      <div v-if="!currentConsultation.completada" class="flex gap-2 justify-content-end">
        <Button 
          label="Marcar como Completada" 
          icon="pi pi-check" 
          @click="markAsComplete" 
          severity="success"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { useConsultationManager } from '../../composables/useConsultationManager'

const props = defineProps({
  patientId: { type: Number, required: true }
})

const { 
  consultations, 
  currentConsultation, 
  loadConsultations, 
  createConsultation, 
  markComplete 
} = useConsultationManager()

const showDetailDialog = ref(false)
const newMotivo = ref('')

async function createNewConsultation() {
  if (!newMotivo.value.trim()) return
  await createConsultation({ paciente_id: props.patientId, motivo: newMotivo.value })
  newMotivo.value = ''
}

function openDetail(event) {
  currentConsultation.value = event.data
  showDetailDialog.value = true
}

async function markAsComplete() {
  await markComplete(currentConsultation.value.id, props.patientId)
  showDetailDialog.value = false
}

loadConsultations(props.patientId)
</script>

<style scoped>
.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
}
</style>
