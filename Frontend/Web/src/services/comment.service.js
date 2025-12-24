import api from '@/lib/api'

export class CommentService {
  /**
   * Get all comments for a task
   * @param {string} taskId
   * @returns {Promise<Array>}
   */
  static async getTaskComments(taskId) {
    const response = await api.get(`/comments/task/${taskId}`)
    return response.data
  }

  /**
   * Create a new comment
   * @param {Object} commentData - { taskId, text, parentId? }
   * @returns {Promise<Object>}
   */
  static async createComment(commentData) {
    const response = await api.post('/comments', commentData)
    return response.data
  }

  /**
   * Update a comment
   * @param {string} commentId
   * @param {Object} updates - { text }
   * @returns {Promise<Object>}
   */
  static async updateComment(commentId, updates) {
    const response = await api.put(`/comments/${commentId}`, updates)
    return response.data
  }

  /**
   * Delete a comment
   * @param {string} commentId
   * @returns {Promise<Object>}
   */
  static async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data
  }

  /**
   * Add reaction to a comment
   * @param {string} commentId
   * @param {string} emoji
   * @returns {Promise<Object>}
   */
  static async addReaction(commentId, emoji) {
    const response = await api.post(`/comments/${commentId}/reactions`, { emoji })
    return response.data
  }

  /**
   * Remove reaction from a comment
   * @param {string} commentId
   * @param {string} emoji
   * @returns {Promise<Object>}
   */
  static async removeReaction(commentId, emoji) {
    const response = await api.delete(`/comments/${commentId}/reactions/${emoji}`)
    return response.data
  }
}

export default CommentService
