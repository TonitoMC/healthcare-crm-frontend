import { api } from '@/services/api'

export const DashboardService = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  async getStats() {
    try {
      const { data } = await api.get('/dashboard/stats')
      return data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  },

  /**
   * Get recent activity
   * @param {number} limit - Number of activities to fetch
   * @returns {Promise<Array>} List of recent activities
   */
  async getRecentActivity(limit = 10) {
    try {
      const { data } = await api.get('/dashboard/activity/recent', { params: { limit } })
      return data
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      throw error
    }
  },

  /**
   * Get critical exams
   * @param {number} limit - Number of critical exams to fetch
   * @returns {Promise<Array>} List of critical exams
   */
  async getCriticalExams(limit = 10) {
    try {
      const { data } = await api.get('/dashboard/exams/critical', { params: { limit } })
      return data
    } catch (error) {
      console.error('Error fetching critical exams:', error)
      throw error
    }
  }
}
