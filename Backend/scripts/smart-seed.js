import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import Project from '../src/models/project.model.js';
import Task from '../src/models/task.model.js';
import Log from '../src/models/log.model.js';

const prisma = new PrismaClient();

export async function smartSeedDatabases() {
  try {
    console.log('🌱 Smart seeding TaskForge databases...\n');
    
    await prisma.$connect();
    await mongoose.connect(process.env.MONGO_URI);
    
    const existingUsers = await prisma.user.findMany();
    console.log(`📊 Found ${existingUsers.length} existing users`);
    
    const additionalUsers = [
      {
        email: 'john@taskforge.com', 
        username: 'john_doe',
        fullName: 'John Doe',
        password: 'user123',
        role: 'USER'
      },
      {
        email: 'jane@taskforge.com',
        username: 'jane_smith', 
        fullName: 'Jane Smith',
        password: 'user123',
        role: 'USER'
      },
      {
        email: 'mike@taskforge.com',
        username: 'mike_wilson',
        fullName: 'Mike Wilson',
        password: 'user123',
        role: 'USER'
      }
    ];
    
    console.log('\n👥 Adding additional users...');
    const allUsers = [...existingUsers];
    
    for (const userData of additionalUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (!existing) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            username: userData.username,
            fullName: userData.fullName,
            password: hashedPassword,
            role: userData.role,
            emailVerified: true,
            onboardingCompleted: true
          }
        });
        
        await prisma.userStats.create({
          data: {
            userId: user.id,
            totalTasksCreated: Math.floor(Math.random() * 20),
            totalTasksCompleted: Math.floor(Math.random() * 15),
            totalTasksPending: Math.floor(Math.random() * 10),
            totalProjectsOwned: Math.floor(Math.random() * 3),
            totalTimeSpent: Math.floor(Math.random() * 1000) + 100,
            avgCompletionTime: 120 + Math.random() * 180
          }
        });
        
        allUsers.push(user);
        console.log(`✅ User created: ${userData.email}`);
      } else {
        allUsers.push(existing);
        console.log(`⏭️  User exists: ${userData.email}`);
      }
    }
    
    // Create additional projects in MongoDB
    console.log('\n📁 Creating additional projects in MongoDB...');
    const sampleProjects = [
      {
        name: 'TaskForge Mobile App',
        description: 'Flutter mobile application development'
      },
      {
        name: 'Marketing Campaign Q4',
        description: 'Q4 marketing campaign planning and execution'
      },
      {
        name: 'API Documentation',
        description: 'Comprehensive API documentation and guides'
      }
    ];
    
    const allProjects = await Project.find();
    
    for (let i = 0; i < sampleProjects.length; i++) {
      const projectData = sampleProjects[i];
      const owner = allUsers[i % allUsers.length];
      
      const existing = await Project.findOne({ name: projectData.name });
      
      if (!existing) {
        const project = await Project.create({
          name: projectData.name,
          description: projectData.description,
          owner: owner.id,
          members: [owner.id],
          status: 'active'
        });
        
        const taskCount = Math.floor(Math.random() * 15) + 5;
        const completedTasks = Math.floor(taskCount * 0.6);
        const pendingTasks = taskCount - completedTasks;
        
        await prisma.projectAnalytics.upsert({
          where: { projectId: project._id.toString() },
          update: {},
          create: {
            projectId: project._id.toString(),
            totalTasks: taskCount,
            completedTasks: completedTasks,
            pendingTasks: pendingTasks,
            inProgressTasks: Math.floor(pendingTasks * 0.3),
            totalMembers: 1,
            totalTimeSpent: Math.floor(Math.random() * 2000) + 500,
            avgTaskCompletionTime: 90 + Math.random() * 120,
            productivityScore: 70 + Math.random() * 25,
            completionRate: Math.round((completedTasks / taskCount) * 100)
          }
        });
        
        allProjects.push(project);
        console.log(`✅ Project created: ${projectData.name}`);
      } else {
        console.log(`⏭️  Project exists: ${projectData.name}`);
      }
    }
    
    // Create comprehensive tasks in MongoDB
    console.log('\n✅ Creating comprehensive tasks...');
    const sampleTasks = [
      {
        title: 'Design Database Schema',
        description: 'Create comprehensive database schema for TaskForge with analytics tables',
        status: 'done',
        priority: 'high',
        tags: ['database', 'backend']
      },
      {
        title: 'Implement JWT Authentication',
        description: 'Set up secure JWT-based authentication system with refresh tokens',
        status: 'done',
        priority: 'high',
        tags: ['auth', 'security', 'backend']
      },
      {
        title: 'Build Flutter Task Management UI',
        description: 'Create intuitive task management interface with BLoC pattern',
        status: 'in-progress',
        priority: 'high',
        tags: ['flutter', 'ui', 'mobile']
      },
      {
        title: 'Create Project Analytics Dashboard',
        description: 'Build comprehensive analytics dashboard with charts and metrics',
        status: 'todo',
        priority: 'medium',
        tags: ['analytics', 'dashboard', 'frontend']
      }
    ];
    
    const currentProjects = await Project.find();
    
    for (let i = 0; i < sampleTasks.length; i++) {
      const taskData = sampleTasks[i];
      const project = currentProjects[i % currentProjects.length];
      const assignee = allUsers[i % allUsers.length];
      
      const existingTask = await Task.findOne({ title: taskData.title });
      
      if (!existingTask && project) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 1);
        
        const task = await Task.create({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          projectId: project._id,
          assignedTo: assignee.id,
          createdBy: assignee.id,
          dueDate: dueDate,
          tags: taskData.tags
        });
        
        await prisma.taskMetrics.upsert({
          where: { taskId: task._id.toString() },
          update: {},
          create: {
            taskId: task._id.toString(),
            projectId: project._id.toString(),
            status: task.status,
            userId: assignee.id,
            timeSpent: Math.floor(Math.random() * 300),
            completedAt: task.status === 'done' ? new Date() : null
          }
        });
        
        console.log(`✅ Task created: ${taskData.title}`);
      } else {
        console.log(`⏭️  Task exists: ${taskData.title}`);
      }
    }
    
    // Create notifications
    console.log('\n🔔 Creating notifications...');
    const notificationTypes = [
      { content: 'New task assigned to you: Design Database Schema', seen: false, type: 'task_assigned' },
      { content: 'Task completed: JWT Authentication Implementation', seen: true, type: 'task_completed' },
      { content: 'Project deadline approaching: TaskForge Mobile App', seen: false, type: 'task_due_soon' }
    ];
    
    for (const user of allUsers) {
      const existingNotifications = await prisma.notification.findMany({
        where: { userId: user.id }
      });
      
      if (existingNotifications.length < 3) {
        for (const notif of notificationTypes) {
          await prisma.notification.create({
            data: {
              content: notif.content,
              type: notif.type,
              seen: notif.seen,
              userId: user.id
            }
          });
        }
        console.log(`✅ Notifications created for: ${user.username}`);
      }
    }
    
    // Create activity logs in MongoDB
    console.log('\n📝 Creating activity logs in MongoDB...');
    const logActions = [
      'Task "Design Database Schema" created',
      'Task "JWT Authentication" completed', 
      'Project "TaskForge Mobile App" created'
    ];
    
    for (const project of currentProjects) {
      const existingLogsCount = await Log.countDocuments({ projectId: project._id });
      if (existingLogsCount < 3) {
        for (const action of logActions) {
          await Log.create({
            action,
            projectId: project._id
          });
        }
      }
    }
    
    console.log('\n🎉 Smart database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Smart seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  smartSeedDatabases().catch(console.error);
}

export default smartSeedDatabases;
