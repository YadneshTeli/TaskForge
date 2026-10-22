#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import setupEnvironment from './setup-env.js';

export async function main() {
  console.log('🚀 Welcome to TaskForge Development Setup!\n');
  await setupEnvironment();
  try {
    execSync('node node_modules/prisma/build/index.js generate', { stdio: 'inherit' });
  } catch {
    console.log('⚠️  Prisma generate skipped');
  }
  console.log('\n✅ Environment and Prisma client ready!');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export default main;
