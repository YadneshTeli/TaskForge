#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

function runStep(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch {
    console.error(`❌ ${description} failed`);
    return false;
  }
}

export async function quickStart() {
  console.log('🚀 TaskForge Quick Database Setup');
  console.log('==================================\n');
  
  const steps = [
    ['npm install', 'Installing dependencies'],
    ['node node_modules/prisma/build/index.js generate', 'Generating Prisma client'],
    ['node node_modules/prisma/build/index.js db push', 'Syncing database schema'],
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  quickStart().catch(console.error);
}

export default quickStart;
