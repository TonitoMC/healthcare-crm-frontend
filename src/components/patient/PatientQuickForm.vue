<template>
  <div class="patient-quick-form">
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>
    <div v-else>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      
      <div class="flex flex-column gap-3">
        <div class="field">
          <label for="nombre" class="font-semibold">Nombre completo *</label>
          <InputText 
            id="nombre" 
            v-model="form.nombre" 
            :invalid="!!errors.nombre"
            class="w-full" 
            placeholder="Ej: Juan Pérez García"
          />
          <small v-if="errors.nombre" class="p-error">{{ errors.nombre }}</small>
        </div>

        <div class="field">
          <label for="email" class="font-semibold">Email</label>
          <InputText 
            id="email" 
            v-model="form.email" 
            type="email"
            :invalid="!!errors.email"
            class="w-full" 
            placeholder="juan@example.com"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <div class="field">
          <label for="telefono" class="font-semibold">Teléfono *</label>
          <InputText 
            id="telefono" 
            v-model="form.telefono" 
            :invalid="!!errors.telefono"
            class="w-full" 
            placeholder="Ej: 555-1234"
          />
          <small v-if="errors.telefono" class="p-error">{{ errors.telefono }}</small>
        </div>

        <div class="flex justify-content-end gap-2 mt-2">
          <Button label="Cancelar" severity="secondary" @click="$emit('cancel')" />
          <Button label="Crear Paciente" icon="pi pi-check" @click="handleSubmit" :disabled="loading" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { PatientService } from '@/services/patientService'

const emit = defineEmits(['success', 'cancel'])

const form = reactive({
  nombre: '',
  email: '',
  telefono: ''
})

const errors = reactive({
  nombre: '',
  email: '',
  telefono: ''
})

const loading = ref(false)
const error = ref(null)

function validateForm() {
  errors.nombre = ''
  errors.email = ''
  errors.telefono = ''
  
  let isValid = true
  
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio'
    isValid = false
  }
  
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email inválido'
    isValid = false
  }
  
  if (!form.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio'
    isValid = false
  }
  
  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return
  
  loading.value = true
  error.value = null
  
  try {
    const newPatient = await PatientService.create({
      nombre: form.nombre.trim(),
      email: form.email.trim() || null,
      telefono: form.telefono.trim()
    })
    emit('success', newPatient)
  } catch (e) {
    error.value = 'Error al crear el paciente. Inténtelo de nuevo.'
    console.error('Error creating patient:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.patient-quick-form {
  min-width: 400px;
}

.field {
  margin-bottom: 0;
}

@media (max-width: 576px) {
  .patient-quick-form {
    min-width: 100%;
  }
}
</style>
