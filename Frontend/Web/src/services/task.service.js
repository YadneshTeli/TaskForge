import api from '@/lib/api'

export class TaskService {
  /**
   * Get all tasks for a project
   * @param {string} projectId
   * @returns {Promise<Array>}
   */
  static async getProjectTasks(projectId) {
    const response = await api.get(`/tasks/project/${projectId}`)
    return response.data
  }

  /**
   * Get a single task by ID
   * @param {string} taskId
   * @returns {Promise<Object>}
   */
  static async getTask(taskId) {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  }

  /**
   * Create a new task
   * @param {Object} taskData
   * @returns {Promise<Object>}
   */
  static async createTask(taskData) {
    const response = await api.post('/tasks', taskData)
    return response.data
  }

  /**
   * Update an existing task
   * @param {string} taskId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  static async updateTask(taskId, updates) {
    const response = await api.put(`/tasks/${taskId}`, updates)
    return response.data
  }

  /**
   * Delete a task
   * @param {string} taskId
   * @returns {Promise<Object>}
   */
  static async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
  }

  /**
   * Assign task to a user
   * @param {string} taskId
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async assignTask(taskId, userId) {
    const response = await api.patch(`/tasks/${taskId}/assign`, { userId })
    return response.data
  }

  /**
   * Update task status
   * @param {string} taskId
   * @param {string} status
   * @returns {Promise<Object>}
   */
  static async updateTaskStatus(taskId, status) {
    const response = await api.patch(`/tasks/${taskId}/status`, { status })
    return response.data
  }

  /**
   * Update task priority
   * @param {string} taskId
   * @param {string} priority
   * @returns {Promise<Object>}
   */
  static async updateTaskPriority(taskId, priority) {
    const response = await api.patch(`/tasks/${taskId}/priority`, { priority })
    return response.data
  }

  /**
   * Get task analytics for a project
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  static async getProjectTaskAnalytics(projectId) {
    const response = await api.get(`/tasks/project/${projectId}/analytics`)
    return response.data
  }

  /**
   * Get tasks assigned to current user
   * @returns {Promise<Array>}
   */
  static async getMyTasks() {
    const response = await api.get('/tasks/my-tasks')
    return response.data
  }

  /**
   * Add a watcher to a task
   * @param {string} taskId
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async addWatcher(taskId, userId) {
    const response = await api.post(`/tasks/${taskId}/watchers`, { userId })
    return response.data
  }

  /**
   * Remove a watcher from a task
   * @param {string} taskId
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async removeWatcher(taskId, userId) {
    const response = await api.delete(`/tasks/${taskId}/watchers/${userId}`)
    return response.data
  }
}

export default TaskService
