#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

export async function setupEnvironment() {
  console.log('📝 TaskForge Environment Setup\n');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('📄 .env file already exists');
    let content = fs.readFileSync(envPath, 'utf8');
    let updated = false;

    if (!content.includes('JWT_SECRET=') || content.includes('JWT_SECRET=supersecret')) {
      const jwtSecret = crypto.randomBytes(64).toString('hex');
      if (content.includes('JWT_SECRET=')) {
        content = content.replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`);
      } else {
        content += `\nJWT_SECRET=${jwtSecret}\n`;
      }
      updated = true;
    }

    if (!content.includes('JWT_REFRESH_SECRET=')) {
      const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
      content += `\nJWT_REFRESH_SECRET=${jwtRefreshSecret}\n`;
      updated = true;
    }

    const requiredVars = [
      'NODE_ENV=development',
      'PORT=4000',
      'CORS_ORIGIN=http://localhost:3000,http://localhost:5173',
      'RATE_LIMIT_WINDOW_MS=900000',
      'RATE_LIMIT_MAX_REQUESTS=100',
      'LOG_LEVEL=debug'
    ];
    
    for (const varDef of requiredVars) {
      const [key] = varDef.split('=');
      if (!content.includes(`${key}=`)) {
        content += `\n${varDef}`;
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(envPath, content);
      console.log('✅ Missing environment variables added');
    }
    
    console.log('✅ Environment configuration is ready');
    return;
  }
  
  console.log('📝 Creating new .env file...');
  
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
  
  const envContent = `# TaskForge Development Environment
# Generated on ${new Date().toISOString()}

# Server Configuration
NODE_ENV=development
PORT=4000

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRE=7d

# PostgreSQL Database (Prisma) - Analytics & User Management
DATABASE_URL="postgresql://taskforge_user:taskforge_password_2024@localhost:5432/taskforge_db?schema=public"

# MongoDB Database (Mongoose) - Tasks & Projects
MONGO_URI="mongodb://localhost:27017/taskforge_mongo"

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration
EMAIL_FROM=noreply@taskforge.com
EMAIL_ENABLED=false
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created with secure configuration');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  setupEnvironment().catch(console.error);
}

export default setupEnvironment;
