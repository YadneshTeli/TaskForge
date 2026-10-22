#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import Project from '../src/models/project.model.js';

const prisma = new PrismaClient();

export async function initializeDatabases() {
  console.log('⚡ TaskForge Database Initialization\n');
  
  try {
    console.log('🧪 Testing database connections...');
    await prisma.$connect();
    console.log('✅ PostgreSQL connected');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    
    console.log('\n🔧 Initializing Prisma...');
    try {
      execSync('node node_modules/prisma/build/index.js generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated');
    } catch {
      console.log('⚠️  Prisma generate failed, but continuing...');
    }
    
    console.log('\n📋 Syncing database schema...');
    try {
      execSync('node node_modules/prisma/build/index.js db push', { stdio: 'inherit' });
      console.log('✅ Database schema synced');
    } catch {
      console.log('⚠️  Schema sync skipped');
    }
    
    // Create admin user if doesn't exist
    console.log('\n👤 Setting up admin user...');
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@taskforge.com' }
    });
    
    let adminUser = existingAdmin;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@taskforge.com',
          username: 'admin',
          fullName: 'TaskForge Admin',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
          onboardingCompleted: true
        }
      });
      await prisma.userStats.create({ data: { userId: adminUser.id } });
      console.log('✅ Admin user created (admin@taskforge.com / admin123)');
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
          fullName: 'Test User',
          password: hashedPassword,
          role: 'USER',
          emailVerified: true,
          onboardingCompleted: true
        }
      });
      await prisma.userStats.create({ data: { userId: testUser.id } });
      console.log('✅ Test user created (test@taskforge.com / test123)');
    } else {
      console.log('✅ Test user already exists');
    }
    
    // Create sample project in MongoDB if doesn't exist
    console.log('\n📁 Setting up sample project in MongoDB...');
    if (adminUser) {
      const existingProject = await Project.findOne({ name: 'TaskForge Development' });
      if (!existingProject) {
        const sampleProject = await Project.create({
          name: 'TaskForge Development',
          description: 'Core TaskForge platform development project',
          owner: adminUser.id,
          members: [adminUser.id],
          status: 'active'
        });
        await prisma.projectAnalytics.upsert({
          where: { projectId: sampleProject._id.toString() },
          update: {},
          create: {
            projectId: sampleProject._id.toString(),
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            overdueTasks: 0,
            totalMembers: 1,
            totalComments: 0,
            totalTimeSpent: 0,
            completionRate: 0
          }
        });
        console.log('✅ Sample project created');
      } else {
        console.log('✅ Sample project already exists');
      }
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  initializeDatabases().catch(console.error);
}

export default initializeDatabases;
