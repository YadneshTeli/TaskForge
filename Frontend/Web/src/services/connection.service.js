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

    // Test 2: Auth endpoint - test login endpoint with OPTIONS to check availability
    const authStartTime = performance.now()
    try {
      // Try OPTIONS request to /auth/login to check if endpoint exists without authentication
      await api.options('/auth/login', { timeout: 5000 })
      const authEndTime = performance.now()
      
      tests.auth = {
        isConnected: true,
        status: 'Available',
        responseTime: Math.round(authEndTime - authStartTime),
        endpoint: '/auth/login'
      }
    } catch {
      // If OPTIONS fails, try a GET request which should return 405 Method Not Allowed if endpoint exists
      try {
        await api.get('/auth/login', { timeout: 5000 })
        const authEndTime = performance.now()
        tests.auth = {
          isConnected: true,
          status: 'Available',
          responseTime: Math.round(authEndTime - authStartTime),
          endpoint: '/auth/login'
        }
      } catch (getError) {
        const authEndTime = performance.now()
        
        // If we get 405 Method Not Allowed, the endpoint exists but doesn't accept GET
        if (getError.response?.status === 405) {
          tests.auth = {
            isConnected: true,
            status: 'Available',
            responseTime: Math.round(authEndTime - authStartTime),
            endpoint: '/auth/login',
            note: 'POST endpoint (method not allowed for GET)'
          }
        } else {
          tests.auth = {
            isConnected: false,
            status: 'Unavailable',
            responseTime: Math.round(authEndTime - authStartTime),
            error: `Auth endpoints unavailable (${getError.response?.status || getError.message})`
          }
        }
      }
    }

    // Test 3: API base connectivity - try API-specific endpoints
    const apiStartTime = performance.now()
    try {
      let apiEndpoint = '/api/health'
      let response = null
      
      try {
        // Try /api/health first (we know this exists from backend structure)
        response = await api.get('/api/health', { timeout: 5000 })
      } catch {
        try {
          // Fallback to basic health endpoint
          apiEndpoint = '/health'
          response = await api.get('/health', { timeout: 5000 })
        } catch {
          // Try to check if any API routes are available with /api root
          apiEndpoint = '/api'
          response = await api.get('/api', { timeout: 5000 })
        }
      }
      
      const apiEndTime = performance.now()
      
      tests.api = {
        isConnected: true,
        status: 'Available',
        responseTime: Math.round(apiEndTime - apiStartTime),
        endpoint: apiEndpoint,
        version: response.data?.version || response.data?.server || 'Available'
      }
    } catch (error) {
      const apiEndTime = performance.now()
      tests.api = {
        isConnected: false,
        status: 'Unavailable',
        responseTime: Math.round(apiEndTime - apiStartTime),
        error: `API endpoints unavailable (${error.response?.status || error.message})`
      }
    }

    return {
      timestamp: new Date().toISOString(),
      overall: tests.health?.isConnected || tests.auth?.isConnected || tests.api?.isConnected,
      tests
    }
  }
}

export default ConnectionService
