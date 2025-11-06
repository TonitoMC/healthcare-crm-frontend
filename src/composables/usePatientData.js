// src/composables/usePatientData.js
import { ref, computed } from "vue";
import { PatientService } from "@/services/patientService";

export function usePatientData() {
  const patient = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const edad = computed(() => {
    if (!patient.value?.fecha_nacimiento) return 0;
    const birth = new Date(patient.value.fecha_nacimiento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  });

  async function loadPatient(id) {
    loading.value = true;
    error.value = null;
    try {
      patient.value = await PatientService.getById(id);
    } catch (e) {
      error.value = e.message || "Error cargando paciente";
      patient.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function updatePatient(id, data) {
    loading.value = true;
    error.value = null;
    try {
      await PatientService.update(id, data);
      await loadPatient(id);
      return true;
    } catch (e) {
      error.value = e.message || "Error actualizando paciente";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    patient,
    loading,
    error,
    edad,
    loadPatient,
    updatePatient,
  };
}
