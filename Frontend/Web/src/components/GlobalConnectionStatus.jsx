import React, { useState } from 'react'
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  Keyboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useConnectionNotifications } from '@/hooks/useConnectionNotifications'
import { useConnectionTitleIndicator } from '@/hooks/useConnectionTitleIndicator'
import ConnectionTestDialog from './ConnectionTestDialog'

const GlobalConnectionStatus = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { 
    isChecking, 
    isConnected, 
    lastChecked, 
    error, 
    details,
    checkConnection 
  } = useConnectionStatus(true, 30000) // Auto-check every 30 seconds

  // Enable connection change notifications
  useConnectionNotifications()

  // Add connection indicator to browser tab title
  useConnectionTitleIndicator()

  // Keyboard shortcuts for quick access
  useKeyboardShortcut(['F12'], () => {
    if (import.meta.env.MODE === 'development') {
      setIsExpanded(!isExpanded)
    }
  })

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null
  }

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    
    if (isConnected === null) {
      return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
    
    return isConnected ? (
      <Wifi className="h-4 w-4 text-green-500" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusColor = () => {
    if (isChecking) return 'border-blue-200 bg-blue-50'
    if (isConnected === null) return 'border-gray-200 bg-gray-50'
    return isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        border rounded-lg shadow-lg transition-all duration-300 ease-in-out
        ${getStatusColor()}
        ${isExpanded ? 'w-80 p-4' : 'w-auto p-2'}
      `}>
        {/* Collapsed View */}
        {!isExpanded && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-8 px-2"
            >
              {getStatusIcon()}
              <span className="ml-2 text-xs font-medium">
                {isChecking ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </Button>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm font-medium">Backend Status</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className={
                isChecking ? 'bg-blue-100 text-blue-800' :
                isConnected === null ? 'bg-gray-100 text-gray-800' :
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }>
                {isChecking ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={checkConnection}
                disabled={isChecking}
                className="h-7 px-2"
              >
                <Activity className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {lastChecked && (
              <div className="text-xs text-gray-500">
                Last checked: {formatTime(lastChecked)}
              </div>
            )}

            {details && details.responseTime && (
              <div className="text-xs text-gray-600">
                Response time: {details.responseTime}ms
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                {error}
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 space-y-2">
              <ConnectionTestDialog>
                <Button variant="outline" size="sm" className="w-full">
                  <Activity className="h-3 w-3 mr-2" />
                  Run Full Test
                </Button>
              </ConnectionTestDialog>
              
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Shortcuts:</span>
                  <div className="flex items-center space-x-1">
                    <Keyboard className="h-3 w-3" />
                  </div>
                </div>
                <div>F12 - Toggle panel</div>
                <div>Click icon - Quick check</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalConnectionStatus
