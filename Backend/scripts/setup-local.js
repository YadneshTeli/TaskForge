#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function testCommand(command, description) {
  console.log(`🔍 Testing ${description}...`);
  try {
    const output = execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ ${description}: Available`);
    return true;
  } catch (error) {
    console.log(`❌ ${description}: Not available`);
    return false;
  }
}

async function setupLocalDatabases() {
  console.log('💻 TaskForge Local Database Setup\n');
  
  console.log('🔍 Checking local database installations...\n');
  
  // Check PostgreSQL
  console.log('📊 PostgreSQL Check:');
  const psqlAvailable = testCommand('psql --version', 'psql command');
  const pgReady = testCommand('pg_isready', 'PostgreSQL server');
  
  console.log('\\n🍃 MongoDB Check:');
  const mongoAvailable = testCommand('mongo --version', 'mongo command') || 
                        testCommand('mongosh --version', 'mongosh command');
  const mongoService = testCommand('mongosh --eval "db.runCommand({ ping: 1 })"', 'MongoDB server');
  
  console.log('\\n📋 Installation Status:');
  console.log(`PostgreSQL: ${psqlAvailable && pgReady ? '✅ Ready' : '❌ Not Ready'}`);
  console.log(`MongoDB: ${mongoAvailable && mongoService ? '✅ Ready' : '❌ Not Ready'}`);
  
  if (!(psqlAvailable && pgReady) || !(mongoAvailable && mongoService)) {
    console.log('\\n🚨 Missing Database Installations');
    console.log('\\n📥 Installation Guides:');
    
    if (!(psqlAvailable && pgReady)) {
      console.log('\\n🐘 PostgreSQL Installation:');
      console.log('🔗 Download: https://www.postgresql.org/download/');
      console.log('📋 Steps:');
      console.log('   1. Download and install PostgreSQL');
      console.log('   2. Remember the password for "postgres" user');
      console.log('   3. Ensure PostgreSQL service is running');
      console.log('   4. Create database: CREATE DATABASE "TaskForge";');
    }
    
    if (!(mongoAvailable && mongoService)) {
      console.log('\\n🍃 MongoDB Installation:');
      console.log('🔗 Download: https://www.mongodb.com/try/download/community');
      console.log('📋 Steps:');
      console.log('   1. Download and install MongoDB Community Server');
      console.log('   2. Start MongoDB service');
      console.log('   3. Database "TaskForge" will be created automatically');
    }
    
    console.log('\\n🔄 Run this script again after installation.');
    console.log('💡 Tip: Consider using Docker setup for easier installation: npm run setup:docker');
    
    const continueAnyway = await ask('\\n⚠️  Continue setup anyway? (y/N): ');
    if (continueAnyway.toLowerCase() !== 'y') {
      console.log('👋 Setup cancelled. Install databases and try again.');
      process.exit(1);
    }
  }
  
  console.log('\\n🔧 Database Configuration Setup...');
  
  // PostgreSQL setup
  console.log('\\n🐘 PostgreSQL Configuration:');
  console.log('📋 Please ensure you have:');
  console.log('✅ PostgreSQL installed and running');
  console.log('✅ Database "TaskForge" created');
  console.log('✅ User "postgres" with known password');
  
  const pgPassword = await ask('🔑 Enter PostgreSQL password for "postgres" user: ');
  
  if (pgPassword.trim()) {
    console.log('🧪 Testing PostgreSQL connection...');
    try {
      const testCmd = `PGPASSWORD="${pgPassword}" psql -U postgres -h localhost -d TaskForge -c "SELECT 1;"`;
      execSync(testCmd, { stdio: 'pipe' });
      console.log('✅ PostgreSQL connection successful');
      
      // Update .env file
      console.log('📝 Updating environment configuration...');
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env');
      
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        const newDatabaseUrl = `postgresql://postgres:${pgPassword}@localhost:5432/TaskForge`;
        envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${newDatabaseUrl}"`);
        fs.writeFileSync(envPath, envContent);
        console.log('✅ PostgreSQL URL updated in .env file');
      }
      
    } catch (error) {
      console.log('❌ PostgreSQL connection failed');
      console.log('🔧 Please check:');
      console.log('   - PostgreSQL service is running');
      console.log('   - Database "TaskForge" exists');
      console.log('   - Password is correct');
      console.log('   - User "postgres" has access to database');
    }
  }
  
  // MongoDB setup
  console.log('\\n🍃 MongoDB Configuration:');
  console.log('📋 Please ensure you have:');
  console.log('✅ MongoDB installed and running');
  console.log('✅ MongoDB service started');
  
  console.log('🧪 Testing MongoDB connection...');
  try {
    const mongoCmd = 'mongosh --eval "db.runCommand({ ping: 1 })" TaskForge';
    execSync(mongoCmd, { stdio: 'pipe' });
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.log('❌ MongoDB connection failed');
    console.log('🔧 Please check:');
    console.log('   - MongoDB service is running');
    console.log('   - MongoDB is accessible on localhost:27017');
    
    // Try alternative connection test
    try {
      execSync('mongosh --eval "db.runCommand({ ping: 1 })"', { stdio: 'pipe' });
      console.log('✅ MongoDB server is running (will create TaskForge database automatically)');
    } catch (altError) {
      console.log('❌ MongoDB server not accessible');
    }
  }
  
  console.log('\\n✅ Local database setup completed!');
  
  console.log('\\n📊 Your Local Database Configuration:');
  console.log(`🐘 PostgreSQL: postgresql://postgres:${pgPassword ? '[password]' : '[your_password]'}@localhost:5432/TaskForge`);
  console.log('🍃 MongoDB: mongodb://localhost:27017/TaskForge');
  
  console.log('\\n🛠️  Database Management Tools:');
  console.log('🔧 PostgreSQL:');
  console.log('   - pgAdmin: https://www.pgadmin.org/');
  console.log('   - DBeaver: https://dbeaver.io/');
  console.log('   - Command line: psql -U postgres -d TaskForge');
  
  console.log('🔧 MongoDB:');
  console.log('   - MongoDB Compass: https://www.mongodb.com/products/compass');
  console.log('   - Command line: mongosh TaskForge');
  
  console.log('\\n🚀 Local databases are configured!');
  console.log('\\n🎯 Next steps:');
  console.log('1. Initialize database schema: npm run db:init');
  console.log('2. Seed with sample data: npm run db:seed');
  console.log('3. Start development server: npm run dev');
  
  rl.close();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Local setup interrupted');
  rl.close();
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  setupLocalDatabases().catch(console.error);
}

module.exports = setupLocalDatabases;
