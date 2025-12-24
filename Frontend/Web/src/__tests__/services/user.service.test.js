import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import UserService from '../../services/user.service'
import api from '../../lib/api'

jest.mock('../../lib/api')

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProfile', () => {
    test('should fetch current user profile', async () => {
      const mockProfile = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User'
      }

      api.get.mockResolvedValue({ data: mockProfile })

      const result = await UserService.getProfile()

      expect(api.get).toHaveBeenCalledWith('/users/profile')
      expect(result.email).toBe('test@example.com')
      expect(result.username).toBe('testuser')
    })

    test('should handle unauthorized access', async () => {
      const errorResponse = {
        response: { status: 401, data: { message: 'Unauthorized' } }
      }

      api.get.mockRejectedValue(errorResponse)

      await expect(UserService.getProfile()).rejects.toEqual(errorResponse)
    })
  })

  describe('updateProfile', () => {
    test('should update user profile', async () => {
      const updates = { fullName: 'Updated Name' }
      const mockResponse = { id: 1, fullName: 'Updated Name' }

      api.put.mockResolvedValue({ data: mockResponse })

      const result = await UserService.updateProfile(updates)

      expect(api.put).toHaveBeenCalledWith('/users/profile', updates)
      expect(result.fullName).toBe('Updated Name')
    })
  })

  describe('updatePassword', () => {
    test('should update user password', async () => {
      const passwordData = {
        currentPassword: 'oldpass123',
        newPassword: 'newpass123'
      }
      const mockResponse = { message: 'Password updated successfully' }

      api.put.mockResolvedValue({ data: mockResponse })

      const result = await UserService.updatePassword(passwordData)

      expect(api.put).toHaveBeenCalledWith('/users/password', passwordData)
      expect(result.message).toBe('Password updated successfully')
    })

    test('should handle incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpass',
        newPassword: 'newpass123'
      }
      const errorResponse = {
        response: { data: { message: 'Current password is incorrect' } }
      }

      api.put.mockRejectedValue(errorResponse)

      await expect(UserService.updatePassword(passwordData)).rejects.toEqual(errorResponse)
    })
  })

  describe('getUserById', () => {
    test('should fetch user by ID', async () => {
      const mockUser = { id: 2, username: 'otheruser' }
      api.get.mockResolvedValue({ data: mockUser })

      const result = await UserService.getUserById(2)

      expect(api.get).toHaveBeenCalledWith('/users/2')
      expect(result.id).toBe(2)
    })
  })

  describe('getAllUsers', () => {
    test('should fetch all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ]

      api.get.mockResolvedValue({ data: mockUsers })

      const result = await UserService.getAllUsers()

      expect(api.get).toHaveBeenCalledWith('/users')
      expect(result).toHaveLength(2)
    })
  })

  describe('searchUsers', () => {
    test('should search users by query', async () => {
      const mockUsers = [{ id: 1, username: 'testuser' }]
      api.get.mockResolvedValue({ data: mockUsers })

      const result = await UserService.searchUsers('test')

      expect(api.get).toHaveBeenCalledWith('/users/search?q=test')
      expect(result).toHaveLength(1)
    })

    test('should handle special characters in query', async () => {
      const mockUsers = []
      api.get.mockResolvedValue({ data: mockUsers })

      await UserService.searchUsers('test@example.com')

      expect(api.get).toHaveBeenCalledWith('/users/search?q=test%40example.com')
    })
  })

  describe('uploadAvatar', () => {
    test('should upload user avatar', async () => {
      const mockFile = new File(['test'], 'avatar.png', { type: 'image/png' })
      const mockResponse = { url: 'https://example.com/avatar.png' }

      api.post.mockResolvedValue({ data: mockResponse })

      const result = await UserService.uploadAvatar(mockFile)

      expect(api.post).toHaveBeenCalledWith(
        '/file/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      expect(result.url).toBe('https://example.com/avatar.png')
    })
  })
})
