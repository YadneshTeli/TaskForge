import { useState, useEffect, useCallback } from 'react'
import ConnectionService from '@/services/connection.service'

export const useConnectionStatus = (autoCheck = false, interval = 30000) => {
  const [connectionStatus, setConnectionStatus] = useState({
    isChecking: false,
    isConnected: null,
    lastChecked: null,
    error: null,
    details: null
  })

  const checkConnection = useCallback(async () => {
    setConnectionStatus(prev => ({ ...prev, isChecking: true, error: null }))
    
    try {
      const result = await ConnectionService.checkBackendConnection()
      setConnectionStatus({
        isChecking: false,
        isConnected: result.isConnected,
        lastChecked: new Date(),
        error: result.error || null,
        details: result
      })
    } catch (error) {
      setConnectionStatus({
        isChecking: false,
        isConnected: false,
        lastChecked: new Date(),
        error: error.message,
        details: null
      })
    }
  }, [])

  const performFullTest = useCallback(async () => {
    setConnectionStatus(prev => ({ ...prev, isChecking: true, error: null }))
    
    try {
      const result = await ConnectionService.performConnectionTest()
      setConnectionStatus({
        isChecking: false,
        isConnected: result.overall,
        lastChecked: new Date(),
        error: null,
        details: result
      })
    } catch (error) {
      setConnectionStatus({
        isChecking: false,
        isConnected: false,
        lastChecked: new Date(),
        error: error.message,
        details: null
      })
    }
  }, [])

  // Auto-check connection on interval
  useEffect(() => {
    if (autoCheck) {
      checkConnection()
      const intervalId = setInterval(checkConnection, interval)
      return () => clearInterval(intervalId)
    }
  }, [autoCheck, interval, checkConnection])

  return {
    ...connectionStatus,
    checkConnection,
    performFullTest
  }
}
