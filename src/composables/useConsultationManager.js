// src/composables/useConsultationManager.js
import { ref } from "vue";
import { ConsultationService } from "@/services/consultationService";

export function useConsultationManager() {
  const consultations = ref([]);
  const currentConsultation = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function loadConsultations(patientId) {
    loading.value = true;
    error.value = null;
    try {
      consultations.value = await ConsultationService.getByPatient(patientId);
    } catch (e) {
      error.value = e.message || "Error cargando consultas";
      consultations.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createConsultation(data) {
    loading.value = true;
    error.value = null;
    try {
      const result = await ConsultationService.create(data);
      await loadConsultations(data.paciente_id);
      return result;
    } catch (e) {
      error.value = e.message || "Error creando consulta";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateConsultation(id, data) {
    loading.value = true;
    error.value = null;
    try {
      await ConsultationService.update(id, data);
      return true;
    } catch (e) {
      error.value = e.message || "Error actualizando consulta";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function markComplete(id, patientId) {
    loading.value = true;
    error.value = null;
    try {
      await ConsultationService.markComplete(id);
      if (patientId) {
        await loadConsultations(patientId);
      }
      return true;
    } catch (e) {
      error.value = e.message || "Error marcando consulta como completada";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    consultations,
    currentConsultation,
    loading,
    error,
    loadConsultations,
    createConsultation,
    updateConsultation,
    markComplete,
  };
}
