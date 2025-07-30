#!/usr/bin/env node

/**
 * TaskForge Development Setup and Connection Manager
 * This script helps setup and maintain the connection between frontend and backend
 */

import { execSync, spawn } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import process from 'process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logHeader(message) {
  log('\n' + '='.repeat(50), 'cyan')
  log(message, 'bright')
  log('='.repeat(50), 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

class TaskForgeDevManager {
  constructor() {
    this.frontendPath = __dirname
    this.backendPath = join(__dirname, '..', '..', 'Backend')
    this.rootPath = join(__dirname, '..', '..')
  }

  // Check if required directories exist
  checkDirectories() {
    logHeader('Checking Project Structure')
    
    const directories = [
      { path: this.frontendPath, name: 'Frontend' },
      { path: this.backendPath, name: 'Backend' },
      { path: join(this.frontendPath, 'src'), name: 'Frontend Source' },
      { path: join(this.backendPath, 'src'), name: 'Backend Source' }
    ]

    let allExist = true
    directories.forEach(({ path, name }) => {
      if (existsSync(path)) {
        logSuccess(`${name} directory found`)
      } else {
        logError(`${name} directory not found at: ${path}`)
        allExist = false
      }
    })

    return allExist
  }

  // Check package.json files
  checkPackageFiles() {
    logHeader('Checking Package Configuration')
    
    const packageFiles = [
      { path: join(this.frontendPath, 'package.json'), name: 'Frontend' },
      { path: join(this.backendPath, 'package.json'), name: 'Backend' }
    ]

    packageFiles.forEach(({ path, name }) => {
      if (existsSync(path)) {
        try {
          const pkg = JSON.parse(readFileSync(path, 'utf8'))
          logSuccess(`${name} package.json is valid`)
          logInfo(`  Name: ${pkg.name}`)
          logInfo(`  Version: ${pkg.version}`)
        } catch (error) {
          logError(`${name} package.json is invalid: ${error.message}`)
        }
      } else {
        logError(`${name} package.json not found`)
      }
    })
  }

  // Check environment configuration
  checkEnvironment() {
    logHeader('Checking Environment Configuration')
    
    const envPath = join(this.frontendPath, '.env')
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf8')
        logSuccess('Frontend .env file found')
        
        const envVars = {}
        envContent.split('\n').forEach(line => {
          const [key, value] = line.split('=')
          if (key && value) {
            envVars[key.trim()] = value.trim()
          }
        })

        if (envVars.VITE_API_URL) {
          logInfo(`API URL: ${envVars.VITE_API_URL}`)
        } else {
          logWarning('VITE_API_URL not set in .env')
        }

        if (envVars.VITE_GRAPHQL_URL) {
          logInfo(`GraphQL URL: ${envVars.VITE_GRAPHQL_URL}`)
        } else {
          logWarning('VITE_GRAPHQL_URL not set in .env')
        }

      } catch (error) {
        logError(`Error reading .env file: ${error.message}`)
      }
    } else {
      logWarning('.env file not found in frontend')
      this.createDefaultEnv()
    }
  }

  // Create default .env file
  createDefaultEnv() {
    logInfo('Creating default .env file...')
    const defaultEnv = `# API Configuration
VITE_API_URL=http://localhost:4000/api
VITE_GRAPHQL_URL=http://localhost:4000/graphql

# Development Configuration
VITE_NODE_ENV=development

# Backend Connection Testing
VITE_CONNECTION_TEST_INTERVAL=30000
VITE_CONNECTION_RETRY_ATTEMPTS=3
`
    try {
      writeFileSync(join(this.frontendPath, '.env'), defaultEnv)
      logSuccess('Default .env file created')
    } catch (error) {
      logError(`Failed to create .env file: ${error.message}`)
    }
  }

  // Test connection to backend
  async testConnection() {
    logHeader('Testing Backend Connection')
    
    try {
      // Import and run connection test
      const { ConnectionService } = await import('./src/services/connection.service.js')
      const results = await ConnectionService.performConnectionTest()
      
      logInfo(`Overall Status: ${results.overall ? '✅ Connected' : '❌ Disconnected'}`)
      
      // Display results
      const tests = ['health', 'auth', 'api']
      tests.forEach(testName => {
        const test = results.tests[testName]
        if (test) {
          const status = test.isConnected ? '✅' : '❌'
          log(`${status} ${testName.toUpperCase()}: ${test.status} (${test.responseTime}ms)`)
          if (test.error) {
            logError(`  Error: ${test.error}`)
          }
        }
      })

      return results.overall
    } catch (error) {
      logError(`Connection test failed: ${error.message}`)
      return false
    }
  }

  // Install dependencies
  async installDependencies(target = 'both') {
    logHeader(`Installing Dependencies (${target})`)
    
    const installCommands = []
    
    if (target === 'frontend' || target === 'both') {
      installCommands.push({
        name: 'Frontend',
        command: 'npm install',
        cwd: this.frontendPath
      })
    }
    
    if (target === 'backend' || target === 'both') {
      installCommands.push({
        name: 'Backend',
        command: 'npm install',
        cwd: this.backendPath
      })
    }

    for (const { name, command, cwd } of installCommands) {
      try {
        logInfo(`Installing ${name} dependencies...`)
        execSync(command, { cwd, stdio: 'inherit' })
        logSuccess(`${name} dependencies installed`)
      } catch (error) {
        logError(`Failed to install ${name} dependencies: ${error.message}`)
      }
    }
  }

  // Start development servers
  async startDevelopment() {
    logHeader('Starting Development Servers')
    
    // Start backend first
    logInfo('Starting backend server...')
    const backend = spawn('npm', ['start'], {
      cwd: this.backendPath,
      stdio: 'inherit',
      shell: true
    })

    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Start frontend
    logInfo('Starting frontend server...')
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: this.frontendPath,
      stdio: 'inherit',
      shell: true
    })

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logInfo('Shutting down servers...')
      backend.kill()
      frontend.kill()
      process.exit(0)
    })

    logSuccess('Development servers started!')
    logInfo('Backend: Check your backend terminal for the port')
    logInfo('Frontend: Typically running on http://localhost:5173')
    logInfo('Press Ctrl+C to stop both servers')
  }

  // Main menu
  async showMenu() {
    logHeader('TaskForge Development Manager')
    
    console.log('Available commands:')
    console.log('1. check    - Check project setup and configuration')
    console.log('2. test     - Test backend connection')
    console.log('3. install  - Install dependencies (frontend/backend/both)')
    console.log('4. start    - Start development servers')
    console.log('5. setup    - Complete project setup')
    console.log('')
  }

  // Complete setup process
  async completeSetup() {
    logHeader('Complete TaskForge Setup')
    
    // Step 1: Check directories
    if (!this.checkDirectories()) {
      logError('Project structure is incomplete. Please check your directory structure.')
      return false
    }

    // Step 2: Check packages
    this.checkPackageFiles()

    // Step 3: Check environment
    this.checkEnvironment()

    // Step 4: Install dependencies
    await this.installDependencies('both')

    // Step 5: Test connection
    const connectionWorks = await this.testConnection()

    if (connectionWorks) {
      logSuccess('Setup complete! Your TaskForge development environment is ready.')
      logInfo('Run "node dev-manager.js start" to start development servers')
    } else {
      logWarning('Setup complete but backend connection failed.')
      logInfo('You may need to start the backend server separately.')
    }

    return true
  }
}

// CLI Interface
async function main() {
  const manager = new TaskForgeDevManager()
  const command = process.argv[2]

  switch (command) {
    case 'check':
      manager.checkDirectories()
      manager.checkPackageFiles()
      manager.checkEnvironment()
      break
    
    case 'test':
      await manager.testConnection()
      break
    
    case 'install': {
      const target = process.argv[3] || 'both'
      await manager.installDependencies(target)
      break
    }
    
    case 'start':
      await manager.startDevelopment()
      break
    
    case 'setup':
      await manager.completeSetup()
      break
    
    default:
      await manager.showMenu()
      logInfo('Usage: node dev-manager.js <command>')
      break
  }
}

// Run the CLI
main().catch(error => {
  logError(`Error: ${error.message}`)
  process.exit(1)
})
