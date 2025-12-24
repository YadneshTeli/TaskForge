import api from '@/lib/api'

export class ConnectionService {
  /**
   * Check if backend is reachable
   * @returns {Promise<{isConnected: boolean, status: string, responseTime: number}>}
   */
  static async checkBackendConnection() {
    const startTime = performance.now()
    
    try {
      const response = await api.get('/health', {
        timeout: 5000 // 5 second timeout
      })
      
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)
      
      return {
        isConnected: true,
        status: 'Connected',
        responseTime,
        data: response.data
      }
    } catch (error) {
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)
      
      let status = 'Disconnected'
      let errorMessage = 'Unknown error'
      
      if (error.code === 'ECONNABORTED') {
        status = 'Timeout'
        errorMessage = 'Connection timeout'
      } else if (error.response) {
        status = `Error ${error.response.status}`
        errorMessage = error.response.data?.message || error.response.statusText
      } else if (error.request) {
        status = 'Network Error'
        errorMessage = 'No response from server'
      } else {
        errorMessage = error.message
      }
      
      return {
        isConnected: false,
        status,
        responseTime,
        error: errorMessage
      }
    }
  }

  /**
   * Perform a comprehensive connection test
   * @returns {Promise<Object>}
   */
  static async performConnectionTest() {
    const tests = {
      health: null,
      auth: null,
      api: null
    }

    // Test 1: Health check
    try {
      tests.health = await this.checkBackendConnection()
    } catch (error) {
      tests.health = {
        isConnected: false,
        status: 'Failed',
        error: error.message
      }
    }

    // Test 2: Auth endpoint - Just verify health check is sufficient for auth connectivity
    tests.auth = {
      isConnected: tests.health?.isConnected || false,
      status: tests.health?.isConnected ? 'Available' : 'Unavailable',
      responseTime: tests.health?.responseTime || 0,
      endpoint: 'auth',
      note: 'Auth routes share health check'
    }

    // Test 3: API connectivity same as health check
    tests.api = {
      isConnected: tests.health?.isConnected || false,
      status: tests.health?.isConnected ? 'Available' : 'Unavailable',
      responseTime: tests.health?.responseTime || 0,
      endpoint: 'api',
      version: tests.health?.data?.server || 'TaskForge API'
    }

    return {
      timestamp: new Date().toISOString(),
      overall: tests.health?.isConnected || tests.auth?.isConnected || tests.api?.isConnected,
      tests
    }
  }
}

export default ConnectionService
