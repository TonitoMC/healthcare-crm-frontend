<template>
  <div class="patient-quick-form">
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>
    <div v-else>
      <Message v-if="error" severity="error" :closable="false">{{
        error
      }}</Message>

      <div class="flex flex-column gap-3">
        <div class="field">
          <label for="nombre" class="font-semibold">Nombre Completo *</label>
          <InputText
            id="nombre"
            v-model="form.nombre"
            :invalid="!!errors.nombre"
            class="w-full"
            placeholder="Ej: Juan Pérez González"
          />
          <small v-if="errors.nombre" class="p-error">{{
            errors.nombre
          }}</small>
        </div>

        <div class="field">
          <label for="telefono" class="font-semibold">Teléfono *</label>
          <InputText
            id="telefono"
            v-model="form.telefono"
            :invalid="!!errors.telefono"
            class="w-full"
            placeholder="8888-8888"
          />
          <small v-if="errors.telefono" class="p-error">{{
            errors.telefono
          }}</small>
        </div>

        <div class="field">
          <label for="fecha_nacimiento" class="font-semibold"
            >Fecha de Nacimiento *</label
          >
          <DatePicker
            id="fecha_nacimiento"
            v-model="form.fecha_nacimiento"
            :invalid="!!errors.fecha_nacimiento"
            dateFormat="dd/mm/yy"
            placeholder="dd/mm/aaaa"
            class="w-full"
            :pt="{ input: { class: 'w-full' } }"
          />
          <small v-if="errors.fecha_nacimiento" class="p-error">{{
            errors.fecha_nacimiento
          }}</small>
        </div>

        <div class="field">
          <label for="sexo" class="font-semibold">Sexo *</label>
          <Select
            id="sexo"
            v-model="form.sexo"
            :invalid="!!errors.sexo"
            :options="sexOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar"
            class="w-full"
          />
          <small v-if="errors.sexo" class="p-error">{{ errors.sexo }}</small>
        </div>

        <div class="flex justify-content-end gap-2 mt-2">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="$emit('cancel')"
          />
          <Button
            label="Crear Paciente"
            icon="pi pi-check"
            @click="handleSubmit"
            :disabled="loading"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import Button from "primevue/button";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import { PatientService } from "@/services/patientService";

const emit = defineEmits(["success", "cancel"]);

const sexOptions = [
  { label: "Masculino", value: "Masculino" },
  { label: "Femenino", value: "Femenino" },
];

const form = reactive({
  nombre: "",
  telefono: "",
  fecha_nacimiento: null,
  sexo: null,
});

const errors = reactive({
  nombre: "",
  telefono: "",
  fecha_nacimiento: "",
  sexo: "",
});

const loading = ref(false);
const error = ref(null);

function validateForm() {
  errors.nombre = "";
  errors.telefono = "";
  errors.fecha_nacimiento = "";
  errors.sexo = "";

  let isValid = true;

  if (!form.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio";
    isValid = false;
  }

  if (!form.telefono.trim()) {
    errors.telefono = "El teléfono es obligatorio";
    isValid = false;
  }

  if (!form.fecha_nacimiento) {
    errors.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    isValid = false;
  }

  if (!form.sexo) {
    errors.sexo = "El sexo es obligatorio";
    isValid = false;
  }

  return isValid;
}

function formatDateToYYYYMMDD(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function handleSubmit() {
  if (!validateForm()) return;

  loading.value = true;
  error.value = null;

  try {
    const birthDateStr = formatDateToYYYYMMDD(form.fecha_nacimiento);

    const payload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || null,
      fecha_nacimiento: birthDateStr,
      sexo: form.sexo,
    };

    console.log("📤 Enviando payload:", payload);

    const newPatient = await PatientService.createPatient(payload);
    emit("success", newPatient);
  } catch (e) {
    console.error("❌ Error completo:", e);
    console.error("❌ Response data:", e?.response?.data);
    error.value =
      e?.response?.data?.error ||
      "Error al crear el paciente. Inténtelo de nuevo.";
  } finally {
    loading.value = false;
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
