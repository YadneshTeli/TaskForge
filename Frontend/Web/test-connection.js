// Quick test script to verify connection service
import { ConnectionService } from './src/services/connection.service.js'

console.log('Testing backend connectivity...')

ConnectionService.performConnectionTest()
  .then(results => {
    console.log('\n=== Connection Test Results ===')
    console.log('Timestamp:', results.timestamp)
    console.log('Overall Status:', results.overall ? '✅ Connected' : '❌ Disconnected')
    
    console.log('\n--- Health Check ---')
    const health = results.tests.health
    console.log(`Status: ${health.isConnected ? '✅' : '❌'} ${health.status}`)
    console.log(`Response Time: ${health.responseTime}ms`)
    if (health.error) console.log(`Error: ${health.error}`)
    
    console.log('\n--- Authentication ---')
    const auth = results.tests.auth
    console.log(`Status: ${auth.isConnected ? '✅' : '❌'} ${auth.status}`)
    console.log(`Response Time: ${auth.responseTime}ms`)
    console.log(`Endpoint: ${auth.endpoint || 'N/A'}`)
    if (auth.note) console.log(`Note: ${auth.note}`)
    if (auth.error) console.log(`Error: ${auth.error}`)
    
    console.log('\n--- API Base ---')
    const api = results.tests.api
    console.log(`Status: ${api.isConnected ? '✅' : '❌'} ${api.status}`)
    console.log(`Response Time: ${api.responseTime}ms`)
    console.log(`Endpoint: ${api.endpoint || 'N/A'}`)
    console.log(`Version: ${api.version || 'N/A'}`)
    if (api.error) console.log(`Error: ${api.error}`)
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message)
  })
