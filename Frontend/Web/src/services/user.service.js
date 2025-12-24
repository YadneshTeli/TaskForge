import api from '@/lib/api'

export class UserService {
  /**
   * Get current user's profile
   * @returns {Promise<Object>}
   */
  static async getProfile() {
    const response = await api.get('/users/profile')
    return response.data
  }

  /**
   * Update current user's profile
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  static async updateProfile(updates) {
    const response = await api.put('/users/profile', updates)
    return response.data
  }

  /**
   * Update user's password
   * @param {Object} passwordData - { currentPassword, newPassword }
   * @returns {Promise<Object>}
   */
  static async updatePassword(passwordData) {
    const response = await api.put('/users/password', passwordData)
    return response.data
  }

  /**
   * Get user by ID
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async getUserById(userId) {
    const response = await api.get(`/users/${userId}`)
    return response.data
  }

  /**
   * Get all users (for admin/team views)
   * @returns {Promise<Array>}
   */
  static async getAllUsers() {
    const response = await api.get('/users')
    return response.data
  }

  /**
   * Get user's statistics
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async getUserStats(userId) {
    const response = await api.get(`/users/${userId}/stats`)
    return response.data
  }

  /**
   * Upload user avatar
   * @param {File} file
   * @returns {Promise<Object>}
   */
  static async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Search users by name or email
   * @param {string} query
   * @returns {Promise<Array>}
   */
  static async searchUsers(query) {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
    return response.data
  }
}

export default UserService
