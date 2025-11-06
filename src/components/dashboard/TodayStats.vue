<template>
  <Card>
    <template #title>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-chart-line text-primary"></i>
        <span>Estadísticas del Día</span>
      </div>
    </template>
    <template #content>
      <div v-if="loading" class="flex justify-content-center p-4">
        <ProgressSpinner style="width: 50px; height: 50px" />
      </div>
      <div v-else-if="error" class="text-center">
        <Message severity="error" :closable="false">{{ error }}</Message>
      </div>
      <div v-else class="grid">
        <div class="col-12 md:col-4">
          <div class="stat-card p-3 border-round surface-border" style="border-left: 4px solid var(--primary-color)">
            <div class="flex align-items-center justify-content-between">
              <div>
                <div class="text-500 font-medium mb-2">Citas Programadas</div>
                <div class="text-900 text-4xl font-bold">{{ stats.total_appointments_today }}</div>
              </div>
              <i class="pi pi-calendar text-4xl text-primary"></i>
            </div>
          </div>
        </div>
        
        <div class="col-12 md:col-4">
          <div class="stat-card p-3 border-round surface-border" style="border-left: 4px solid var(--orange-500)">
            <div class="flex align-items-center justify-content-between">
              <div>
                <div class="text-500 font-medium mb-2">Exámenes Pendientes</div>
                <div class="text-900 text-4xl font-bold">{{ stats.pending_exams_total }}</div>
              </div>
              <i class="pi pi-file-pdf text-4xl text-orange-500"></i>
            </div>
          </div>
        </div>
        
        <div class="col-12 md:col-4">
          <div class="stat-card p-3 border-round surface-border" style="border-left: 4px solid var(--green-500)">
            <div class="flex align-items-center justify-content-between">
              <div>
                <div class="text-500 font-medium mb-2">Citas Completadas</div>
                <div class="text-900 text-4xl font-bold">{{ stats.completed_appointments }}</div>
              </div>
              <i class="pi pi-check-circle text-4xl text-green-500"></i>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { DashboardService } from '@/services/dashboardService'

const stats = ref({ total_appointments_today: 0, pending_exams_total: 0, completed_appointments: 0 })
const loading = ref(false)
const error = ref(null)

async function loadStats() {
  loading.value = true
  error.value = null
  try {
    stats.value = await DashboardService.getStats()
  } catch (e) {
    error.value = 'Error al cargar estadísticas'
    console.error('Error loading stats:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.stat-card {
  border: 1px solid var(--surface-border);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}
</style>
