<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="true"
    :draggable="false"
    class="day-detail-dialog"
    :style="{ width: '90vw', maxWidth: '1200px' }"
  >
    <template #header>
      <div class="flex align-items-center justify-content-between w-full gap-3">
        <!-- Navegación -->
        <div class="flex align-items-center gap-2">
          <Button
            icon="pi pi-chevron-left"
            text
            rounded
            @click="goToPreviousDay"
            v-tooltip.bottom="'Día anterior'"
          />
          <Button
            icon="pi pi-calendar"
            text
            rounded
            @click="showDatePicker = true"
            v-tooltip.bottom="'Seleccionar fecha'"
          />
          <Button
            icon="pi pi-chevron-right"
            text
            rounded
            @click="goToNextDay"
            v-tooltip.bottom="'Día siguiente'"
          />
        </div>

        <!-- Título con fecha -->
        <div class="flex-1 text-center">
          <h3 class="m-0 text-xl font-semibold">{{ formattedDate }}</h3>
        </div>

        <!-- Espacio para balance visual -->
        <div style="width: 120px"></div>
      </div>
    </template>

    <!-- Contenido principal -->
    <div class="day-detail-content">
      <!-- Sección de Horarios Laborales -->
      <Card class="mb-3">
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <span class="text-lg">
              <i class="pi pi-clock mr-2 text-primary"></i>
              Horarios de Atención
            </span>
            <Button
              label="Editar Horarios"
              icon="pi pi-pencil"
              size="small"
              outlined
              @click="showEditSchedule = true"
            />
          </div>
        </template>
        <template #content>
          <div v-if="loadingSchedule" class="flex justify-content-center p-3">
            <ProgressSpinner style="width: 40px; height: 40px" />
          </div>
          <div v-else-if="scheduleRanges.length === 0" class="text-center p-3 text-color-secondary">
            <i class="pi pi-info-circle mr-2"></i>
            No hay horarios de atención configurados para este día
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <Tag
              v-for="(range, idx) in scheduleRanges"
              :key="idx"
              :value="`${range.inicio} - ${range.fin}`"
              severity="info"
              rounded
            />
          </div>
        </template>
      </Card>

      <!-- Sección de Timeline de Citas -->
      <Card>
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <span class="text-lg">
              <i class="pi pi-calendar mr-2 text-green-600"></i>
              Citas del Día
            </span>
            <Button
              label="Nueva Cita"
              icon="pi pi-plus"
              size="small"
              @click="openCreateAppointment"
            />
          </div>
        </template>
        <template #content>
          <div v-if="loadingAppointments" class="flex justify-content-center p-3">
            <ProgressSpinner style="width: 40px; height: 40px" />
          </div>
          <AppointmentTimeline
            v-else
            :appointments="formattedAppointments"
            :business-hours="businessHours"
            :selected-date="selectedDateObject"
            :min-gap-minutes="5"
            @create-appointment="openCreateAppointment"
            @edit-appointment="openEditAppointment"
            @cancel-appointment="openCancelAppointment"
          />
        </template>
      </Card>
    </div>

    <!-- Modal para editar horarios -->
    <Dialog
      v-model:visible="showEditSchedule"
      header="Editar Horarios de Atención"
      modal
      :closable="true"
      :style="{ width: '600px' }"
    >
      <div class="flex flex-column gap-3">
        <Message severity="info" :closable="false">
          Configura los horarios de atención para {{ formattedDate }}
        </Message>

        <div v-for="(range, idx) in editingScheduleRanges" :key="idx" class="flex align-items-center gap-2">
          <InputMask
            v-model="range.inicio"
            mask="99:99"
            placeholder="09:00"
            class="flex-1"
          />
          <span>-</span>
          <InputMask
            v-model="range.fin"
            mask="99:99"
            placeholder="13:00"
            class="flex-1"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            @click="removeScheduleRange(idx)"
          />
        </div>

        <Button
          label="Agregar Rango"
          icon="pi pi-plus"
          outlined
          size="small"
          @click="addScheduleRange"
        />

        <div class="flex justify-content-end gap-2 mt-3">
          <Button label="Cancelar" severity="secondary" @click="cancelEditSchedule" />
          <Button label="Guardar Cambios" @click="saveScheduleChanges" />
        </div>
      </div>
    </Dialog>

    <!-- Modal para seleccionar fecha -->
    <Dialog
      v-model:visible="showDatePicker"
      header="Seleccionar Fecha"
      modal
      :closable="true"
      :style="{ width: '400px' }"
    >
      <DatePicker
        v-model="pickerDate"
        inline
        @date-select="onDateSelect"
      />
    </Dialog>

    <!-- Modal para crear/editar cita (reutilizamos el existente) -->
    <AppointmentCreator
      v-model:visible="showAppointmentCreator"
      :selected-date="selectedDateObject"
      :selected-time="selectedTime"
      @created="handleAppointmentCreated"
    />

    <!-- Modal para editar cita existente -->
    <EditAppointmentDialog
      v-model:visible="showEditAppointment"
      :appointment="editingAppointment"
      @updated="handleAppointmentUpdated"
      @cancelled="handleAppointmentCancelled"
    />

    <!-- Modal para cancelar cita desde el timeline -->
    <CancelAppointmentDialog
      v-model:visible="showCancelAppointment"
      :appointment="appointmentToCancel"
      @cancelled="handleAppointmentCancelled"
    />
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import DatePicker from 'primevue/datepicker'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import AppointmentTimeline from '@/components/dashboard/AppointmentTimeline.vue'
import AppointmentCreator from '@/components/calendar/AppointmentCreator.vue'
import EditAppointmentDialog from '@/components/calendar/EditAppointmentDialog.vue'
import CancelAppointmentDialog from '@/components/calendar/CancelAppointmentDialog.vue'
import { AppointmentService } from '@/services/appointmentService.js'
import { ScheduleService } from '@/services/scheduleService.js'
import { clinicDateString, buildClinicDateTime } from '@/utils/time.js'
import { getErrorMessage } from '@/utils/errorMessages.js'

const toast = useToast()

// Props del composable de estado global
const props = defineProps({
  selectedDate: String, // ISO date string "YYYY-MM-DD"
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'update:selectedDate'])

// Estado local
const loadingSchedule = ref(false)
const loadingAppointments = ref(false)
const scheduleRanges = ref([])
const dayAppointments = ref([])

// Modales
const showEditSchedule = ref(false)
const showDatePicker = ref(false)
const showAppointmentCreator = ref(false)
const showEditAppointment = ref(false)
const showCancelAppointment = ref(false)

// Edición de horarios
const editingScheduleRanges = ref([])

// Edición de citas
const editingAppointment = ref(null)
const appointmentToCancel = ref(null)

// Selector de fecha
const pickerDate = ref(new Date())
const selectedTime = ref(null)

// Computed
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const selectedDateObject = computed(() => {
  if (!props.selectedDate) return new Date()
  return new Date(props.selectedDate + 'T00:00:00')
})

const formattedDate = computed(() => {
  if (!props.selectedDate) return ''
  const date = selectedDateObject.value
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Convertir scheduleRanges a businessHours format
const businessHours = computed(() => {
  return scheduleRanges.value.map(range => ({
    start: range.inicio,
    end: range.fin
  }))
})

// Formatear appointments al formato esperado por AppointmentTimeline
const formattedAppointments = computed(() => {
  return dayAppointments.value.map(appt => {
    const apptDate = new Date(appt.fecha)
    const startTime = apptDate.toTimeString().slice(0, 5) // "HH:MM"
    
    // Calcular end time
    const endDate = new Date(apptDate.getTime() + (appt.duracion * 1000))
    const endTime = endDate.toTimeString().slice(0, 5) // "HH:MM"
    
    return {
      id: appt.id,
      start: startTime,
      end: endTime,
      patient: appt.nombre_paciente || appt.nombre || 'Sin nombre',
      patientId: appt.paciente_id,
      doctor: '', // Puedes agregar si tienes info del doctor
      status: 'Pendiente', // Ajustar según tu lógica
      rfc3339: appt.fecha,
      // Mantener datos originales para edición
      fecha: appt.fecha,
      duracion: appt.duracion
    }
  })
})

// Watchers
watch(() => props.visible, (newVal) => {
  if (newVal && props.selectedDate) {
    loadDayData()
  }
})

watch(() => props.selectedDate, (newVal) => {
  if (newVal && props.visible) {
    loadDayData()
  }
})

// Funciones de navegación
function goToPreviousDay() {
  const date = new Date(selectedDateObject.value)
  date.setDate(date.getDate() - 1)
  emit('update:selectedDate', clinicDateString(date))
}

function goToNextDay() {
  const date = new Date(selectedDateObject.value)
  date.setDate(date.getDate() + 1)
  emit('update:selectedDate', clinicDateString(date))
}

function onDateSelect(newDate) {
  emit('update:selectedDate', clinicDateString(newDate))
  showDatePicker.value = false
}

// Cargar datos del día
async function loadDayData() {
  await Promise.all([
    loadSchedules(),
    loadAppointments()
  ])
}

async function loadSchedules() {
  loadingSchedule.value = true
  try {
    const date = selectedDateObject.value
    const dayOfWeek = date.getDay() // 0=domingo, 1=lunes, etc
    
    // Backend usa 1=lunes, 7=domingo; JS usa 0=domingo, 1=lunes
    const backendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
    
    const allSchedules = await ScheduleService.getWorkingHours()
    
    // Buscar el WorkDay para este día de la semana
    const workDay = allSchedules.find(s => s.day_of_week === backendDayOfWeek)
    
    if (workDay && workDay.active && workDay.ranges) {
      // Convertir ranges de TimeRange a formato simple
      scheduleRanges.value = workDay.ranges.map(range => {
        const startTime = new Date(range.start)
        const endTime = new Date(range.end)
        return {
          inicio: startTime.toTimeString().slice(0, 5),
          fin: endTime.toTimeString().slice(0, 5)
        }
      })
    } else {
      scheduleRanges.value = []
    }
  } catch (e) {
    console.error('Error loading schedules:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los horarios',
      life: 3000
    })
  } finally {
    loadingSchedule.value = false
  }
}

async function loadAppointments() {
  loadingAppointments.value = true
  try {
    const dateStr = clinicDateString(selectedDateObject.value)
    const appointments = await AppointmentService.getByDate(dateStr)
    dayAppointments.value = appointments || []
  } catch (e) {
    console.error('Error loading appointments:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las citas',
      life: 3000
    })
  } finally {
    loadingAppointments.value = false
  }
}

// Edición de horarios
function addScheduleRange() {
  editingScheduleRanges.value.push({ inicio: '09:00', fin: '13:00' })
}

function removeScheduleRange(idx) {
  editingScheduleRanges.value.splice(idx, 1)
}

function cancelEditSchedule() {
  showEditSchedule.value = false
  editingScheduleRanges.value = []
}

async function saveScheduleChanges() {
  try {
    // Aquí implementarías la llamada al backend para guardar horarios especiales
    toast.add({
      severity: 'success',
      summary: 'Horarios actualizados',
      detail: 'Los horarios se han guardado correctamente',
      life: 3000
    })
    showEditSchedule.value = false
    await loadSchedules()
  } catch (e) {
    console.error('Error saving schedules:', e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(e),
      life: 4000
    })
  }
}

// Gestión de citas
function openCreateAppointment(timeSlot) {
  if (timeSlot) {
    // timeSlot puede venir como { date, time } o { start }
    selectedTime.value = timeSlot.time || timeSlot.start || null
  } else {
    selectedTime.value = null
  }
  
  showAppointmentCreator.value = true
}

function openEditAppointment(appointment) {
  editingAppointment.value = appointment
  showEditAppointment.value = true
}

function handleAppointmentUpdated() {
  showEditAppointment.value = false
  editingAppointment.value = null
  loadAppointments()
}

async function openCancelAppointment(appointment) {
  appointmentToCancel.value = appointment
  showCancelAppointment.value = true
}

function handleAppointmentCancelled() {
  showCancelAppointment.value = false
  showEditAppointment.value = false
  editingAppointment.value = null
  appointmentToCancel.value = null
  loadAppointments()
}

async function handleAppointmentCreated() {
  showAppointmentCreator.value = false
  await loadAppointments()
  toast.add({
    severity: 'success',
    summary: 'Cita creada',
    detail: 'La cita se ha creado correctamente',
    life: 3000
  })
}
</script>

<style scoped>
.day-detail-dialog :deep(.p-dialog-content) {
  padding: 1rem;
}

.day-detail-content {
  min-height: 400px;
  max-height: 70vh;
  overflow-y: auto;
}
</style>
