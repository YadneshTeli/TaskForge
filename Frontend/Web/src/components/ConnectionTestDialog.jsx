import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity, 
  Server, 
  Shield, 
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'

const ConnectionTestDialog = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    isChecking, 
    details, 
    performFullTest 
  } = useConnectionStatus()

  const handleRunTest = async () => {
    await performFullTest()
  }

  const getTestIcon = (test) => {
    if (!test) return <Clock className="h-4 w-4 text-gray-400" />
    return test.isConnected ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getTestStatus = (test) => {
    if (!test) return { text: 'Not tested', color: 'bg-gray-100 text-gray-800' }
    return test.isConnected 
      ? { text: test.status, color: 'bg-green-100 text-green-800' }
      : { text: test.status, color: 'bg-red-100 text-red-800' }
  }

  const tests = [
    {
      id: 'health',
      name: 'Health Check',
      description: 'Basic server health endpoint',
      icon: <Activity className="h-5 w-5" />,
      endpoint: '/health'
    },
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Authentication service availability',
      icon: <Shield className="h-5 w-5" />,
      endpoint: '/auth/check'
    },
    {
      id: 'api',
      name: 'API Base',
      description: 'Core API connectivity',
      icon: <Globe className="h-5 w-5" />,
      endpoint: '/'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Backend Connection Test</span>
          </DialogTitle>
          <DialogDescription>
            Test the connection between frontend and backend services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Overall Status */}
          {details && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Overall Status</span>
                  <Badge variant="outline" className={
                    details.overall 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {details.overall ? 'Connected' : 'Disconnected'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Last tested: {new Date(details.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Individual Tests */}
          <div className="space-y-3">
            {tests.map((testConfig) => {
              const testResult = details?.tests?.[testConfig.id]
              const status = getTestStatus(testResult)
              
              return (
                <Card key={testConfig.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {testConfig.icon}
                        <span>{testConfig.name}</span>
                        {getTestIcon(testResult)}
                      </div>
                      <Badge variant="outline" className={status.color}>
                        {status.text}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {testConfig.description} ({testConfig.endpoint})
                    </CardDescription>
                  </CardHeader>
                  {testResult && (
                    <CardContent className="pt-0">
                      <div className="text-xs space-y-1">
                        {testResult.responseTime && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Response time:</span>
                            <span>{testResult.responseTime}ms</span>
                          </div>
                        )}
                        {testResult.error && (
                          <div className="text-red-600 bg-red-50 p-2 rounded">
                            {testResult.error}
                          </div>
                        )}
                        {testResult.version && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Version:</span>
                            <span>{testResult.version}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Configuration Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Backend URL:</span>
                  <span className="font-mono">
                    {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Environment:</span>
                  <span>{import.meta.env.MODE}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button onClick={handleRunTest} disabled={isChecking}>
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isChecking ? 'Testing...' : 'Run Test'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConnectionTestDialog
