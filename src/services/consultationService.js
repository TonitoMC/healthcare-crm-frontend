// src/services/consultationService.js
import { api } from "@/services/api";

export const ConsultationService = {
  async getById(id) {
    try {
      const { data } = await api.get(`/consultations/${id}`);
      return data;
    } catch (e) {
      console.error("ConsultationService.getById error:", e);
      throw e;
    }
  },

  async getByPatient(patientId) {
    try {
      const { data } = await api.get(`/consultations/patient/${patientId}`);
      return data;
    } catch (e) {
      console.error("ConsultationService.getByPatient error:", e);
      throw e;
    }
  },

  async create(consultation) {
    try {
      const { data } = await api.post("/consultations", consultation);
      return data;
    } catch (e) {
      console.error("ConsultationService.create error:", e);
      throw e;
    }
  },

  async update(id, consultation) {
    try {
      const { data } = await api.put(`/consultations/${id}`, consultation);
      return data;
    } catch (e) {
      console.error("ConsultationService.update error:", e);
      throw e;
    }
  },

  async markComplete(id) {
    try {
      const { data } = await api.put(`/consultations/${id}/complete`);
      return data;
    } catch (e) {
      console.error("ConsultationService.markComplete error:", e);
      throw e;
    }
  },

  async delete(id) {
    try {
      const { data } = await api.delete(`/consultations/${id}`);
      return data;
    } catch (e) {
      console.error("ConsultationService.delete error:", e);
      throw e;
    }
  },

  async getAnswers(consultationId) {
    try {
      const { data } = await api.get(
        `/consultations/${consultationId}/answers`,
      );
      return data;
    } catch (e) {
      console.error("ConsultationService.getAnswers error:", e);
      throw e;
    }
  },

  async addAnswers(consultationId, payload) {
    // payload MUST be: { answers: {...} }
    try {
      const { data } = await api.post(
        `/consultations/${consultationId}/answers`,
        payload,
      );
      return data;
    } catch (e) {
      console.error("ConsultationService.addAnswers error:", e);
      throw e;
    }
  },

  async updateAnswers(consultationId, payload) {
    try {
      const { data } = await api.put(
        `/consultations/${consultationId}/answers`,
        payload,
      );
      return data;
    } catch (e) {
      console.error("ConsultationService.updateAnswers error:", e);
      throw e;
    }
  },

  async deleteAnswers(consultationId) {
    try {
      const { data } = await api.delete(
        `/consultations/${consultationId}/answers`,
      );
      return data;
    } catch (e) {
      console.error("ConsultationService.deleteAnswers error:", e);
      throw e;
    }
  },
};
