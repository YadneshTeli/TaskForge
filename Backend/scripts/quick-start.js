#!/usr/bin/env node

const { execSync } = require('child_process');

function runStep(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    return false;
  }
}

async function quickStart() {
  console.log('🚀 TaskForge Quick Database Setup');
  console.log('==================================\n');
  
  console.log('This script will quickly set up your databases with sample data.');
  console.log('Make sure your databases are running and .env is configured.\n');
  
  const steps = [
    ['npm install', 'Installing dependencies'],
    ['npx prisma generate', 'Generating Prisma client'],
    ['npx prisma migrate dev --name init', 'Running database migrations'],
    ['node scripts/db-init.js', 'Initializing databases with admin users'],
    ['node scripts/smart-seed.js', 'Seeding with comprehensive sample data'],
    ['node scripts/test-connections.js', 'Testing final setup']
  ];
  
  let successful = 0;
  
  for (const [command, description] of steps) {
    if (runStep(command, description)) {
      successful++;
    } else {
      console.log(`\n⚠️  Step failed, but continuing...`);
    }
  }
  
  console.log(`\n📊 Quick Setup Results: ${successful}/${steps.length} steps completed`);
  
  if (successful >= 4) {
    console.log('\n🎉 Quick setup successful!');
    
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@taskforge.com / admin123');
    console.log('User: test@taskforge.com / test123');
    
    console.log('\n🚀 Ready to start development:');
    console.log('npm run dev');
    
  } else {
    console.log('\n⚠️  Quick setup had issues. Try individual steps:');
    console.log('1. npm run db:test     - Test connections');
    console.log('2. npm run db:init     - Initialize schema');
    console.log('3. npm run db:seed     - Add sample data');
  }
}

// Run if called directly
if (require.main === module) {
  quickStart().catch(console.error);
}

module.exports = quickStart;
