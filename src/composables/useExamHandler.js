import { ref } from 'vue'
import { ExamService } from '../services/examService'

/**
 * Composable for managing exam data and operations
 */
export function useExamHandler() {
  const exams = ref([])
  const currentExam = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Load exams for a patient
   * @param {number} patientId - Patient ID
   */
  async function loadExams(patientId) {
    loading.value = true
    error.value = null
    try {
      exams.value = await ExamService.getByPatient(patientId)
    } catch (e) {
      error.value = e.message || 'Error loading exams'
      console.error('Error in loadExams:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Load a single exam by ID
   * @param {number} examId - Exam ID
   */
  async function loadExam(examId) {
    loading.value = true
    error.value = null
    try {
      currentExam.value = await ExamService.getById(examId)
    } catch (e) {
      error.value = e.message || 'Error loading exam'
      console.error('Error in loadExam:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new exam
   * @param {Object} examData - Exam data
   */
  async function createExam(examData) {
    loading.value = true
    error.value = null
    try {
      const result = await ExamService.create(examData)
      await loadExams(examData.paciente_id)
      return result
    } catch (e) {
      error.value = e.message || 'Error creating exam'
      console.error('Error in createExam:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Upload PDF for an exam
   * @param {number} examId - Exam ID
   * @param {File} file - File object to upload
   */
  async function uploadPdf(examId, file) {
    loading.value = true
    error.value = null
    try {
      await ExamService.uploadPdf(examId, file)
      // Reload current exam or entire list
      if (currentExam.value && currentExam.value.id === examId) {
        await loadExam(examId)
      }
    } catch (e) {
      error.value = e.message || 'Error uploading PDF'
      console.error('Error in uploadPdf:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an exam
   * @param {number} examId - Exam ID
   * @param {number} patientId - Patient ID (for reload)
   */
  async function deleteExam(examId, patientId) {
    loading.value = true
    error.value = null
    try {
      await ExamService.delete(examId)
      await loadExams(patientId)
    } catch (e) {
      error.value = e.message || 'Error deleting exam'
      console.error('Error in deleteExam:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    exams,
    currentExam,
    loading,
    error,
    loadExams,
    loadExam,
    createExam,
    uploadPdf,
    deleteExam
  }
}
