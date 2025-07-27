const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnections() {
  console.log('🧪 Testing TaskForge Database Connections...\n');
  
  let postgresOk = false;
  let mongoOk = false;
  
  // Test PostgreSQL Connection
  console.log('📊 Testing PostgreSQL Connection...');
  try {
    await prisma.$connect();
    
    // Test basic operations
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const notificationCount = await prisma.notification.count();
    
    console.log('✅ PostgreSQL: Connected Successfully');
    console.log(`   └── Database: Connected`);
    console.log(`   └── Users: ${userCount}`);
    console.log(`   └── Projects: ${projectCount}`);
    console.log(`   └── Notifications: ${notificationCount}`);
    
    // Test analytics tables
    try {
      const userStatsCount = await prisma.userStats.count();
      const projectAnalyticsCount = await prisma.projectAnalytics.count();
      const taskMetricsCount = await prisma.taskMetrics.count();
      
      console.log(`   └── User Stats: ${userStatsCount}`);
      console.log(`   └── Project Analytics: ${projectAnalyticsCount}`);
      console.log(`   └── Task Metrics: ${taskMetricsCount}`);
    } catch (analyticsError) {
      console.log('   ⚠️  Analytics tables not found. Run migrations.');
    }
    
    postgresOk = true;
    
  } catch (error) {
    console.log('❌ PostgreSQL: Connection Failed');
    console.log(`   └── Error: ${error.message}`);
    console.log('   └── Check DATABASE_URL in .env file');
    console.log('   └── Ensure PostgreSQL server is running');
  }
  
  console.log('');
  
  // Test MongoDB Connection
  console.log('🍃 Testing MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('✅ MongoDB: Connected Successfully');
    console.log(`   └── Database: ${mongoose.connection.name}`);
    console.log(`   └── Collections: ${collectionNames.length > 0 ? collectionNames.join(', ') : 'None'}`);
    
    // Test task collection if it exists
    try {
      const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
      const taskCount = await Task.countDocuments();
      console.log(`   └── Tasks: ${taskCount}`);
    } catch (taskError) {
      console.log('   └── Tasks: Collection not created yet');
    }
    
    mongoOk = true;
    
  } catch (error) {
    console.log('❌ MongoDB: Connection Failed');
    console.log(`   └── Error: ${error.message}`);
    console.log('   └── Check MONGO_URI in .env file');
    console.log('   └── Ensure MongoDB server is running');
  }
  
  console.log('');
  
  // Connection Summary
  console.log('📋 Connection Status Summary:');
  console.log(`PostgreSQL (Analytics): ${postgresOk ? '✅ Ready' : '❌ Failed'}`);
  console.log(`MongoDB (Tasks): ${mongoOk ? '✅ Ready' : '❌ Failed'}`);
  
  if (postgresOk && mongoOk) {
    console.log('\n🎉 All database connections successful!');
    console.log('\n🚀 Ready to start your server:');
    console.log('   npm run dev');
  } else {
    console.log('\n⚠️  Some connections failed. Please fix the issues above.');
    console.log('\n🔧 Common solutions:');
    console.log('   1. Check your .env file configuration');
    console.log('   2. Ensure database servers are running');
    console.log('   3. Run: npm run setup-db (to create databases)');
  }
  
  // Environment Info
  console.log('\n🔧 Environment Configuration:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`PORT: ${process.env.PORT || 'not set'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Not set'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
  
  // Cleanup connections
  try {
    await prisma.$disconnect();
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  } catch (cleanupError) {
    console.log('⚠️  Error during cleanup:', cleanupError.message);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  testConnections();
}

module.exports = testConnections;
