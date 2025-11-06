<template>
  <Card>
    <template #title>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-exclamation-triangle text-orange-500"></i>
        <span>Exámenes Críticos</span>
      </div>
    </template>
    <template #content>
      <div v-if="loading" class="flex justify-content-center p-4">
        <ProgressSpinner style="width: 50px; height: 50px" />
      </div>
      <div v-else-if="error" class="text-center">
        <Message severity="error" :closable="false">{{ error }}</Message>
      </div>
      <div v-else>
        <DataTable :value="exams" :rows="5" paginator v-if="exams.length > 0">
          <Column header="Paciente">
            <template #body="{ data }">
              <router-link 
                :to="`/app/patients/${data.paciente_id}`" 
                class="patient-link"
              >
                {{ data.nombre_paciente }}
              </router-link>
            </template>
          </Column>
          <Column field="tipo" header="Tipo" />
          <Column header="Estado">
            <template #body="{ data }">
              <Tag 
                v-if="data.days_overdue > 0" 
                severity="danger" 
                :value="`Vencido ${data.days_overdue}d`"
              />
              <Tag 
                v-else-if="data.fecha" 
                severity="warning" 
                :value="formatDate(data.fecha)"
              />
              <Tag v-else severity="info" value="Sin fecha" />
            </template>
          </Column>
          <Column header="Teléfono">
            <template #body="{ data }">
              {{ data.telefono_paciente || '-' }}
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-center text-500 p-4">
          No hay exámenes críticos pendientes
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { DashboardService } from '@/services/dashboardService'

const exams = ref([])
const loading = ref(false)
const error = ref(null)

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

async function loadCriticalExams() {
  loading.value = true
  error.value = null
  try {
    exams.value = await DashboardService.getCriticalExams(10)
  } catch (e) {
    error.value = 'Error al cargar exámenes críticos'
    console.error('Error loading critical exams:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCriticalExams()
})
</script>

<style scoped>
.patient-link {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.patient-link:hover {
  text-decoration: underline;
}
</style>
