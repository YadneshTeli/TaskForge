import api from '@/lib/api'

export class NotificationService {
  /**
   * Get all notifications for current user
   * @returns {Promise<Array>}
   */
  static async getNotifications() {
    const response = await api.get('/notifications')
    return response.data
  }

  /**
   * Get unread notification count
   * @returns {Promise<Object>}
   */
  static async getUnreadCount() {
    const response = await api.get('/notifications/unread-count')
    return response.data
  }

  /**
   * Mark notification as read
   * @param {string} notificationId
   * @returns {Promise<Object>}
   */
  static async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>}
   */
  static async markAllAsRead() {
    const response = await api.patch('/notifications/mark-all-read')
    return response.data
  }

  /**
   * Delete a notification
   * @param {string} notificationId
   * @returns {Promise<Object>}
   */
  static async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`)
    return response.data
  }

  /**
   * Clear all notifications
   * @returns {Promise<Object>}
   */
  static async clearAll() {
    const response = await api.delete('/notifications/clear-all')
    return response.data
  }

  /**
   * Get notification preferences
   * @returns {Promise<Object>}
   */
  static async getPreferences() {
    const response = await api.get('/notifications/preferences')
    return response.data
  }

  /**
   * Update notification preferences
   * @param {Object} preferences
   * @returns {Promise<Object>}
   */
  static async updatePreferences(preferences) {
    const response = await api.put('/notifications/preferences', preferences)
    return response.data
  }
}

export default NotificationService
