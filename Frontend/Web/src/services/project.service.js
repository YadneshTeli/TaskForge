import api from '@/lib/api'

export class ProjectService {
  /**
   * Get all projects for the current user
   * @returns {Promise<Array>}
   */
  static async getAllProjects() {
    const response = await api.get('/projects/all')
    return response.data
  }

  /**
   * Get a single project by ID
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  static async getProject(projectId) {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
  }

  /**
   * Create a new project
   * @param {Object} projectData
   * @returns {Promise<Object>}
   */
  static async createProject(projectData) {
    const response = await api.post('/projects/create', projectData)
    return response.data
  }

  /**
   * Update an existing project
   * @param {string} projectId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  static async updateProject(projectId, updates) {
    const response = await api.put(`/projects/${projectId}`, updates)
    return response.data
  }

  /**
   * Delete a project
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  static async deleteProject(projectId) {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
  }

  /**
   * Add a member to a project
   * @param {string} projectId
   * @param {Object} memberData - { userId, role }
   * @returns {Promise<Object>}
   */
  static async addMember(projectId, memberData) {
    const response = await api.post(`/projects/${projectId}/members`, memberData)
    return response.data
  }

  /**
   * Remove a member from a project
   * @param {string} projectId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async removeMember(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`)
    return response.data
  }

  /**
   * Get project analytics
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  static async getProjectAnalytics(projectId) {
    const response = await api.get(`/projects/${projectId}/analytics`)
    return response.data
  }

  /**
   * Archive a project
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  static async archiveProject(projectId) {
    const response = await api.patch(`/projects/${projectId}/archive`)
    return response.data
  }

  /**
   * Restore an archived project
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  static async restoreProject(projectId) {
    const response = await api.patch(`/projects/${projectId}/restore`)
    return response.data
  }
}

export default ProjectService
