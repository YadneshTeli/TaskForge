import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Server, 
  Database, 
  Shield, 
  Code, 
  Bug,
  Activity,
  Network
} from 'lucide-react'
import ConnectionIndicator from '@/components/ConnectionIndicator'
import ConnectionTestDialog from '@/components/ConnectionTestDialog'

const DeveloperToolsPage = () => {
  const envVars = {
    'VITE_API_URL': import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    'MODE': import.meta.env.MODE,
    'BASE_URL': import.meta.env.BASE_URL,
    'PROD': import.meta.env.PROD,
    'DEV': import.meta.env.DEV
  }

  const packageInfo = {
    name: 'TaskForge Web',
    version: '0.0.0',
    runtime: 'Browser',
    react: '19.1.0',
    vite: '7.0.5'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Developer Tools</h1>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Development Mode
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Network className="h-5 w-5" />
              <span>Backend Connection</span>
            </CardTitle>
            <CardDescription>
              Monitor and test connection to backend services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConnectionIndicator showDetails={true} />
            
            <ConnectionTestDialog>
              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Run Comprehensive Test
              </Button>
            </ConnectionTestDialog>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Environment</span>
            </CardTitle>
            <CardDescription>
              Current environment configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="font-mono text-gray-600">{key}:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {value?.toString() || 'undefined'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Package Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Build Information</span>
            </CardTitle>
            <CardDescription>
              Application and dependency versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(packageInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="capitalize text-gray-600">{key}:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>API Endpoints</span>
            </CardTitle>
            <CardDescription>
              Available backend API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { path: '/health', method: 'GET', desc: 'Server health check' },
                { path: '/auth/login', method: 'POST', desc: 'User login' },
                { path: '/auth/register', method: 'POST', desc: 'User registration' },
                { path: '/auth/me', method: 'GET', desc: 'Current user info' },
                { path: '/projects', method: 'GET', desc: 'List projects' },
                { path: '/tasks', method: 'GET', desc: 'List tasks' },
                { path: '/users', method: 'GET', desc: 'List users' },
                { path: '/reports', method: 'GET', desc: 'Generate reports' }
              ].map((endpoint, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <Badge variant="outline" className="text-xs font-mono w-12 justify-center">
                    {endpoint.method}
                  </Badge>
                  <code className="bg-gray-100 px-2 py-1 rounded flex-1">
                    {envVars.VITE_API_URL}{endpoint.path}
                  </code>
                  <span className="text-gray-500 text-xs">{endpoint.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Development Tools */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="h-5 w-5" />
              <span>Development Tools</span>
            </CardTitle>
            <CardDescription>
              Useful tools for development and debugging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => console.clear()}>
                Clear Console
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => localStorage.removeItem('token')}
              >
                Clear Auth Token
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Environment:', import.meta.env)
                  console.log('Local Storage:', localStorage)
                  console.log('User Agent:', navigator.userAgent)
                }}
              >
                Log Debug Info
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Reload Application
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  const logs = []
                  const originalLog = console.log
                  console.log = (...args) => {
                    logs.push(args.join(' '))
                    originalLog(...args)
                  }
                  alert('Console logging to array enabled. Check console for details.')
                }}
              >
                Enable Log Capture
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  const state = {
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    localStorage: Object.fromEntries(
                      Object.entries(localStorage).map(([k, v]) => [k, v.substring(0, 100)])
                    )
                  }
                  console.log('Application State:', state)
                  navigator.clipboard?.writeText(JSON.stringify(state, null, 2))
                }}
              >
                Export App State
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">Development Mode Only</h3>
              <p className="text-sm text-orange-700 mt-1">
                This page and its tools are only available in development mode. 
                They will not be included in production builds for security reasons.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DeveloperToolsPage
