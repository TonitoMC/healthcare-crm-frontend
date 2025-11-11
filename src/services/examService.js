import { api } from "@/services/api";

export const ExamService = {
  /**
   * Get exam by ID
   * @param {number} id - Exam ID
   * @returns {Promise<Object>} Exam data
   */
  async getById(id) {
    try {
      const { data } = await api.get(`/exams/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching exam:", error);
      throw error;
    }
  },

  /**
   * Get all exams for a patient
   * @param {number} patientId - Patient ID
   * @returns {Promise<Array>} List of exams
   */
  async getByPatient(patientId) {
    try {
      const { data } = await api.get(`/exams/patient/${patientId}`);
      return data;
    } catch (error) {
      console.error("Error fetching patient exams:", error);
      throw error;
    }
  },

  /**
   * Create a new exam
   * @param {Object} examData - Exam creation data
   * @returns {Promise<Object>} Created exam ID
   */
  async create(examData) {
    try {
      const { data } = await api.post("/exams", examData);
      return data;
    } catch (error) {
      console.error("Error creating exam:", error);
      throw error;
    }
  },

  /**
   * Upload PDF for an exam
   * @param {number} id - Exam ID
   * @param {File} file - File object to upload
   * @returns {Promise<Object>} Success message
   */
  async uploadPdf(id, file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await api.post(`/exams/${id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  },

  /**
   * Get download URL for an exam PDF
   * @param {number} id - Exam ID
   * @returns {string} Download URL
   */
  getDownloadUrl(id) {
    return `${api.defaults.baseURL}/exams/${id}/file`;
  },

  /**
   * Delete an exam
   * @param {number} id - Exam ID
   * @returns {Promise<Object>} Success message
   */
  async delete(id) {
    try {
      const { data } = await api.delete(`/exams/${id}`);
      return data;
    } catch (error) {
      console.error("Error deleting exam:", error);
      throw error;
    }
  },

  /**
   * Get all pending exams (no PDF uploaded yet)
   * @returns {Promise<Array>} List of pending exams
   */
  async getPending() {
    try {
      const { data } = await api.get("/exams/pending");
      return data;
    } catch (error) {
      console.error("Error fetching pending exams:", error);
      throw error;
    }
  },

  /**
   * Get all completed exams (PDF uploaded)
   * @returns {Promise<Array>} List of completed exams
   */
  async getCompleted() {
    try {
      const { data } = await api.get("/exams/completed");
      return data;
    } catch (error) {
      console.error("Error fetching completed exams:", error);
      throw error;
    }
  },
};
