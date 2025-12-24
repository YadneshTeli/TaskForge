import api from '@/lib/api'

export class ReportService {
  /**
   * Get project performance report
   * @param {string} projectId
   * @param {Object} options - { startDate, endDate }
   * @returns {Promise<Object>}
   */
  static async getProjectReport(projectId, options = {}) {
    const params = new URLSearchParams(options)
    const response = await api.get(`/reports/project/${projectId}?${params}`)
    return response.data
  }

  /**
   * Get team productivity report
   * @param {Object} options - { startDate, endDate, teamId }
   * @returns {Promise<Object>}
   */
  static async getTeamReport(options = {}) {
    const params = new URLSearchParams(options)
    const response = await api.get(`/reports/team?${params}`)
    return response.data
  }

  /**
   * Get user performance report
   * @param {number} userId
   * @param {Object} options - { startDate, endDate }
   * @returns {Promise<Object>}
   */
  static async getUserReport(userId, options = {}) {
    const params = new URLSearchParams(options)
    const response = await api.get(`/reports/user/${userId}?${params}`)
    return response.data
  }

  /**
   * Get task completion trends
   * @param {Object} options - { projectId, period }
   * @returns {Promise<Object>}
   */
  static async getTaskTrends(options = {}) {
    const params = new URLSearchParams(options)
    const response = await api.get(`/reports/task-trends?${params}`)
    return response.data
  }

  /**
   * Get time tracking report
   * @param {Object} options - { projectId, userId, startDate, endDate }
   * @returns {Promise<Object>}
   */
  static async getTimeTrackingReport(options = {}) {
    const params = new URLSearchParams(options)
    const response = await api.get(`/reports/time-tracking?${params}`)
    return response.data
  }

  /**
   * Export report as PDF
   * @param {string} reportType
   * @param {Object} options
   * @returns {Promise<Blob>}
   */
  static async exportReportPDF(reportType, options = {}) {
    const params = new URLSearchParams(options)
    const response = await api.get(`/reports/export/${reportType}/pdf?${params}`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Export report as CSV
   * @param {string} reportType
   * @param {Object} options
   * @returns {Promise<Blob>}
   */
  static async exportReportCSV(reportType, options = {}) {
    const params = new URLSearchParams(options)
    const response = await api.get(`/reports/export/${reportType}/csv?${params}`, {
      responseType: 'blob'
    })
    return response.data
  }
}

export default ReportService
