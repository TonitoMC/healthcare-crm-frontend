<template>
  <div class="dashboard-layout p-4">
    <!-- Top: Today Stats -->
    <div class="grid">
      <div class="col-12">
        <TodayStats />
      </div>
    </div>

    <!-- Row 2: Appointments + Critical Exams -->
    <div class="grid mt-3">
      <div class="col-12 md:col-8">
        <Card>
          <template #title>Cronograma de Hoy</template>
          <template #content>
            <AppointmentTimeline 
              :appointments="todayAppointments"
              :businessHours="{ start: '08:00', end: '18:00' }"
            />
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-4">
        <CriticalExams />
      </div>
    </div>

    <!-- Row 3: Pending Exams + Recent Activity -->
    <div class="grid mt-3">
      <div class="col-12 md:col-7">
        <PendingExams />
      </div>
      <div class="col-12 md:col-5">
        <RecentActivity />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import TodayStats from '@/components/dashboard/TodayStats.vue'
import CriticalExams from '@/components/dashboard/CriticalExams.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import AppointmentTimeline from '@/components/dashboard/AppointmentTimeline.vue'
import PendingExams from '@/components/dashboard/PendingExams.vue'
import { AppointmentService } from '@/services/appointmentService'

const todayAppointments = ref([])

async function loadTodayAppointments() {
  try {
    const data = await AppointmentService.getToday()
    todayAppointments.value = data.map(appt => ({
      start: appt.fecha ? new Date(appt.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '00:00',
      end: calculateEndTime(appt.fecha, appt.duracion),
      patient: appt.nombre_paciente || appt.nombre || 'Paciente',
      doctor: 'Dr. Principal',
      status: new Date(appt.fecha) < new Date() ? 'Completada' : 'Pendiente',
      patientId: appt.paciente_id,
    }))
  } catch (e) {
    console.error('Error loading today appointments:', e)
  }
}

function calculateEndTime(fecha, duracion) {
  if (!fecha || !duracion) return '00:00'
  const start = new Date(fecha)
  start.setMinutes(start.getMinutes() + duracion)
  return start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadTodayAppointments()
})
</script>

<style scoped>
.dashboard-layout {
  max-width: 1600px;
  margin: 0 auto;
}
</style>
