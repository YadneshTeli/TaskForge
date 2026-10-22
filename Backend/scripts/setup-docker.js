#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

export async function setupDockerDatabases() {
  console.log('🐳 TaskForge Docker Database Setup\n');
  
  const dockerAvailable = runCommand('docker --version', 'Checking Docker');
  const composeAvailable = runCommand('docker-compose --version', 'Checking Docker Compose');
  
  if (!dockerAvailable || !composeAvailable) {
    console.log('\n❌ Docker or Docker Compose not available.');
    process.exit(1);
  }
  
  const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
  if (!fs.existsSync(dockerComposePath)) {
    console.log('❌ docker-compose.yml not found in Backend directory');
    process.exit(1);
  }
  
  runCommand('docker-compose down', 'Stopping existing containers');
  if (!runCommand('docker-compose up -d postgres mongodb redis', 'Starting database containers')) {
    process.exit(1);
  }
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      'DATABASE_URL="postgresql://taskforge_user:taskforge_password_2024@localhost:5432/taskforge_db?schema=public"'
    );
    envContent = envContent.replace(
      /MONGO_URI=.*/,
      'MONGO_URI="mongodb://taskforge_admin:taskforge_mongo_2024@localhost:27017/taskforge_mongo?authSource=admin"'
    );
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment file updated for Docker setup');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  setupDockerDatabases().catch(console.error);
}

export default setupDockerDatabases;
