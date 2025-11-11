<template>
  <Card>
    <template #title>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-history text-blue-500"></i>
        <span>Actividad Reciente</span>
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
        <div v-if="activities.length > 0" class="activity-feed">
          <div v-for="activity in activities" :key="activity.timestamp" class="activity-item">
            <div class="activity-icon">
              <i :class="getIconClass(activity.type)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-message">
                {{ activity.message }}
              </div>
              <router-link 
                v-if="activity.patient_id" 
                :to="`/app/patients/${activity.patient_id}`" 
                class="patient-link"
              >
                {{ activity.patient_name }}
              </router-link>
              <div class="activity-time text-color-secondary text-sm">
                {{ formatTimestamp(activity.timestamp) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-color-secondary p-4">
          No hay actividad reciente
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

const activities = ref([])
const loading = ref(false)
const error = ref(null)

function getIconClass(type) {
  return type === 'consultation' 
    ? 'pi pi-calendar text-blue-500' 
    : 'pi pi-file-pdf text-red-500'
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Justo ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
}

async function loadRecentActivity() {
  loading.value = true
  error.value = null
  try {
    activities.value = await DashboardService.getRecentActivity(10)
  } catch (e) {
    error.value = 'Error al cargar actividad reciente'
    console.error('Error loading recent activity:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecentActivity()
})
</script>

<style scoped>
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: var(--surface-50);
  transition: background 0.2s;
}

.activity-item:hover {
  background: var(--surface-100);
}

.activity-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-message {
  font-weight: 500;
  color: var(--text-color);
}

.activity-time {
  font-size: 0.875rem;
}

.patient-link {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  width: fit-content;
}

.patient-link:hover {
  text-decoration: underline;
}
</style>
