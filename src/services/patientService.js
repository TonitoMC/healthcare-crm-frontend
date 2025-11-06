// src/services/patientService.js
import { api } from "@/services/api";

export const PatientService = {
  async getAll() {
    try {
      const { data } = await api.get("/patients");
      return data;
    } catch (e) {
      console.error("PatientService.getAll error:", e);
      throw e;
    }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/patients/${id}`);
      return data;
    } catch (e) {
      console.error("PatientService.getById error:", e);
      throw e;
    }
  },

  async create(patient) {
    try {
      const { data } = await api.post("/patients", patient);
      return data;
    } catch (e) {
      console.error("PatientService.create error:", e);
      throw e;
    }
  },

  async update(id, patient) {
    try {
      const { data } = await api.put(`/patients/${id}`, patient);
      return data;
    } catch (e) {
      console.error("PatientService.update error:", e);
      throw e;
    }
  },

  async delete(id) {
    try {
      const { data } = await api.delete(`/patients/${id}`);
      return data;
    } catch (e) {
      console.error("PatientService.delete error:", e);
      throw e;
    }
  },

  async searchByName(name) {
    try {
      const { data } = await api.get("/patients/search", { params: { name } });
      return data;
    } catch (e) {
      console.error("PatientService.searchByName error:", e);
      throw e;
    }
  },
};
