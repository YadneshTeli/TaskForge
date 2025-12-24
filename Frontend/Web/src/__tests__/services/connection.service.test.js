import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { ConnectionService } from '../../services/connection.service'
import api from '../../lib/api'

/* global global */

jest.mock('../../lib/api')

describe('ConnectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.performance.now = jest.fn(() => 1000)
  })

  describe('checkBackendConnection', () => {
    test('should return connected status when backend is reachable', async () => {
      const mockResponse = { data: { status: 'ok' } }
      api.get.mockResolvedValue(mockResponse)

      global.performance.now = jest
        .fn()
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1150)

      const result = await ConnectionService.checkBackendConnection()

      expect(api.get).toHaveBeenCalledWith('/health', { timeout: 5000 })
      expect(result.isConnected).toBe(true)
      expect(result.status).toBe('Connected')
      expect(result.responseTime).toBe(150)
    })

    test('should handle connection timeout', async () => {
      const timeoutError = new Error('timeout')
      timeoutError.code = 'ECONNABORTED'
      api.get.mockRejectedValue(timeoutError)

      global.performance.now = jest
        .fn()
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(6000)

      const result = await ConnectionService.checkBackendConnection()

      expect(result.isConnected).toBe(false)
      expect(result.status).toBe('Timeout')
      expect(result.error).toBe('Connection timeout')
    })

    test('should handle network error', async () => {
      const networkError = new Error('Network Error')
      networkError.request = {}
      api.get.mockRejectedValue(networkError)

      const result = await ConnectionService.checkBackendConnection()

      expect(result.isConnected).toBe(false)
      expect(result.status).toBe('Network Error')
      expect(result.error).toBe('No response from server')
    })

    test('should handle server error response', async () => {
      const serverError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: { message: 'Server error' }
        }
      }
      api.get.mockRejectedValue(serverError)

      const result = await ConnectionService.checkBackendConnection()

      expect(result.isConnected).toBe(false)
      expect(result.status).toBe('Error 500')
      expect(result.error).toBe('Server error')
    })
  })

  describe('performConnectionTest', () => {
    test('should perform comprehensive connection test', async () => {
      api.get.mockResolvedValue({ data: { status: 'ok' } })
      api.options.mockResolvedValue({})

      const result = await ConnectionService.performConnectionTest()

      expect(result).toHaveProperty('tests')
      expect(result.tests).toHaveProperty('health')
      expect(result.tests).toHaveProperty('auth')
      expect(result.tests).toHaveProperty('api')
      expect(result.overall).toBeDefined()
      expect(result.timestamp).toBeDefined()
    })

    test('should handle failed health check in comprehensive test', async () => {
      api.get.mockRejectedValue(new Error('Connection failed'))
      api.options.mockResolvedValue({})

      const result = await ConnectionService.performConnectionTest()

      expect(result.tests).toHaveProperty('health')
      expect(result.tests.health.isConnected).toBe(false)
    })
  })
})
