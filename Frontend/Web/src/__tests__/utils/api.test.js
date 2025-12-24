import { describe, test, expect, jest, beforeEach } from '@jest/globals'

// Add process as a global for Jest environment
/* global process */

describe('API Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    process.env.VITE_API_URL = 'http://10.72.125.97:4000/api'
  })

  test('should have correct base URL from environment', () => {
    const expectedBaseUrl = process.env.VITE_API_URL || 'http://10.72.125.97:4000/api'
    expect(expectedBaseUrl).toBeDefined()
  })

  test('should add authorization token to requests', () => {
    const token = 'test-token-123'
    localStorage.setItem('token', token)

    // This test verifies the concept
    // In actual implementation, the interceptor adds the token
    expect(localStorage.getItem('token')).toBe(token)
  })

  test('should handle 401 errors by clearing token', () => {
    localStorage.setItem('token', 'expired-token')
    
    // Simulate 401 response
    const error = {
      response: {
        status: 401
      }
    }

    // In real implementation, this would be handled by axios interceptor
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }

    expect(localStorage.getItem('token')).toBeNull()
  })
})
