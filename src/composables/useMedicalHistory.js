// src/composables/useMedicalHistory.js
import { ref } from "vue";
import { MedicalRecordService } from "@/services/medicalRecordService";

export function useMedicalHistory() {
  const medicalRecord = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function loadMedicalRecord(patientId) {
    loading.value = true;
    error.value = null;
    try {
      medicalRecord.value = await MedicalRecordService.getByPatientId(patientId);
    } catch (e) {
      error.value = e.message || "Error cargando antecedentes";
      medicalRecord.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function updateMedicalRecord(patientId, data) {
    loading.value = true;
    error.value = null;
    try {
      await MedicalRecordService.update(patientId, data);
      await loadMedicalRecord(patientId);
      return true;
    } catch (e) {
      error.value = e.message || "Error actualizando antecedentes";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    medicalRecord,
    loading,
    error,
    loadMedicalRecord,
    updateMedicalRecord,
  };
}
