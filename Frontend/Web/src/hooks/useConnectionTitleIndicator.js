import { useEffect } from 'react'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'

export const useConnectionTitleIndicator = () => {
  const { isConnected, isChecking } = useConnectionStatus()

  useEffect(() => {
    // Only in development mode
    if (import.meta.env.MODE !== 'development') return

    const originalTitle = document.title.replace(/^[🟢🔴🔵]\s*/u, '') // Remove existing indicators

    let indicator = ''
    if (isChecking) {
      indicator = '🔵 '  // Blue circle for checking
    } else if (isConnected === true) {
      indicator = '🟢 '  // Green circle for connected
    } else if (isConnected === false) {
      indicator = '🔴 '  // Red circle for disconnected
    }

    document.title = indicator + originalTitle

    // Cleanup on unmount
    return () => {
      document.title = originalTitle
    }
  }, [isConnected, isChecking])
}

export default useConnectionTitleIndicator
