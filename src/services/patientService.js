// src/services/patientService.js
import { api } from "@/services/api.js";

/**
 * PatientService handles CRUD operations for patients,
 * as well as related searches and detail retrieval.
 * Matches backend /api/patients endpoints.
 */
export const PatientService = {
  // ---------------------------------------------------------------------------
  // 🧍‍♂️ Patients
  // ---------------------------------------------------------------------------

  /**
   * Fetch all patients.
   * GET /patients
   * @returns {Promise<Array>} List of patients.
   */
  async listPatients() {
    const { data } = await api.get("/patients");
    return data;
  },

  /**
   * Fetch a single patient by ID.
   * GET /patients/:id
   * @param {Number} id - Patient ID.
   * @returns {Promise<Object>} Patient details.
   */
  async getPatient(id) {
    if (!id) throw new Error("Patient ID is required");
    const { data } = await api.get(`/patients/${id}`);
    return data;
  },

  /**
   * Create a new patient.
   * POST /patients
   * @param {Object} payload - Patient creation data.
   * @returns {Promise<Object>} Creation response with new ID.
   */
  async createPatient(payload) {
    const { data } = await api.post("/patients", payload);
    return data;
  },

  /**
   * Update an existing patient.
   * PUT /patients/:id
   * @param {Number} id - Patient ID.
   * @param {Object} payload - Updated patient data.
   * @returns {Promise<Object>} Update response.
   */
  async updatePatient(id, payload) {
    if (!id) throw new Error("Patient ID is required");
    const { data } = await api.put(`/patients/${id}`, payload);
    return data;
  },

  /**
   * Delete a patient.
   * DELETE /patients/:id
   * @param {Number} id - Patient ID.
   * @returns {Promise<Object>} Deletion response.
   */
  async deletePatient(id) {
    if (!id) throw new Error("Patient ID is required");
    const { data } = await api.delete(`/patients/${id}`);
    return data;
  },

  // ---------------------------------------------------------------------------
  // 🔎 Search
  // ---------------------------------------------------------------------------

  /**
   * Search patients by name.
   * GET /patients/search?name=<string>
   * @param {String} name - Partial or full name of patient.
   * @returns {Promise<Array>} List of matched patients.
   */
  async searchByName(name) {
    if (!name) throw new Error("Search name is required");
    const { data } = await api.get("/patients/search", { params: { name } });
    return data;
  },

  // ---------------------------------------------------------------------------
  // 🩺 Details
  // ---------------------------------------------------------------------------

  /**
   * Fetch detailed patient information including optional related data.
   * GET /patients/:id/details?include=exams,consultations,record
   * @param {Number} id - Patient ID.
   * @param {Object} [options] - Optional includes.
   * @param {boolean} [options.exams=false] - Include patient exams.
   * @param {boolean} [options.consultations=false] - Include consultations.
   * @param {boolean} [options.record=false] - Include medical record.
   * @returns {Promise<Object>} Composite patient details.
   */
  async getPatientDetails(id, options = {}) {
    if (!id) throw new Error("Patient ID is required");

    const includes = Object.entries(options)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key)
      .join(",");

    const params = includes ? { include: includes } : {};
    const { data } = await api.get(`/patients/${id}/details`, { params });
    return data;
  },
};
