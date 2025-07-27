const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function smartSeedDatabases() {
  try {
    console.log('🌱 Smart seeding TaskForge databases...\n');
    
    // Connect to databases
    await prisma.$connect();
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get existing users
    const existingUsers = await prisma.user.findMany();
    console.log(`📊 Found ${existingUsers.length} existing users`);
    
    // Create additional users if needed
    const additionalUsers = [
      {
        email: 'john@taskforge.com', 
        username: 'john_doe',
        password: 'user123',
        role: 'USER'
      },
      {
        email: 'jane@taskforge.com',
        username: 'jane_smith', 
        password: 'user123',
        role: 'USER'
      },
      {
        email: 'mike@taskforge.com',
        username: 'mike_wilson',
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
            password: hashedPassword,
            role: userData.role
          }
        });
        
        // Create user stats
        await prisma.userStats.create({
          data: {
            userId: user.id,
            totalTasksCreated: Math.floor(Math.random() * 20),
            totalTasksCompleted: Math.floor(Math.random() * 15),
            totalTasksPending: Math.floor(Math.random() * 10),
            totalProjectsOwned: Math.floor(Math.random() * 3),
            totalTimeSpent: Math.floor(Math.random() * 1000) + 100,
            avgTaskCompletionTime: 120 + Math.random() * 180
          }
        });
        
        allUsers.push(user);
        console.log(`✅ User created: ${userData.email}`);
      } else {
        allUsers.push(existing);
        console.log(`⏭️  User exists: ${userData.email}`);
      }
    }
    
    // Create additional projects
    console.log('\n📁 Creating additional projects...');
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
    
    const allProjects = await prisma.project.findMany();
    
    for (let i = 0; i < sampleProjects.length; i++) {
      const projectData = sampleProjects[i];
      const owner = allUsers[i % allUsers.length];
      
      const existing = await prisma.project.findFirst({
        where: { name: projectData.name }
      });
      
      if (!existing) {
        const project = await prisma.project.create({
          data: {
            name: projectData.name,
            ownerId: owner.id
          }
        });
        
        // Create project analytics
        const taskCount = Math.floor(Math.random() * 15) + 5;
        const completedTasks = Math.floor(taskCount * 0.6);
        const pendingTasks = taskCount - completedTasks;
        
        await prisma.projectAnalytics.create({
          data: {
            projectId: project.id,
            totalTasks: taskCount,
            completedTasks: completedTasks,
            pendingTasks: pendingTasks,
            inProgressTasks: Math.floor(pendingTasks * 0.3),
            totalMembers: Math.floor(Math.random() * 5) + 2,
            totalTimeSpent: Math.floor(Math.random() * 2000) + 500,
            avgTaskCompletionTime: 90 + Math.random() * 120,
            productivityScore: 70 + Math.random() * 25
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
    
    const TaskSchema = new mongoose.Schema({
      title: String,
      description: String,
      status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
      priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
      projectId: String,
      assignedTo: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      dueDate: Date,
      tags: [String],
      attachments: [String],
      comments: [{
        userId: String,
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
      }]
    });
    
    const Task = mongoose.model('Task', TaskSchema);
    
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
        title: 'Setup Real-time Notifications',
        description: 'Implement WebSocket notifications for real-time updates',
        status: 'in-progress',
        priority: 'medium',
        tags: ['websocket', 'notifications', 'realtime']
      },
      {
        title: 'Create Project Analytics Dashboard',
        description: 'Build comprehensive analytics dashboard with charts and metrics',
        status: 'todo',
        priority: 'medium',
        tags: ['analytics', 'dashboard', 'frontend']
      },
      {
        title: 'Write API Documentation',
        description: 'Document all API endpoints with examples and Postman collection',
        status: 'todo',
        priority: 'low',
        tags: ['documentation', 'api']
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure automated testing and deployment pipeline',
        status: 'todo',
        priority: 'medium',
        tags: ['devops', 'ci-cd', 'automation']
      },
      {
        title: 'Mobile App Beta Testing',
        description: 'Conduct comprehensive beta testing with user feedback collection',
        status: 'todo',
        priority: 'high',
        tags: ['testing', 'mobile', 'qa']
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize database queries and API response times',
        status: 'todo',
        priority: 'medium',
        tags: ['performance', 'optimization', 'backend']
      },
      {
        title: 'Security Audit',
        description: 'Comprehensive security audit and penetration testing',
        status: 'todo',
        priority: 'high',
        tags: ['security', 'audit', 'testing']
      }
    ];
    
    const currentProjects = await prisma.project.findMany();
    
    for (let i = 0; i < sampleTasks.length; i++) {
      const taskData = sampleTasks[i];
      const project = currentProjects[i % currentProjects.length];
      const assignee = allUsers[Math.floor(Math.random() * allUsers.length)];
      
      const existingTask = await Task.findOne({ title: taskData.title });
      
      if (!existingTask) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 1);
        
        const task = await Task.create({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          projectId: project.id.toString(),
          assignedTo: assignee.id.toString(),
          dueDate: dueDate,
          tags: taskData.tags,
          comments: [
            {
              userId: assignee.id.toString(),
              username: assignee.username,
              text: `Started working on ${taskData.title}. Setting up initial requirements.`,
              createdAt: new Date()
            }
          ]
        });
        
        // Create task metrics in PostgreSQL
        await prisma.taskMetrics.create({
          data: {
            taskId: task._id.toString(),
            projectId: project.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assignedTo: assignee.id,
            timeSpent: Math.floor(Math.random() * 300),
            dueDate: task.dueDate,
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
      { content: 'New task assigned to you: Design Database Schema', seen: false },
      { content: 'Task completed: JWT Authentication Implementation', seen: true },
      { content: 'Project deadline approaching: TaskForge Mobile App', seen: false },
      { content: 'New comment on your task: Flutter UI Development', seen: false },
      { content: 'You were added to project: Marketing Campaign Q4', seen: true },
      { content: 'Task overdue: API Documentation', seen: false },
      { content: 'Weekly summary: 5 tasks completed this week', seen: true }
    ];
    
    for (const user of allUsers) {
      const existingNotifications = await prisma.notification.findMany({
        where: { userId: user.id }
      });
      
      if (existingNotifications.length < 3) {
        const notificationsToAdd = notificationTypes.slice(0, 3);
        
        for (const notif of notificationsToAdd) {
          await prisma.notification.create({
            data: {
              content: notif.content,
              seen: notif.seen,
              userId: user.id
            }
          });
        }
        console.log(`✅ Notifications created for: ${user.username}`);
      } else {
        console.log(`⏭️  Notifications exist for: ${user.username}`);
      }
    }
    
    // Create activity logs
    console.log('\n📝 Creating activity logs...');
    
    const logActions = [
      'Task "Design Database Schema" created',
      'Task "JWT Authentication" completed', 
      'Task "Flutter UI" updated to in-progress',
      'Project "TaskForge Mobile App" created',
      'User john_doe joined project',
      'Comment added to task "Real-time Notifications"',
      'Task "Performance Optimization" assigned to jane_smith',
      'Project analytics updated for Q4 campaign'
    ];
    
    for (const project of currentProjects) {
      const existingLogs = await prisma.log.findMany({
        where: { projectId: project.id }
      });
      
      if (existingLogs.length < 5) {
        for (let i = 0; i < 5; i++) {
          await prisma.log.create({
            data: {
              action: logActions[Math.floor(Math.random() * logActions.length)],
              projectId: project.id
            }
          });
        }
        console.log(`✅ Activity logs created for: ${project.name}`);
      } else {
        console.log(`⏭️  Activity logs exist for: ${project.name}`);
      }
    }
    
    // Final statistics
    console.log('\n📊 Final Database Statistics:');
    
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const taskCount = await Task.countDocuments();
    const notificationCount = await prisma.notification.count();
    const logCount = await prisma.log.count();
    const userStatsCount = await prisma.userStats.count();
    const projectAnalyticsCount = await prisma.projectAnalytics.count();
    const taskMetricsCount = await prisma.taskMetrics.count();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`📁 Projects: ${projectCount}`);
    console.log(`✅ Tasks (MongoDB): ${taskCount}`);
    console.log(`🔔 Notifications: ${notificationCount}`);
    console.log(`📝 Activity Logs: ${logCount}`);
    console.log(`📊 User Stats: ${userStatsCount}`);
    console.log(`📈 Project Analytics: ${projectAnalyticsCount}`);
    console.log(`⏱️  Task Metrics: ${taskMetricsCount}`);
    
    console.log('\n🎉 Smart database seeding completed successfully!');
    console.log('\n📧 Available login credentials:');
    console.log('Admin: admin@taskforge.com / admin123');
    console.log('User: test@taskforge.com / test123');
    console.log('User: john@taskforge.com / user123');
    console.log('User: jane@taskforge.com / user123');
    console.log('User: mike@taskforge.com / user123');
    
    console.log('\n🚀 Your TaskForge databases are now fully populated!');
    console.log('Ready to start development: npm run dev');
    
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
  smartSeedDatabases().catch(console.error);
}

module.exports = smartSeedDatabases;
