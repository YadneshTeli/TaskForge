#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

async function setupDockerDatabases() {
  console.log('🐳 TaskForge Docker Database Setup\n');
  
  // Check if Docker is available
  console.log('🔍 Checking Docker availability...');
  const dockerAvailable = runCommand('docker --version', 'Checking Docker');
  const composeAvailable = runCommand('docker-compose --version', 'Checking Docker Compose');
  
  if (!dockerAvailable || !composeAvailable) {
    console.log('\n❌ Docker or Docker Compose not available.');
    console.log('\n📥 Please install Docker Desktop:');
    console.log('🔗 Windows/Mac: https://www.docker.com/products/docker-desktop');
    console.log('🔗 Linux: https://docs.docker.com/engine/install/');
    process.exit(1);
  }
  
  // Check if docker-compose.yml exists
  const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
  if (!fs.existsSync(dockerComposePath)) {
    console.log('❌ docker-compose.yml not found in project root');
    console.log('📁 Please ensure you\'re running this from the Backend directory');
    process.exit(1);
  }
  
  console.log('\n🚀 Starting Docker containers...');
  
  // Stop any existing containers first
  console.log('🛑 Stopping any existing containers...');
  runCommand('docker-compose down', 'Stopping existing containers');
  
  // Start database containers
  console.log('🚀 Starting database containers...');
  if (!runCommand('docker-compose up -d postgres mongodb redis', 'Starting database containers')) {
    console.log('\n🔧 Troubleshooting Docker issues:');
    console.log('1. Ensure Docker Desktop is running');
    console.log('2. Check if ports 5432, 27017, 6379 are available');
    console.log('3. Try: docker-compose down && docker-compose up -d');
    process.exit(1);
  }
  
  console.log('\n⏳ Waiting for databases to initialize...');
  console.log('📊 PostgreSQL starting...');
  console.log('🍃 MongoDB starting...');
  console.log('⚡ Redis starting...');
  
  // Wait for services to be ready
  let retries = 30;
  let allReady = false;
  
  while (retries > 0 && !allReady) {
    try {
      // Check if containers are running
      const psOutput = execSync('docker-compose ps', { encoding: 'utf8', stdio: 'pipe' });
      
      const postgresReady = psOutput.includes('taskforge_postgres') && psOutput.includes('Up');
      const mongoReady = psOutput.includes('taskforge_mongodb') && psOutput.includes('Up');
      const redisReady = psOutput.includes('taskforge_redis') && psOutput.includes('Up');
      
      if (postgresReady && mongoReady && redisReady) {
        allReady = true;
        break;
      }
      
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries--;
      
    } catch (error) {
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries--;
    }
  }
  
  console.log('\\n');
  
  if (!allReady) {
    console.log('⚠️  Containers may still be starting. Check status with: docker-compose ps');
  }
  
  // Start admin tools
  console.log('🛠️  Starting database admin tools...');
  runCommand('docker-compose up -d pgadmin mongo-express', 'Starting admin tools');
  
  console.log('\n✅ Docker setup completed!');
  
  console.log('\n📊 Database Services:');
  console.log('🐘 PostgreSQL: localhost:5432');
  console.log('   └── Database: taskforge_db');
  console.log('   └── User: taskforge_user');
  console.log('   └── Password: taskforge_password_2024');
  
  console.log('🍃 MongoDB: localhost:27017');
  console.log('   └── Database: taskforge_mongo');
  console.log('   └── User: taskforge_admin');
  console.log('   └── Password: taskforge_mongo_2024');
  
  console.log('⚡ Redis: localhost:6379');
  console.log('   └── Password: taskforge_redis_2024');
  
  console.log('\n🛠️  Database Admin Tools:');
  console.log('📊 pgAdmin: http://localhost:8080');
  console.log('   └── Email: admin@taskforge.com');
  console.log('   └── Password: admin123');
  
  console.log('🍃 Mongo Express: http://localhost:8081');
  console.log('   └── Username: admin');
  console.log('   └── Password: admin123');
  
  console.log('\n🔧 Useful Docker Commands:');
  console.log('docker-compose ps           - Check container status');
  console.log('docker-compose logs         - View all container logs');
  console.log('docker-compose logs postgres - View PostgreSQL logs');
  console.log('docker-compose down         - Stop all containers');
  console.log('docker-compose restart      - Restart all containers');
  
  console.log('\n📝 Environment File Update:');
  console.log('Your .env file should contain these Docker database URLs:');
  console.log('DATABASE_URL="postgresql://taskforge_user:taskforge_password_2024@localhost:5432/taskforge_db"');
  console.log('MONGO_URI="mongodb://localhost:27017/taskforge_mongo"');
  
  // Update .env file if it exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log('\n🔄 Updating .env file with Docker database URLs...');
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update database URLs for Docker setup
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      'DATABASE_URL="postgresql://taskforge_user:taskforge_password_2024@localhost:5432/taskforge_db"'
    );
    envContent = envContent.replace(
      /MONGO_URI=.*/,
      'MONGO_URI="mongodb://localhost:27017/taskforge_mongo"'
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment file updated for Docker setup');
  }
  
  console.log('\n🚀 Docker databases are ready!');
  console.log('\n🎯 Next steps:');
  console.log('1. Initialize database schema: npm run db:init');
  console.log('2. Seed with sample data: npm run db:seed');
  console.log('3. Start development server: npm run dev');
  console.log('4. Visit admin tools to explore your data!');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Docker setup interrupted');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  setupDockerDatabases().catch(console.error);
}

module.exports = setupDockerDatabases;
