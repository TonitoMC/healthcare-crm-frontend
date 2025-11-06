<template>
  <Card class="mb-4">
    <template #title>
      <div class="flex justify-content-between align-items-center">
        <span>Exámenes</span>
        <Button icon="pi pi-plus" label="Nuevo" @click="showCreateDialog = true" size="small" />
      </div>
    </template>
    <template #content>
      <!-- Pending Exams -->
      <div class="mb-4">
        <h4 class="text-lg font-semibold mb-2">Pendientes</h4>
        <DataTable :value="pendingExams" :rows="5" paginator>
          <Column field="tipo" header="Tipo" />
          <Column field="fecha" header="Fecha">
            <template #body="{ data }">
              {{ data.fecha ? new Date(data.fecha).toLocaleDateString() : 'Sin fecha' }}
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="{ data }">
              <Button icon="pi pi-upload" size="small" text @click="openUploadDialog(data)" />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Completed Exams -->
      <div>
        <h4 class="text-lg font-semibold mb-2">Completados</h4>
        <DataTable :value="completedExams" :rows="5" paginator>
          <Column field="tipo" header="Tipo" />
          <Column field="fecha" header="Fecha">
            <template #body="{ data }">
              {{ new Date(data.fecha).toLocaleDateString() }}
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="{ data }">
              <Button icon="pi pi-file-pdf" size="small" text @click="viewPdf(data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </Card>

  <!-- Create Dialog -->
  <Dialog v-model:visible="showCreateDialog" header="Nuevo Examen" :modal="true" style="width: 400px">
    <div class="flex flex-column gap-3">
      <InputText v-model="newExamTipo" placeholder="Tipo de examen" />
      <Button label="Crear" @click="createExam" />
    </div>
  </Dialog>

  <!-- Upload Dialog -->
  <Dialog v-model:visible="showUploadDialog" header="Subir PDF" :modal="true" style="width: 400px">
    <div class="flex flex-column gap-3">
      <FileUpload mode="basic" accept="application/pdf" :maxFileSize="10000000" @select="handleFileSelect" />
      <Button label="Subir" :disabled="!selectedFile" @click="uploadFile" />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import FileUpload from 'primevue/fileupload'
import { useExamHandler } from '../../composables/useExamHandler'

const props = defineProps({
  patientId: { type: Number, required: true }
})

const { exams, createExam: createExamService, uploadPdf, loadExams } = useExamHandler()

const showCreateDialog = ref(false)
const showUploadDialog = ref(false)
const newExamTipo = ref('')
const selectedFile = ref(null)
const currentExam = ref(null)

const pendingExams = computed(() => exams.value.filter(e => e.estado === 'PENDIENTE'))
const completedExams = computed(() => exams.value.filter(e => e.estado === 'COMPLETADO'))

async function createExam() {
  await createExamService({ paciente_id: props.patientId, tipo: newExamTipo.value })
  showCreateDialog.value = false
  newExamTipo.value = ''
}

function openUploadDialog(exam) {
  currentExam.value = exam
  showUploadDialog.value = true
}

function handleFileSelect(event) {
  selectedFile.value = event.files[0]
}

async function uploadFile() {
  if (!selectedFile.value) {
    return
  }

  try {
    await uploadPdf(currentExam.value.id, selectedFile.value)
    await loadExams(props.patientId)
    showUploadDialog.value = false
    selectedFile.value = null
  } catch (error) {
    console.error('Error uploading file:', error)
  }
}

async function viewPdf(exam) {
  try {
    // Get the JWT token from localStorage
    const savedAuth = localStorage.getItem('jwt')
    if (!savedAuth) {
      console.error('No authentication token found')
      return
    }
    
    const { token } = JSON.parse(savedAuth)
    
    // Fetch the PDF with authentication
    const response = await fetch(`http://localhost:8080/api/exams/${exam.id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to download PDF')
    }
    
    // Create a blob from the response
    const blob = await response.blob()
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob)
    
    // Open in new tab
    window.open(url, '_blank')
    
    // Clean up the URL after a delay
    setTimeout(() => window.URL.revokeObjectURL(url), 100)
  } catch (error) {
    console.error('Error viewing PDF:', error)
  }
}

loadExams(props.patientId)
</script>
