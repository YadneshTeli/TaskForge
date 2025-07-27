#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function initializeDatabases() {
  console.log('⚡ TaskForge Database Initialization\n');
  
  try {
    // Test connections first
    console.log('🧪 Testing database connections...');
    
    await prisma.$connect();
    console.log('✅ PostgreSQL connected');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    
    // Initialize Prisma
    console.log('\n🔧 Initializing Prisma...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated');
    } catch (error) {
      console.log('⚠️  Prisma generate failed, but continuing...');
    }
    
    // Run migrations
    console.log('\n📋 Running database migrations...');
    try {
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      console.log('✅ Database migrations completed');
    } catch (error) {
      console.log('⚠️  Migrations may have already been run');
    }
    
    // Create admin user if doesn't exist
    console.log('\n👤 Setting up admin user...');
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@taskforge.com' }
    });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@taskforge.com',
          username: 'admin',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      // Create user stats for admin
      await prisma.userStats.create({
        data: {
          userId: admin.id
        }
      });
      
      console.log('✅ Admin user created');
      console.log('📧 Email: admin@taskforge.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create test user if doesn't exist
    console.log('\n👥 Setting up test user...');
    
    const existingTestUser = await prisma.user.findUnique({
      where: { email: 'test@taskforge.com' }
    });
    
    if (!existingTestUser) {
      const hashedPassword = await bcrypt.hash('test123', 12);
      
      const testUser = await prisma.user.create({
        data: {
          email: 'test@taskforge.com',
          username: 'testuser',
          password: hashedPassword,
          role: 'USER'
        }
      });
      
      // Create user stats for test user
      await prisma.userStats.create({
        data: {
          userId: testUser.id
        }
      });
      
      console.log('✅ Test user created');
      console.log('📧 Email: test@taskforge.com');
      console.log('🔑 Password: test123');
    } else {
      console.log('✅ Test user already exists');
    }
    
    // Create sample project if doesn't exist
    console.log('\n📁 Setting up sample project...');
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@taskforge.com' }
    });
    
    if (adminUser) {
      const existingProject = await prisma.project.findFirst({
        where: { name: 'TaskForge Development' }
      });
      
      if (!existingProject) {
        const sampleProject = await prisma.project.create({
          data: {
            name: 'TaskForge Development',
            ownerId: adminUser.id
          }
        });
        
        // Create project analytics
        await prisma.projectAnalytics.create({
          data: {
            projectId: sampleProject.id,
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            productivityScore: 0.0
          }
        });
        
        console.log('✅ Sample project created');
      } else {
        console.log('✅ Sample project already exists');
      }
    }
    
    // Test MongoDB by creating a simple document
    console.log('\n🧪 Testing MongoDB operations...');
    
    const TestSchema = new mongoose.Schema({
      message: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', TestSchema);
    
    // Clean up any existing test documents
    await TestModel.deleteMany({ message: 'TaskForge initialization test' });
    
    // Create test document
    const testDoc = await TestModel.create({
      message: 'TaskForge initialization test'
    });
    
    console.log('✅ MongoDB operations working');
    
    // Clean up test document
    await TestModel.deleteMany({ message: 'TaskForge initialization test' });
    
    // Display status
    console.log('\n📊 Database Status:');
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`👥 PostgreSQL Users: ${userCount}`);
    console.log(`📁 PostgreSQL Projects: ${projectCount}`);
    console.log(`🍃 MongoDB Collections: ${collections.length}`);
    
    console.log('\n🎉 Database initialization completed successfully!');
    
    console.log('\n📧 Available login credentials:');
    console.log('Admin: admin@taskforge.com / admin123');
    console.log('Test User: test@taskforge.com / test123');
    
    console.log('\n🚀 Your databases are ready for development!');
    console.log('\n🎯 Next steps:');
    console.log('1. Seed with sample data: npm run smart-seed');
    console.log('2. Start development server: npm run dev');
    console.log('3. Test API endpoints');
    console.log('4. Start building features!');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file configuration');
    console.log('2. Ensure databases are running and accessible');
    console.log('3. Verify connection strings are correct');
    console.log('4. Run: npm run db:test');
    
    throw error;
  } finally {
    await prisma.$disconnect();
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabases().catch(console.error);
}

module.exports = initializeDatabases;
