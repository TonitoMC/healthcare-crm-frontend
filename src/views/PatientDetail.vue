<template>
  <div v-if="loading" class="flex justify-content-center align-items-center" style="min-height: 400px">
    <ProgressSpinner />
  </div>
  <div v-else-if="error" class="p-4">
    <Message severity="error" :closable="false">{{ error }}</Message>
  </div>
  <div v-else class="patient-detail-view p-4">
    <div class="grid">
      <!-- Left Sidebar (Medical History) -->
      <div class="col-12 xl:col-3 lg:col-4">
        <MedicalHistorySidebar :patient-id="patientId" />
      </div>

      <!-- Main Content -->
      <div class="col-12 xl:col-9 lg:col-8">
        <PatientHeader 
          :patient="patient" 
          @edit="handleEdit" 
          @viewHistory="handleViewHistory" 
        />
        
        <ConsultationManager :patient-id="patientId" />
        
        <ExamsSection :patient-id="patientId" />
      </div>
    </div>
  </div>

  <!-- Edit Patient Dialog -->
  <Dialog v-model:visible="showEditDialog" header="Editar Paciente" :modal="true" style="width: 500px">
    <div class="flex flex-column gap-3">
      <div>
        <label class="block mb-2">Nombre</label>
        <InputText v-model="editForm.nombre" class="w-full" />
      </div>
      <div>
        <label class="block mb-2">Teléfono</label>
        <InputText v-model="editForm.telefono" class="w-full" />
      </div>
      <div>
        <label class="block mb-2">Fecha de Nacimiento</label>
        <Calendar v-model="editForm.fecha_nacimiento" dateFormat="yy-mm-dd" class="w-full" />
      </div>
      <div>
        <label class="block mb-2">Sexo</label>
        <Dropdown 
          v-model="editForm.sexo" 
          :options="['M', 'F']" 
          placeholder="Seleccionar"
          class="w-full"
        />
      </div>
      <div class="flex gap-2 justify-content-end">
        <Button label="Cancelar" severity="secondary" @click="showEditDialog = false" />
        <Button label="Guardar" @click="savePatient" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import PatientHeader from '../components/patient/PatientHeader.vue'
import MedicalHistorySidebar from '../components/patient/MedicalHistorySidebar.vue'
import ConsultationManager from '../components/patient/ConsultationManager.vue'
import ExamsSection from '../components/patient/ExamsSection.vue'
import { usePatientData } from '../composables/usePatientData'

const route = useRoute()
const patientId = ref(parseInt(route.params.id))

const { patient, loading, error, loadPatient, updatePatient } = usePatientData()

const showEditDialog = ref(false)
const editForm = ref({
  nombre: '',
  telefono: '',
  fecha_nacimiento: null,
  sexo: ''
})

function handleEdit() {
  editForm.value = {
    nombre: patient.value.nombre,
    telefono: patient.value.telefono,
    fecha_nacimiento: patient.value.fecha_nacimiento ? new Date(patient.value.fecha_nacimiento) : null,
    sexo: patient.value.sexo
  }
  showEditDialog.value = true
}

function handleViewHistory() {
  // Scroll to medical history sidebar or highlight it
  const sidebar = document.querySelector('.col-12.lg\\:col-4')
  if (sidebar) {
    sidebar.scrollIntoView({ behavior: 'smooth' })
  }
}

async function savePatient() {
  const updateData = {
    ...editForm.value,
    fecha_nacimiento: editForm.value.fecha_nacimiento?.toISOString().split('T')[0]
  }
  await updatePatient(patientId.value, updateData)
  showEditDialog.value = false
}

onMounted(async () => {
  await loadPatient(patientId.value)
})
</script>

<style scoped>
.patient-detail-view {
  /* Usa todo el ancho disponible con padding responsivo */
  width: 100%;
  max-width: 100%;
}

/* Ajuste de scroll suave en toda la vista */
:deep(.p-component) {
  max-width: 100%;
}
</style>
