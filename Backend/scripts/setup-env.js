#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function setupEnvironment() {
  console.log('📝 TaskForge Environment Setup\n');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Check if .env exists
  if (fs.existsSync(envPath)) {
    console.log('📄 .env file already exists');
    
    // Read existing content
    const existingContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if JWT_SECRET needs to be generated
    if (!existingContent.includes('JWT_SECRET=') || existingContent.includes('JWT_SECRET=supersecret')) {
      console.log('🔐 Generating secure JWT secret...');
      const jwtSecret = crypto.randomBytes(64).toString('hex');
      
      let updatedContent = existingContent;
      if (existingContent.includes('JWT_SECRET=')) {
        updatedContent = existingContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`);
      } else {
        updatedContent += `\n# JWT Configuration\nJWT_SECRET=${jwtSecret}\nJWT_EXPIRE=7d\n`;
      }
      
      fs.writeFileSync(envPath, updatedContent);
      console.log('✅ JWT secret updated');
    }
    
    // Add missing environment variables
    let content = fs.readFileSync(envPath, 'utf8');
    let updated = false;
    
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
  
  // Create new .env file
  console.log('📝 Creating new .env file...');
  
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  
  const envContent = `# TaskForge Development Environment
# Generated on ${new Date().toISOString()}

# Server Configuration
NODE_ENV=development
PORT=4000

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=7d

# PostgreSQL Database (Prisma) - Analytics & User Management
DATABASE_URL="postgresql://postgres:admin@localhost:5432/TaskForge"

# MongoDB Database (Mongoose) - Tasks & Projects
MONGO_URI="mongodb://localhost:27017/TaskForge"

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug

# Optional: Cloudinary Configuration (for file uploads)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email Configuration (for notifications)  
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password

# Optional: Redis Configuration (for caching)
# REDIS_URL=redis://localhost:6379
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created with secure configuration');
  
  console.log('\n📋 Environment setup complete!');
  console.log('\n🔧 Your .env file contains:');
  console.log('✅ Secure JWT secret (64-byte random hex)');
  console.log('✅ Development server configuration');
  console.log('✅ Local database connection strings');
  console.log('✅ Security and rate limiting settings');
  
  console.log('\n📝 To use cloud databases, update these variables:');
  console.log('🔹 DATABASE_URL - Your PostgreSQL connection string');
  console.log('🔹 MONGO_URI - Your MongoDB connection string');
  
  console.log('\n🚀 Environment is ready! Next steps:');
  console.log('1. Set up your databases: npm run setup:docker OR npm run setup:local');
  console.log('2. Initialize schema: npm run db:init');
  console.log('3. Seed data: npm run db:seed');
}

// Run if called directly
if (require.main === module) {
  setupEnvironment().catch(console.error);
}

module.exports = setupEnvironment;
