import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from '../src/models/project.model.js';
import Task from '../src/models/task.model.js';

const prisma = new PrismaClient();

export async function testConnections() {
  console.log('🧪 Testing TaskForge Database Connections...\n');
  
  let postgresOk = false;
  let mongoOk = false;
  
  // Test PostgreSQL Connection
  console.log('📊 Testing PostgreSQL Connection...');
  try {
    await prisma.$connect();
    
    // Test basic operations
    const userCount = await prisma.user.count();
    const notificationCount = await prisma.notification.count();
    
    console.log('✅ PostgreSQL: Connected Successfully');
    console.log(`   └── Database: Connected`);
    console.log(`   └── Users: ${userCount}`);
    console.log(`   └── Notifications: ${notificationCount}`);
    
    // Test analytics tables
    try {
      const userStatsCount = await prisma.userStats.count();
      const projectAnalyticsCount = await prisma.projectAnalytics.count();
      const taskMetricsCount = await prisma.taskMetrics.count();
      
      console.log(`   └── User Stats: ${userStatsCount}`);
      console.log(`   └── Project Analytics: ${projectAnalyticsCount}`);
      console.log(`   └── Task Metrics: ${taskMetricsCount}`);
    } catch {
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
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    const [projectCount, taskCount] = await Promise.all([
      Project.countDocuments(),
      Task.countDocuments()
    ]);
    
    console.log('✅ MongoDB: Connected Successfully');
    console.log(`   └── Database: ${mongoose.connection.name}`);
    console.log(`   └── Collections: ${collectionNames.length > 0 ? collectionNames.join(', ') : 'None'}`);
    console.log(`   └── Projects: ${projectCount}`);
    console.log(`   └── Tasks: ${taskCount}`);
    
    mongoOk = true;
    
  } catch (error) {
    console.log('❌ MongoDB: Connection Failed');
    console.log(`   └── Error: ${error.message}`);
    console.log('   └── Check MONGO_URI in .env file');
    console.log('   └── Ensure MongoDB server is running');
  }
  
  console.log('');
  console.log('📋 Connection Status Summary:');
  console.log(`PostgreSQL (Identity & Analytics): ${postgresOk ? '✅ Ready' : '❌ Failed'}`);
  console.log(`MongoDB (Projects & Tasks): ${mongoOk ? '✅ Ready' : '❌ Failed'}`);
  
  try {
    await prisma.$disconnect();
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  } catch (cleanupError) {
    console.log('⚠️  Error during cleanup:', cleanupError.message);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  testConnections();
}

export default testConnections;
