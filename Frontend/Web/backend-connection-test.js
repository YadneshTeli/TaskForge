import { ConnectionService } from './src/services/connection.service.js'
import { readFileSync } from 'fs'
import { join } from 'path'
import process from 'process'

// Load environment variables
const envPath = join(process.cwd(), '.env')
try {
  const envContent = readFileSync(envPath, 'utf8')
  const envVars = {}
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      envVars[key.trim()] = value.trim()
    }
  })
  
  // Set environment variables for Node.js process
  Object.assign(process.env, envVars)
  console.log('✅ Environment variables loaded from .env')
} catch {
  console.log('⚠️  No .env file found, using default configuration')
}

const API_URL = process.env.VITE_API_URL || 'http://localhost:4000/api'
const GRAPHQL_URL = process.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql'

console.log('\n🔍 TaskForge Backend Connection Test')
console.log('=====================================')
console.log(`API URL: ${API_URL}`)
console.log(`GraphQL URL: ${GRAPHQL_URL}`)
console.log(`Environment: ${process.env.VITE_NODE_ENV || 'development'}`)
console.log('=====================================\n')

async function testBackendConnection() {
  try {
    console.log('🚀 Starting comprehensive backend connection test...\n')
    
    const results = await ConnectionService.performConnectionTest()
    
    console.log('📊 Connection Test Results')
    console.log('==========================')
    console.log(`⏰ Timestamp: ${results.timestamp}`)
    console.log(`🌐 Overall Status: ${results.overall ? '✅ Connected' : '❌ Disconnected'}`)
    
    // Health Check Results
    console.log('\n🏥 Health Check')
    console.log('---------------')
    const health = results.tests.health
    console.log(`Status: ${health.isConnected ? '✅' : '❌'} ${health.status}`)
    console.log(`Response Time: ${health.responseTime}ms`)
    if (health.data) {
      console.log(`Server Info: ${health.data.message || health.data.server || 'Available'}`)
      if (health.data.version) console.log(`Version: ${health.data.version}`)
      if (health.data.environment) console.log(`Environment: ${health.data.environment}`)
    }
    if (health.error) console.log(`❌ Error: ${health.error}`)
    
    // Authentication Results
    console.log('\n🔐 Authentication Endpoints')
    console.log('---------------------------')
    const auth = results.tests.auth
    console.log(`Status: ${auth.isConnected ? '✅' : '❌'} ${auth.status}`)
    console.log(`Response Time: ${auth.responseTime}ms`)
    console.log(`Endpoint: ${auth.endpoint || 'N/A'}`)
    if (auth.note) console.log(`📝 Note: ${auth.note}`)
    if (auth.error) console.log(`❌ Error: ${auth.error}`)
    
    // API Base Results
    console.log('\n🔌 API Base Connectivity')
    console.log('------------------------')
    const api = results.tests.api
    console.log(`Status: ${api.isConnected ? '✅' : '❌'} ${api.status}`)
    console.log(`Response Time: ${api.responseTime}ms`)
    console.log(`Endpoint: ${api.endpoint || 'N/A'}`)
    console.log(`Version: ${api.version || 'N/A'}`)
    if (api.error) console.log(`❌ Error: ${api.error}`)
    
    // Summary and Recommendations
    console.log('\n📋 Summary & Recommendations')
    console.log('============================')
    
    if (results.overall) {
      console.log('✅ Backend is reachable and responding')
      console.log('🚀 You can start developing with confidence!')
      
      if (health.isConnected && api.isConnected && auth.isConnected) {
        console.log('🎉 All systems are operational!')
      } else if (health.isConnected) {
        console.log('💡 Basic connectivity works, some advanced features may need attention')
      }
    } else {
      console.log('❌ Backend connection issues detected')
      console.log('\n🔧 Troubleshooting Steps:')
      console.log('1. Check if the backend server is running')
      console.log('2. Verify the API URL in your .env file')
      console.log('3. Check network connectivity')
      console.log('4. Ensure firewall/proxy settings allow the connection')
      console.log(`5. Try accessing ${API_URL.replace('/api', '')}/health directly in your browser`)
    }
    
    console.log('\n🌟 Happy coding with TaskForge! 🌟\n')
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message)
    console.error('📍 Stack trace:', error.stack)
    
    console.log('\n🔧 Possible solutions:')
    console.log('1. Check if the backend server is running')
    console.log('2. Verify network connectivity')
    console.log('3. Check your .env configuration')
    console.log('4. Ensure all dependencies are installed')
    
    process.exit(1)
  }
}

// Run the test
testBackendConnection()
