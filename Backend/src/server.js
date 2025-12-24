import 'dotenv/config';

// Validate environment variables before proceeding
import validateEnv from './config/validateEnv.js';
validateEnv();

import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import connectMongo from './config/db.js';
import typeDefs from './schema/index.js';
import getResolvers from './resolvers/index.js';
import * as authMiddleware from './middleware/auth.middleware.js';
import rateLimit from './middleware/rateLimit.middleware.js';
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';
import securityMiddleware from './middleware/security.middleware.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import reportRoutes from './routes/report.routes.js';
import projectRoutes from './routes/project.routes.js';
import adminRoutes from './routes/admin.routes.js';
import taskRoutes from './routes/task.routes.js';
import commentRoutes from './routes/comment.routes.js';
import userRoutes from './routes/user.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

const app = express();

// Get allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4000"
    ];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all origins during development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Body parser with size limits to prevent DoS attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(graphqlUploadExpress());
app.use(authMiddleware.decodeToken);
app.use(rateLimit);
securityMiddleware(app);

app.use("/api/auth", authRoutes);
app.use("/api/file", uploadRoutes);

// Enhanced health check endpoint with comprehensive system checks
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'TaskForge Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    checks: {}
  };

  // Check MongoDB connection
  try {
    const mongoState = mongoose.connection.readyState;
    const db = mongoose.connection.db;
    
    // Perform a simple query to verify connectivity
    let queryTime = null;
    if (mongoState === 1 && db) {
      const queryStart = Date.now();
      await db.admin().ping();
      queryTime = Date.now() - queryStart;
    }

    health.checks.mongodb = {
      status: mongoState === 1 ? 'healthy' : 'unhealthy',
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState],
      host: db?.databaseName || 'unknown',
      responseTime: queryTime ? `${queryTime}ms` : null
    };
  } catch (error) {
    health.checks.mongodb = {
      status: 'error',
      error: error.message
    };
  }

  // Check PostgreSQL/Prisma connection
  try {
    const prisma = new PrismaClient();
    const queryStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const queryTime = Date.now() - queryStart;
    
    // Get database statistics
    const userCount = await prisma.user.count();
    
    health.checks.postgresql = {
      status: 'healthy',
      responseTime: `${queryTime}ms`,
      stats: {
        userCount
      }
    };
    await prisma.$disconnect();
  } catch (error) {
    health.checks.postgresql = {
      status: 'error',
      error: error.message
    };
  }

  // Check Cloudinary configuration
  try {
    const cloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    
    health.checks.cloudinary = {
      status: cloudinaryConfigured ? 'configured' : 'not_configured',
      configured: cloudinaryConfigured
    };
  } catch (error) {
    health.checks.cloudinary = {
      status: 'error',
      error: error.message
    };
  }

  // Check disk space for uploads and reports
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const reportsDir = path.join(process.cwd(), 'reports');
    
    health.checks.storage = {
      status: 'healthy',
      uploads: fs.existsSync(uploadsDir) ? 'available' : 'not_created',
      reports: fs.existsSync(reportsDir) ? 'available' : 'not_created'
    };
  } catch (error) {
    health.checks.storage = {
      status: 'error',
      error: error.message
    };
  }

  // Check environment variables
  const requiredEnvVars = [
    'MONGO_URI',
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  health.checks.environment = {
    status: missingEnvVars.length === 0 ? 'healthy' : 'warning',
    required: requiredEnvVars.length,
    missing: missingEnvVars.length > 0 ? missingEnvVars : undefined
  };

  // Check API response time
  const totalTime = Date.now() - startTime;
  health.responseTime = `${totalTime}ms`;

  // Determine overall health status
  const criticalServices = ['mongodb', 'postgresql'];
  const criticalHealthy = criticalServices.every(
    service => health.checks[service]?.status === 'healthy'
  );
  
  const hasErrors = Object.values(health.checks).some(
    check => check.status === 'error'
  );

  if (!criticalHealthy || hasErrors) {
    health.status = 'UNHEALTHY';
  } else if (health.checks.environment?.status === 'warning') {
    health.status = 'DEGRADED';
  } else {
    health.status = 'HEALTHY';
  }
  
  // Return appropriate status code
  const statusCode = health.status === 'HEALTHY' ? 200 : 
                     health.status === 'DEGRADED' ? 200 : 503;
  
  res.status(statusCode).json(health);
});

// Simple readiness probe (Kubernetes-friendly)
app.get('/health/ready', async (req, res) => {
  try {
    const mongoReady = mongoose.connection.readyState === 1;
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    if (mongoReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not_ready' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: error.message });
  }
});

// Simple liveness probe (Kubernetes-friendly)
app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: process.uptime(),
        memory: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          unit: 'MB'
        },
        cpu: process.cpuUsage()
      },
      database: {
        mongodb: {
          state: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      }
    };

    // Get Prisma stats
    try {
      const prisma = new PrismaClient();
      const [userCount, projectCount, taskCount] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.taskMetrics.count()
      ]);
      
      metrics.database.postgresql = {
        userCount,
        projectCount,
        taskCount
      };
      
      await prisma.$disconnect();
    } catch (error) {
      metrics.database.postgresql = { error: error.message };
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple endpoint to test connectivity
app.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'TaskForge API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/project',
      tasks: '/api/tasks',
      comments: '/api/comments',
      files: '/api/file',
      reports: '/api/report',
      admin: '/api/admin',
      health: '/api/health',
      graphql: '/graphql'
    }
  });
});

app.use("/api/report", reportRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 handler for undefined routes (must be after all other routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

async function start() {
    try {
        // Load resolvers with GraphQLUpload
        const resolvers = await getResolvers();
        
        // Create ApolloServer with loaded resolvers
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            context: ({ req }) => ({ user: req.user }),
            formatError: (error) => {
                // Log GraphQL errors
                console.error('GraphQL Error:', {
                    message: error.message,
                    path: error.path,
                    extensions: error.extensions
                });
                
                // Don't expose internal server errors in production
                if (process.env.NODE_ENV === 'production' && 
                    error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
                    return {
                        message: 'An unexpected error occurred',
                        extensions: {
                            code: error.extensions.code
                        }
                    };
                }
                
                return error;
            }
        });
        
        await connectMongo();
        await server.start();
        server.applyMiddleware({ app });

        // Listen on all interfaces (0.0.0.0) instead of just localhost
        const PORT = process.env.PORT || 4000;
        const serverInstance = app.listen(PORT, '0.0.0.0', () => {
            console.log("🚀 Server ready at:");
            console.log(`   📍 Local: http://localhost:${PORT}/graphql`);
            console.log(`   🌐 REST API: http://localhost:${PORT}/api`);
            console.log(`   📱 Network: Server accessible on all network interfaces on port ${PORT}`);
        });

        // Graceful shutdown handling
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);
            
            serverInstance.close(async () => {
                console.log('HTTP server closed');
                
                try {
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed');
                    
                    await new PrismaClient().$disconnect();
                    console.log('Prisma connection closed');
                    
                    console.log('Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    console.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forcing shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('Fatal error during server startup:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error('Error:', error.name, error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION! 💥');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    // In production, you might want to exit the process
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

start();
