#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

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
    execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ ${description}: Available`);
    return true;
  } catch {
    console.log(`❌ ${description}: Not available`);
    return false;
  }
}

export async function setupLocalDatabases() {
  console.log('💻 TaskForge Local Database Setup\n');
  
  const psqlAvailable = testCommand('psql --version', 'psql command');
  const pgReady = testCommand('pg_isready', 'PostgreSQL server');
  const mongoAvailable = testCommand('mongosh --version', 'mongosh command');
  
  console.log(`PostgreSQL: ${psqlAvailable && pgReady ? '✅ Ready' : '❌ Not Ready'}`);
  console.log(`MongoDB: ${mongoAvailable ? '✅ Ready' : '❌ Not Ready'}`);
  
  const pgPassword = await ask('🔑 Enter PostgreSQL password for "postgres" user (or press Enter to skip): ');
  if (pgPassword.trim()) {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      const newDatabaseUrl = `postgresql://postgres:${pgPassword.trim()}@localhost:5432/TaskForge`;
      envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${newDatabaseUrl}"`);
      fs.writeFileSync(envPath, envContent);
      console.log('✅ PostgreSQL URL updated in .env file');
    }
  }
  
  rl.close();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  setupLocalDatabases().catch(console.error);
}

export default setupLocalDatabases;
