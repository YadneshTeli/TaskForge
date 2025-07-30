import React from 'react'
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'

const ConnectionIndicator = ({ showDetails = false, className = '' }) => {
  const { 
    isChecking, 
    isConnected, 
    lastChecked, 
    error, 
    details,
    checkConnection 
  } = useConnectionStatus(true, 30000) // Auto-check every 30 seconds

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    
    if (isConnected === null) {
      return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
    
    return isConnected ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusText = () => {
    if (isChecking) return 'Checking...'
    if (isConnected === null) return 'Unknown'
    return isConnected ? 'Connected' : 'Disconnected'
  }

  const getStatusColor = () => {
    if (isChecking) return 'bg-blue-100 text-blue-800'
    if (isConnected === null) return 'bg-gray-100 text-gray-800'
    return isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getStatusIcon()}
        <Badge variant="outline" className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">Backend Status</span>
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkConnection}
          disabled={isChecking}
          className="h-8"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {lastChecked && (
        <div className="text-xs text-gray-500">
          Last checked: {formatTime(lastChecked)}
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      {details && details.responseTime && (
        <div className="text-xs text-gray-500">
          Response time: {details.responseTime}ms
        </div>
      )}
    </div>
  )
}

export default ConnectionIndicator
