<template>
  <div class="flex flex-column flex-1 min-h-0 p-3">
    <!-- Weekday labels -->
    <div class="month-weekdays">
      <div v-for="day in daysOfWeek" :key="day" class="weekday text-color-secondary">
        {{ day }}
      </div>
    </div>

    <!-- Dynamic month grid (7 columns) -->
    <div class="month-grid">
      <div
        v-for="cell in monthCells"
        :key="cell.iso"
        class="month-cell surface-card border-round-md shadow-1 cursor-pointer hover:surface-hover transition-duration-150"
        :class="{
          'is-today': isToday(cell.date),
          'is-out': !cell.isCurrentMonth,
          'border-2 border-primary': isToday(cell.date)
        }"
        @click="openDay(cell)"
      >
        <!-- Header del día -->
        <div class="cell-header p-2 border-bottom-1 surface-border">
          <div class="flex align-items-center justify-content-between">
            <span class="day font-bold" :class="{ 'text-primary': isToday(cell.date) }">
              {{ cell.day }}
            </span>
            <Badge
              v-if="cell.appointmentCount > 0"
              :value="cell.appointmentCount"
              severity="success"
              size="small"
            />
          </div>
        </div>

        <!-- Cuerpo del día - Horarios y citas -->
        <div class="cell-body p-2">
          <!-- Horarios laborales -->
          <div v-if="cell.scheduleRanges.length > 0" class="mb-2">
            <div
              v-for="(range, idx) in cell.scheduleRanges"
              :key="'schedule-' + idx"
              class="schedule-item text-xs mb-1 flex align-items-center gap-1"
            >
              <i class="pi pi-clock text-xs text-color-secondary"></i>
              <span class="text-color-secondary">{{ range.inicio }}-{{ range.fin }}</span>
              <Badge
                v-if="range.appointmentCount > 0"
                :value="range.appointmentCount"
                severity="info"
                size="small"
              />
            </div>
          </div>

          <!-- Citas del día -->
          <div v-if="cell.appointments.length > 0" class="appointments-list">
            <div
              v-for="(appt, idx) in cell.appointments.slice(0, 3)"
              :key="'appt-' + idx"
              class="appointment-item text-xs mb-1 p-1 border-round surface-ground"
            >
              <div class="flex align-items-center gap-1">
                <i class="pi pi-user text-xs text-primary"></i>
                <span class="font-semibold text-primary">{{ appt.time }}</span>
              </div>
              <div class="text-color truncate pl-3">{{ appt.patientName }}</div>
            </div>
            <div
              v-if="cell.appointments.length > 3"
              class="text-xs text-color-secondary text-center mt-1"
            >
              +{{ cell.appointments.length - 3 }} más
            </div>
          </div>

          <!-- Día sin horarios configurados -->
          <div
            v-if="cell.scheduleRanges.length === 0 && cell.appointments.length === 0"
            class="text-xs text-color-secondary text-center py-2"
          >
            <i class="pi pi-ban text-xs"></i>
            <div>Sin atención</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalle del día -->
    <DayDetailDialog
      v-model:visible="dayDialogVisible"
      v-model:selected-date="selectedDayDate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Badge from 'primevue/badge'
import DayDetailDialog from '@/components/calendar/DayDetailDialog.vue'
import { currentDate } from '@/composables/useCalendarState'
import { AppointmentService } from '@/services/appointmentService.js'
import { ScheduleService } from '@/services/scheduleService.js'
import { clinicDateString } from '@/utils/time.js'

const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Estado local
const dayDialogVisible = ref(false)
const selectedDayDate = ref(null)
const monthAppointments = ref([])
const schedules = ref([])
const loading = ref(false)

// Cargar datos cuando cambie el mes
watch(currentDate, () => {
  loadMonthData()
}, { immediate: true })

onMounted(() => {
  loadMonthData()
})

async function loadMonthData() {
  loading.value = true
  try {
    await Promise.all([
      loadSchedules(),
      loadMonthAppointments()
    ])
  } catch (e) {
    console.error('Error loading month data:', e)
  } finally {
    loading.value = false
  }
}

async function loadSchedules() {
  try {
    schedules.value = await ScheduleService.getWorkingHours()
  } catch (e) {
    console.error('Error loading schedules:', e)
    schedules.value = []
  }
}

async function loadMonthAppointments() {
  const base = currentDate.value instanceof Date ? new Date(currentDate.value) : new Date(currentDate.value)
  const start = startOfGrid(base)
  const end = new Date(start)
  end.setDate(start.getDate() + 42)

  const startStr = clinicDateString(start)
  const endStr = clinicDateString(end)

  console.log('📅 [CalendarMonthView] Loading appointments:', { startStr, endStr })

  try {
    const appointments = await AppointmentService.getByDateRange(startStr, endStr)
    monthAppointments.value = appointments || []
    console.log('✅ [CalendarMonthView] Loaded appointments:', monthAppointments.value.length)
    if (appointments && appointments.length > 0) {
      console.log('📋 [CalendarMonthView] First appointment:', appointments[0])
    }
  } catch (error) {
    console.error('❌ [CalendarMonthView] Error loading appointments:', error)
    monthAppointments.value = []
  }
}

function startOfGrid(date) {
  const d = new Date(date instanceof Date ? date : new Date(date))
  d.setDate(1)
  // move to Monday-based start
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function isToday(date) {
  const d = new Date(date)
  const t = new Date()
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  )
}

const monthCells = computed(() => {
  const base = currentDate.value instanceof Date ? new Date(currentDate.value) : new Date(currentDate.value)
  const start = startOfGrid(base)
  const cells = []

  // Debug: Log all appointments
  console.log('🔍 [CalendarMonthView] Total appointments:', monthAppointments.value.length)
  if (monthAppointments.value.length > 0) {
    console.log('🔍 [CalendarMonthView] Sample appointment:', monthAppointments.value[0])
  }

  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = clinicDateString(d)
    const dayOfWeek = d.getDay() // 0=domingo, 1=lunes, etc

    // Buscar WorkDay para este día de la semana
    // Backend usa 1=lunes, 7=domingo; JS usa 0=domingo, 1=lunes
    const backendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
    const workDay = schedules.value.find(s => s.day_of_week === backendDayOfWeek)
    
    // Convertir ranges de TimeRange a formato simple
    const daySchedules = workDay && workDay.active ? workDay.ranges.map(range => {
      const startTime = new Date(range.start)
      const endTime = new Date(range.end)
      return {
        inicio: startTime.toTimeString().slice(0, 5),
        fin: endTime.toTimeString().slice(0, 5)
      }
    }) : []

    // Filtrar citas para este día
    const dayAppointments = monthAppointments.value.filter(appt => {
      const apptDate = new Date(appt.fecha)
      const apptDateString = clinicDateString(apptDate)
      
      // Debug: Log first cell only to avoid spam
      if (i === 0 && appt) {
        console.log('🔍 [CalendarMonthView] Comparing:', {
          apptFecha: appt.fecha,
          apptDateString,
          cellIso: iso,
          matches: apptDateString === iso
        })
      }
      
      return apptDateString === iso
    })

    // Formatear citas para display
    const formattedAppointments = dayAppointments.map(appt => {
      const apptDate = new Date(appt.fecha)
      const time = apptDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
      return {
        id: appt.id,
        time,
        patientName: appt.paciente_nombre || 'Sin nombre',
        duration: appt.duracion
      }
    })

    // Contar citas por rango horario
    const schedulesWithCount = daySchedules.map(schedule => {
      const [startHour, startMin] = schedule.inicio.split(':').map(Number)
      const [endHour, endMin] = schedule.fin.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      const appointmentsInRange = dayAppointments.filter(appt => {
        const apptDate = new Date(appt.fecha)
        const apptMinutes = apptDate.getHours() * 60 + apptDate.getMinutes()
        return apptMinutes >= startMinutes && apptMinutes < endMinutes
      }).length

      return {
        ...schedule,
        appointmentCount: appointmentsInRange
      }
    })

    cells.push({
      date: d,
      iso,
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === base.getMonth(),
      appointmentCount: dayAppointments.length,
      scheduleRanges: schedulesWithCount,
      appointments: formattedAppointments
    })
  }

  return cells
})

function openDay(cell) {
  selectedDayDate.value = cell.iso
  dayDialogVisible.value = true
}
</script>

<style scoped>
/* Weekday header */
.month-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0 0.5rem 0.75rem 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem;
}

/* Month grid */
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0 0.5rem;
  grid-auto-rows: minmax(120px, auto);
}

.month-cell {
  display: flex;
  flex-direction: column;
  min-height: 120px;
  transition: all 150ms ease;
  overflow: hidden;
}

.month-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.month-cell.is-out {
  opacity: 0.5;
}

.cell-header {
  flex-shrink: 0;
}

.cell-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.day {
  font-size: 1rem;
}

/* Horarios laborales */
.schedule-item {
  line-height: 1.3;
  white-space: nowrap;
}

/* Citas */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.appointment-item {
  line-height: 1.2;
}

/* Responsive */
@media (min-width: 768px) {
  .month-grid {
    grid-auto-rows: minmax(140px, auto);
  }
}

@media (min-width: 1024px) {
  .month-grid {
    grid-auto-rows: minmax(160px, auto);
  }
}

@media (min-width: 1440px) {
  .month-grid {
    grid-auto-rows: minmax(180px, auto);
  }
}
</style>
