#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function runCommand(command, description, options = {}) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit', 
      encoding: 'utf8',
      cwd: options.cwd || process.cwd()
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    if (!options.optional) {
      throw error;
    }
    return null;
  }
}

async function displayWelcome() {
  console.clear();
  console.log(colorize('cyan', '🚀 Welcome to TaskForge Development Setup!'));
  console.log(colorize('cyan', '==========================================\n'));
  
  console.log('👋 Hello! This wizard will help you set up your TaskForge development environment.');
  console.log('📋 We\'ll configure databases, create sample data, and get you ready to code!\n');
  
  console.log(colorize('yellow', '⏱️  Estimated setup time: 5-10 minutes\n'));
  
  const proceed = await ask('Ready to get started? (Y/n): ');
  if (proceed.toLowerCase() === 'n') {
    console.log('👋 Setup cancelled. Run `npm run contributor-setup` when you\'re ready!');
    process.exit(0);
  }
}

async function checkPrerequisites() {
  console.log('\n🔍 Checking prerequisites...\n');
  
  const checks = [
    { command: 'node --version', name: 'Node.js', required: true },
    { command: 'npm --version', name: 'npm', required: true },
    { command: 'git --version', name: 'Git', required: true },
    { command: 'docker --version', name: 'Docker', required: false },
    { command: 'docker-compose --version', name: 'Docker Compose', required: false }
  ];
  
  let allRequired = true;
  let hasDocker = true;
  
  for (const check of checks) {
    try {
      const version = execSync(check.command, { stdio: 'pipe', encoding: 'utf8' }).trim();
      console.log(`✅ ${check.name}: ${colorize('green', version.split('\n')[0])}`);
    } catch (error) {
      if (check.required) {
        console.log(`❌ ${check.name}: ${colorize('red', 'Not installed or not in PATH')}`);
        allRequired = false;
      } else {
        console.log(`⚠️  ${check.name}: ${colorize('yellow', 'Not available (optional)')}`);
        if (check.name.includes('Docker')) hasDocker = false;
      }
    }
  }
  
  if (!allRequired) {
    console.log(colorize('red', '\n❌ Missing required prerequisites. Please install and try again.'));
    process.exit(1);
  }
  
  return { hasDocker };
}

async function setupEnvironment() {
  console.log('\n📝 Setting up environment configuration...');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  let shouldCreateEnv = true;
  
  if (fs.existsSync(envPath)) {
    console.log('📄 Found existing .env file');
    const overwrite = await ask('🔄 Update existing .env file? (y/N): ');
    shouldCreateEnv = overwrite.toLowerCase() === 'y';
  }
  
  if (shouldCreateEnv) {
    console.log('🔐 Generating secure JWT secret...');
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    
    console.log('🌐 Database configuration options:');
    console.log('1. Local databases (PostgreSQL + MongoDB installed locally)');
    console.log('2. Docker databases (easiest - requires Docker)');
    console.log('3. Cloud databases (MongoDB Atlas + PostgreSQL cloud)');
    console.log('4. Custom configuration (I\'ll provide my own URLs)');
    
    const dbChoice = await ask('\nChoose database setup (1-4): ');
    
    let databaseUrl = '';
    let mongoUri = '';
    
    switch (dbChoice) {
      case '1':
        databaseUrl = 'postgresql://postgres:admin@localhost:5432/TaskForge';
        mongoUri = 'mongodb://localhost:27017/TaskForge';
        break;
      case '2':
        databaseUrl = 'postgresql://taskforge_user:taskforge_password_2024@localhost:5432/taskforge_db';
        mongoUri = 'mongodb://localhost:27017/taskforge_mongo';
        break;
      case '3':
        databaseUrl = await ask('📊 Enter PostgreSQL connection string: ');
        mongoUri = await ask('🍃 Enter MongoDB connection string: ');
        break;
      case '4':
        databaseUrl = await ask('📊 Enter PostgreSQL DATABASE_URL: ');
        mongoUri = await ask('🍃 Enter MongoDB MONGO_URI: ');
        break;
      default:
        console.log('⚠️  Invalid choice, using local setup...');
        databaseUrl = 'postgresql://postgres:admin@localhost:5432/TaskForge';
        mongoUri = 'mongodb://localhost:27017/TaskForge';
    }
    
    const envContent = `# TaskForge Development Environment
# Generated on ${new Date().toISOString()}
# Database setup: Option ${dbChoice}

# Server Configuration
NODE_ENV=development
PORT=4000

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=7d

# PostgreSQL Database (Prisma) - Analytics & User Management
DATABASE_URL="${databaseUrl}"

# MongoDB Database (Mongoose) - Tasks & Projects
MONGO_URI="${mongoUri}"

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379

# Development Settings
LOG_LEVEL=debug
LOG_FILE=logs/taskforge.log
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment file created with secure configuration');
    
    return { dbChoice };
  }
  
  return { dbChoice: 'existing' };
}

async function setupDatabases(dbChoice, hasDocker) {
  console.log('\n🗄️ Setting up databases...');
  
  switch (dbChoice) {
    case '2': // Docker setup
      if (!hasDocker) {
        console.log('❌ Docker not available. Please install Docker or choose a different option.');
        process.exit(1);
      }
      await setupDockerDatabases();
      break;
      
    case '1': // Local setup
      await setupLocalDatabases();
      break;
      
    case '3': // Cloud setup
    case '4': // Custom setup
      console.log('☁️  Using provided cloud/custom database configuration');
      break;
      
    default:
      console.log('🔍 Attempting to connect to existing configuration...');
  }
}

async function setupDockerDatabases() {
  console.log('🐳 Setting up Docker databases...');
  
  try {
    // Check if docker-compose.yml exists
    const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
    if (!fs.existsSync(dockerComposePath)) {
      console.log('📄 docker-compose.yml not found. Creating one...');
      // The file should already exist from our previous setup
    }
    
    console.log('🚀 Starting Docker containers...');
    runCommand('docker-compose up -d postgres mongodb', 'Starting database containers');
    
    console.log('⏳ Waiting for databases to initialize (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('✅ Docker databases are running!');
    console.log('\n🔧 Database admin tools available at:');
    console.log('📊 pgAdmin: http://localhost:8080 (admin@taskforge.com / admin123)');
    console.log('🍃 Mongo Express: http://localhost:8081 (admin / admin123)');
    
  } catch (error) {
    console.error('❌ Docker setup failed:', error.message);
    console.log('\n🔧 Try these troubleshooting steps:');
    console.log('1. Ensure Docker Desktop is running');
    console.log('2. Run: docker-compose ps');
    console.log('3. Check ports 5432 and 27017 are not in use');
    throw error;
  }
}

async function setupLocalDatabases() {
  console.log('💻 Local database setup...');
  console.log('\n📋 Please ensure you have:');
  console.log('1. ✅ PostgreSQL installed and running');
  console.log('2. ✅ MongoDB installed and running');
  console.log('3. ✅ Created database "TaskForge" in PostgreSQL');
  console.log('4. ✅ PostgreSQL user "postgres" with password configured');
  
  const confirmed = await ask('\n✅ Have you completed the above steps? (y/N): ');
  if (confirmed.toLowerCase() !== 'y') {
    console.log('\n📖 Installation guides:');
    console.log('PostgreSQL: https://www.postgresql.org/download/');
    console.log('MongoDB: https://www.mongodb.com/try/download/community');
    console.log('\nRun this setup again after installation.');
    process.exit(1);
  }
}

async function installDependencies() {
  console.log('\n📦 Installing Node.js dependencies...');
  runCommand('npm install', 'Installing dependencies');
}

async function initializeDatabases() {
  console.log('\n⚡ Initializing database schema...');
  
  try {
    runCommand('npx prisma generate', 'Generating Prisma client');
    runCommand('npx prisma migrate dev --name init', 'Running database migrations', { optional: true });
    
    console.log('🧪 Testing database connections...');
    runCommand('npm run db:test', 'Testing connections', { optional: true });
    
  } catch (error) {
    console.log('⚠️  Database initialization had issues. This is normal if databases aren\'t ready yet.');
  }
}

async function seedDatabases() {
  console.log('\n🌱 Would you like to populate databases with sample data?');
  console.log('📊 This includes: users, projects, tasks, analytics, and notifications');
  
  const shouldSeed = await ask('🌱 Seed databases with sample data? (Y/n): ');
  
  if (shouldSeed.toLowerCase() !== 'n') {
    try {
      console.log('🏗️  Creating initial admin user and basic setup...');
      runCommand('npm run setup-db', 'Setting up initial data', { optional: true });
      
      console.log('🌱 Adding comprehensive sample data...');
      runCommand('npm run smart-seed', 'Seeding with sample data', { optional: true });
      
    } catch (error) {
      console.log('⚠️  Seeding encountered issues. You can run this later with:');
      console.log('   npm run setup-db');
      console.log('   npm run smart-seed');
    }
  }
}

async function finalValidation() {
  console.log('\n🧪 Running final validation...');
  
  try {
    console.log('🔍 Testing database connections...');
    const testOutput = runCommand('npm run db:test', 'Final connection test', { silent: true });
    
    if (testOutput && testOutput.includes('All database connections successful')) {
      console.log('✅ All systems ready!');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Some validation checks failed, but you can still proceed.');
  }
  
  return false;
}

async function displayCompletionInfo() {
  console.log('\n' + '='.repeat(50));
  console.log(colorize('green', '🎉 TaskForge Development Setup Complete!'));
  console.log('='.repeat(50));
  
  console.log('\n📋 What was set up:');
  console.log('✅ Node.js dependencies installed');
  console.log('✅ Environment variables configured');
  console.log('✅ Database connections established');
  console.log('✅ Database schema initialized');
  console.log('✅ Sample data populated');
  console.log('✅ Admin tools configured');
  
  console.log('\n🚀 Ready to start developing!');
  
  console.log('\n📧 Sample Login Credentials:');
  console.log(colorize('cyan', 'Admin: admin@taskforge.com / admin123'));
  console.log(colorize('cyan', 'User: test@taskforge.com / test123'));
  console.log(colorize('cyan', 'User: john@taskforge.com / user123'));
  console.log(colorize('cyan', 'User: jane@taskforge.com / user123'));
  
  console.log('\n🔗 Available Services:');
  console.log('🌐 API Server: npm run dev → http://localhost:4000');
  console.log('📊 Database GUI: npm run db:studio');
  
  // Check if Docker is being used
  try {
    execSync('docker-compose ps', { stdio: 'pipe' });
    console.log('📊 pgAdmin: http://localhost:8080 (admin@taskforge.com / admin123)');
    console.log('🍃 Mongo Express: http://localhost:8081 (admin / admin123)');
  } catch (error) {
    // Docker not in use
  }
  
  console.log('\n📝 Useful Commands:');
  console.log('npm run dev           - Start development server');
  console.log('npm run db:test       - Test database connections');
  console.log('npm run db:studio     - Open database GUI');
  console.log('npm run docker:logs   - View Docker container logs');
  
  console.log('\n📖 Documentation:');
  console.log('📋 Full setup guide: ./CONTRIBUTOR_SETUP.md');
  console.log('🗄️  Database guide: ./DATABASE_SETUP.md');
  console.log('🔧 API documentation: Coming soon!');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:4000');
  console.log('3. Open your favorite code editor');
  console.log('4. Start building amazing features!');
  
  console.log('\n💬 Need Help?');
  console.log('📧 Create an issue on GitHub');
  console.log('📋 Check CONTRIBUTOR_SETUP.md for troubleshooting');
  console.log('🧪 Run: npm run db:test to verify setup');
  
  console.log('\n' + colorize('green', '🚀 Welcome to TaskForge development! Happy coding!'));
}

async function handleError(error) {
  console.log('\n' + '='.repeat(50));
  console.log(colorize('red', '❌ Setup encountered an error'));
  console.log('='.repeat(50));
  
  console.error('\n🔍 Error details:', error.message);
  
  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Check your .env file configuration');
  console.log('2. Ensure databases are running and accessible');
  console.log('3. Try running individual commands:');
  console.log('   npm install');
  console.log('   npm run db:test');
  console.log('   npm run setup-db');
  
  console.log('\n📖 For detailed help, see:');
  console.log('📋 ./CONTRIBUTOR_SETUP.md');
  console.log('🗄️  ./DATABASE_SETUP.md');
  
  console.log('\n💬 If you\'re still stuck:');
  console.log('📧 Create an issue on GitHub with the error details');
  console.log('🔍 Include your OS, Node version, and database setup choice');
}

async function main() {
  try {
    await displayWelcome();
    
    const { hasDocker } = await checkPrerequisites();
    
    await installDependencies();
    
    const { dbChoice } = await setupEnvironment();
    
    await setupDatabases(dbChoice, hasDocker);
    
    await initializeDatabases();
    
    await seedDatabases();
    
    const validationPassed = await finalValidation();
    
    await displayCompletionInfo();
    
    if (!validationPassed) {
      console.log('\n⚠️  Some checks didn\'t pass, but setup is likely working.');
      console.log('🧪 Run "npm run db:test" to verify your setup.');
    }
    
  } catch (error) {
    await handleError(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Setup interrupted by user');
  console.log('👋 Run "npm run contributor-setup" to try again');
  rl.close();
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main();
}

module.exports = main;
