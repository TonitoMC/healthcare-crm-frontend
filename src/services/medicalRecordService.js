// src/services/medicalRecordService.js
import { api } from "@/services/api";

export const MedicalRecordService = {
  async getByPatientId(patientId) {
    try {
      const { data } = await api.get(`/medical-records/${patientId}`);
      return data;
    } catch (e) {
      console.error("MedicalRecordService.getByPatientId error:", e);
      throw e;
    }
  },

  async update(patientId, record) {
    try {
      const { data } = await api.put(`/medical-records/${patientId}`, record);
      return data;
    } catch (e) {
      console.error("MedicalRecordService.update error:", e);
      throw e;
    }
  },
};
