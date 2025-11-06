import { api } from '@/services/api'

export const AppointmentService = {
  /**
   * Get appointment by ID
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Appointment data
   */
  async getById(id) {
    try {
      const { data } = await api.get(`/appointments/${id}`)
      return data
    } catch (error) {
      console.error('Error fetching appointment:', error)
      throw error
    }
  },

  /**
   * Get all appointments for today
   * @returns {Promise<Array>} List of today's appointments
   */
  async getToday() {
    try {
      const { data } = await api.get('/appointments/today')
      return data
    } catch (error) {
      console.error('Error fetching today appointments:', error)
      throw error
    }
  },

  /**
   * Get appointments for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} List of appointments
   */
  async getByDate(date) {
    try {
      const { data } = await api.get(`/appointments/date/${date}`)
      return data
    } catch (error) {
      console.error('Error fetching appointments by date:', error)
      throw error
    }
  },

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment creation data
   * @returns {Promise<Object>} Created appointment ID
   */
  async create(appointmentData) {
    try {
      const { data } = await api.post('/appointments', appointmentData)
      return data
    } catch (error) {
      console.error('Error creating appointment:', error)
      throw error
    }
  },

  /**
   * Update an appointment
   * @param {number} id - Appointment ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Success message
   */
  async update(id, updateData) {
    try {
      const { data } = await api.put(`/appointments/${id}`, updateData)
      return data
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  },

  /**
   * Delete an appointment
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Success message
   */
  async delete(id) {
    try {
      const { data } = await api.delete(`/appointments/${id}`)
      return data
    } catch (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }
}
