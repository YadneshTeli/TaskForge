import { useEffect, useRef } from 'react'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'

export const useConnectionNotifications = () => {
  const { isConnected, error } = useConnectionStatus()
  const previousConnection = useRef(null)
  const hasShownInitialStatus = useRef(false)

  useEffect(() => {
    // Don't show notifications in production
    if (import.meta.env.MODE !== 'development') return

    // Skip the first render to avoid showing notification on initial load
    if (!hasShownInitialStatus.current) {
      hasShownInitialStatus.current = true
      previousConnection.current = isConnected
      return
    }

    // Only show notification if connection status actually changed
    if (previousConnection.current !== null && previousConnection.current !== isConnected) {
      const title = isConnected ? 'Backend Connected' : 'Backend Disconnected'
      const message = isConnected 
        ? 'Connection to backend restored'
        : error || 'Lost connection to backend'

      // Use browser notification if permission granted, otherwise console
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'connection-status'
        })
      } else {
        console.log(`[Connection Status] ${title}: ${message}`)
      }
    }

    previousConnection.current = isConnected
  }, [isConnected, error])

  // Request notification permission on first use
  useEffect(() => {
    if (import.meta.env.MODE === 'development' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [])
}

export default useConnectionNotifications
