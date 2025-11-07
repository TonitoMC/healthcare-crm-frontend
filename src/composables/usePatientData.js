// src/composables/usePatientData.js
import { ref } from "vue";
import { PatientService } from "@/services/patientService.js";

export function usePatientData() {
  const patient = ref(null);
  const exams = ref([]);
  const consultations = ref([]);
  const medicalRecord = ref(null);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Loads full patient info with optional related data.
   * @param {number} id
   */
  async function loadPatient(id) {
    loading.value = true;
    error.value = null;
    try {
      const data = await PatientService.getPatientDetails(id, {
        exams: true,
        consultations: true,
        record: true,
      });

      patient.value = data.patient || null;
      exams.value = data.exams || [];
      consultations.value = data.consultations || [];
      medicalRecord.value = data.medical_record || null;
    } catch (e) {
      console.error("usePatientData.loadPatient error:", e);
      error.value = "Error al cargar la información del paciente.";
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update patient basic info.
   */
  async function updatePatient(id, payload) {
    try {
      await PatientService.updatePatient(id, payload);
      await loadPatient(id); // reload data after update
    } catch (e) {
      console.error("usePatientData.updatePatient error:", e);
      error.value = "Error al actualizar paciente.";
    }
  }

  return {
    patient,
    exams,
    consultations,
    medicalRecord,
    loading,
    error,
    loadPatient,
    updatePatient,
  };
}
